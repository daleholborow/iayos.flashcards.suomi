/// <reference path='./my-app.ts' />
/// <reference path='./model.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />


interface IDatastore {
    //storeKey: string;
    
    activeDeckId: string;

    activeCardId: string;

    decks: dtos.DeckDto[];
}

class DummyDatastore implements IDatastore {
    public activeDeckId: string;
    public activeCardId: string;
    public decks: dtos.DeckDto[];
}

/* 
    Local storage container
*/
class Datastore implements IDatastore {

    static storeKey: string = "ssLocalStore";
    
    // activeDeckId: string = null;

    // activeCardId: string = null;

    // decks: dtos.DeckDto[] = [];

    get activeCardId() : string { return this.initData.activeCardId; }
    set activeCardId(activeCardId: string) { this.initData.activeCardId = activeCardId; }
    get activeDeckId() : string {return this.initData.activeDeckId;}
    set activeDeckId(activeDeckId: string) { this.initData.activeDeckId = activeDeckId; }
    get decks() : dtos.DeckDto[] { return this.initData.decks; }
    
    constructor(private initData : IDatastore) {
    }


    addOrUpdateDeck(deck : dtos.DeckDto) {
        let existingDeck = this.decks.find(x => x.deckId === deck.deckId);
        //console.log("did we find the deck?", existingDeck);
        if (existingDeck === undefined) {
            this.decks.push(deck);
            // console.log("pushed to decdk collection");
        }
    }


    getActiveDeck() : dtos.DeckDto {
        let deck = this.decks.find(x => x.deckId === this.activeDeckId);
        return deck;
    }


    static getStore(): Datastore {
        let localStore: Datastore;
        console.log("trying to get store");
        if (localStorage.getItem(this.storeKey) === null) {
            console.log("store doesnt exist already, create and save now");
            localStore = new Datastore(new DummyDatastore());
            this.saveStore();
        }
        else {
            console.log("the local stored item is", localStorage.getItem(this.storeKey));
            console.log("and the json parsed obj is", JSON.parse(localStorage.getItem(this.storeKey)));

            localStore = new Datastore(JSON.parse(localStorage.getItem(this.storeKey)));
            console.log("loaded store from localstorage", this);
        }
        return localStore;
    }

    
    static saveStore(): void {
        console.log("about to save store");
        localStorage.setItem(this.storeKey, JSON.stringify(this));
        console.log("store saved");
	}
}

var mySS = (function () {

    const applicationId = "0d467630-dcab-4883-a754-d2a107442e56";
    const client = new ss.JsonServiceClient("http://flashcardapi.eladaus.com/api");
    let datastore = Datastore.getStore();

    const DeckAccordionItemTemplate = (dto: dtos.DeckDto) => {
        // console.log("in here", dto);
        return `
            <li class="item-content">
                <div class="item-inner">
                <div class="item-title"><a href="#" onclick="mySS.BuildAndGoToCardsPage('${dto.deckId}');return false;" >${dto.name}</a></div>
                <div class="item-after"><span class="badge">${dto.numberOfCards} cards</span></div>
                </div>
            </li>
        `;
    };

    const DeckCategoryAccordionTemplate = (dto: dtos.DeckCategoryDto) => {
        let deckAccordionItems = dto.decks.map(DeckAccordionItemTemplate).join('');
        return `
        <div class="accordion-item">
            <div class="accordion-item-toggle">
                <i class="icon icon-plus">+</i>
                <i class="icon icon-minus">-</i>
                <span>${dto.name}</span>
            </div>
            <div class="accordion-item-content">
                <div class="list-block">
                    <ul>
                    ${deckAccordionItems}
                    </ul>
                </div>
            </div>
        </div>
        `;
    };

    function BuildAndGoToDeckCategoriesPage() {
        console.log("Get deck categories for application and go deck categories page");
        QueryDeckCategories(applicationId).then(response => {
            $("#deckCategoryList").html(response.results.map(DeckCategoryAccordionTemplate).join(''));
        });
    }

    function BuildAndGoToCardsPage(deckId: string) {
        console.log("Get deck with cards and go to flashcard page");

        QueryDeckWithCards(deckId).then(response => {
            SetSelectedDeck(deckId);
            console.log(response.result);
            datastore.addOrUpdateDeck(response.result);
            console.log("now decks are:", datastore.decks);
            mainView.router.load({ url: 'flashcards.html' });
        });
    }

    function SetSelectedDeck(deckId: string) {
        console.log("setting active deck from " + datastore.activeDeckId + " to " + deckId);
        datastore.activeDeckId = deckId;
        datastore.activeCardId = null;
        console.log("active deck is now " + datastore.activeDeckId);
    }


    myApp.onPageInit('about', function (page) {
        console.log('going to the about page' + Date.now());
    });

    myApp.onPageInit('contact', function (page) {
        console.log('going o viewcontact us' + Date.now());
    });

    myApp.onPageInit('deckcategories', function (page) {
        console.log('going o view deck categories' + Date.now());
        BuildAndGoToDeckCategoriesPage();
    });

    myApp.onPageInit('flashcards', function (page) {
        console.log('going to to flashcards for deck now at ' + Date.now());

        let activeDeck = datastore.getActiveDeck();
        console.log("active deck is", activeDeck);
        $("#page-deck-header").html(datastore.getActiveDeck().name); 

        // Always set to unflipped initially and configure mode
        let flashcard = FindFlashcardDiv();
        flashcard.flip({
            trigger: 'manual',
            reverse: true
        });
        //let flipModel = flashcard.data('flip-model');
    });

    // myApp.onPageBeforeAnimation('flashcards', function (page) {
    //     let flashcard = $("#card");
    //     let flipModel = flashcard.data('flip-model');
    //     console.log("does it have a model?", flipModel);
    //     flashcard.flip({
    //         trigger: 'manual'
    //     });
    //     flipModel = flashcard.data('flip-model');
    //     // Always set to unflipped initially
    // 	// var flip = $("#card").data("flip-model");
    // 	// $("#card").flip(false);
    //     console.log("going to flashcard onPageBeforeAnimation", flashcard, flipModel);
    // });

    const QueryDeckCategories = async (applicationId: string) => {
        let request = new dtos.ListDeckCategoriesByApplicationRequest();
        request.applicationId = applicationId;
        try {
            const response = await client.get(request)
            return response;
        } catch (err) {
            console.log(err)
        }
    }

    const QueryDeckWithCards = async (deckId: string) => {
        let request = new dtos.GetDeckRequest();
        request.applicationId = applicationId;
        request.deckId = deckId;
        try {
            const response = await client.get(request)
            return response;
        } catch (err) {
            console.log(err)
        }
    }


    function FlipFlashcardToBack() {
        let flipItDiv = FindFlipItDiv();
        let flashcard = FindFlashcardDiv();
        flashcard.flip(true);
        flipItDiv.hide();
    }


    function FindFlashcardDiv() {
        let flashcard = $("#card");
        return flashcard;
    }


    function FindFlipItDiv() {
        let flipItDiv = $("#flipItDiv");
        return flipItDiv;
    }

    return {

        BuildAndGoToCardsPage: BuildAndGoToCardsPage,
        FlipFlashcardToBack: FlipFlashcardToBack


        // doSomeStuff: function (elId: string) {

        //     let flashcard = $("#card");
        //     let flipModel = flashcard.data('flip-model');
        //     console.log("after flipping the flipmodel is", flipModel);

        //     console.log("blah blah do some stuff to ", elId);
        //     let flipTarget = $("#"+elId);
        //     // flipTarget.addClass('animated flip');
        //     // flipTarget.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeClass)
        //     flipTarget.flip();

        //     flipTarget.flip('toggle');
        // },
    }

})();