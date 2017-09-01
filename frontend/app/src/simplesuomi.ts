/// <reference path='./my-app.ts' />
/// <reference path='./model.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />


/* 
    Local storage container
*/
class LocalStore {

    storeKey: string = "ssLocalStore";
    
    activeDeckId: string = null;

    activeCardId: string = null;

    decks: dtos.DeckDto[] = [];

    constructor() {
    }

    getStore(): LocalStore {
        let localStore: LocalStore;
        console.log("trying to get store");
        if (localStorage.getItem(this.storeKey) === null) {
            console.log("store doesnt exist already, create and save now");
            localStore = new LocalStore();
            this.saveStore();
        }
        else {
            localStore = JSON.parse(localStorage.getItem(this.storeKey));
            console.log("loaded store from localstorage", this);
        }
        return localStore;
    }

    saveStore(): void {
        console.log("about to save store");
        localStorage.setItem(this.storeKey, JSON.stringify(this));
        console.log("store saved");
	}
}

var mySS = (function () {

    const applicationId = "0d467630-dcab-4883-a754-d2a107442e56";
    const client = new ss.JsonServiceClient("http://flashcardapi.eladaus.com/api");
    let localStore = new LocalStore().getStore();

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

        SetSelectedDeck(deckId);

        QueryDeckWithCards(localStore.activeDeckId).then(response => {
            console.log(response.result);
            mainView.router.load({ url: 'flashcards.html' });
        });
    }

    function SetSelectedDeck(deckId: string) {
        console.log("setting active deck from " + localStore.activeDeckId + " to " + deckId);
        localStore.activeDeckId = deckId;
        console.log("active deck is now " + localStore.activeDeckId);
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