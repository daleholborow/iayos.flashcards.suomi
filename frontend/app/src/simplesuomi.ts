/// <reference path='./my-app.ts' />
/// <reference path='./model.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />


interface IDatastore {
    activeDeckId: string;
    activeCardId: string;
    decks: dtos.DeckDto[];
}

class DummyDatastore implements IDatastore {
    public activeDeckId: string = null;
    public activeCardId: string = null;
    public decks: dtos.DeckDto[] = [];
}

/* 
    Local storage container
*/
class Datastore implements IDatastore {

    static storeKey: string = "ssLocalStore";
    
    get activeCardId() : string { return this.initData.activeCardId; }
    set activeCardId(activeCardId: string) { this.initData.activeCardId = activeCardId; Datastore.saveStore(this); }
    get activeDeckId() : string {return this.initData.activeDeckId;}
    set activeDeckId(activeDeckId: string) { this.initData.activeDeckId = activeDeckId; Datastore.saveStore(this); }
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
        Datastore.saveStore(this);
    }


    getActiveDeck() : dtos.DeckDto {
        let deck = this.decks.find(x => x.deckId === this.activeDeckId);
        return deck;
    }


    static getStore(): Datastore {
        let localStore: Datastore;
        let currentLocalStorage = localStorage.getItem(this.storeKey);
        // console.log("so local data is set to", currentLocalStorage);
        if (currentLocalStorage) {
            // console.log("and the json parsed obj is", JSON.parse(localStorage.getItem(this.storeKey)));
            localStore = new Datastore(JSON.parse(currentLocalStorage));
            // console.log("loaded store from localstorage", localStore);
        }
        else {
            // console.log("store doesnt exist already, create and save now");
            localStore = new Datastore(new DummyDatastore());
            Datastore.saveStore(localStore);
        }
        return localStore;
    }


    static saveStore(datastore : Datastore): void {
        // console.log("about to save store"); 
        localStorage.setItem(this.storeKey, JSON.stringify(datastore.initData));
        // console.log("store saved and is now", localStorage.getItem(this.storeKey));
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
            // console.log(response.result);
            datastore.addOrUpdateDeck(response.result);
            // console.log("now decks are:", datastore.decks);
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
        // console.log("active deck is", activeDeck);
        $("#pgFlashcardsTitle").html(datastore.getActiveDeck().name); 

        // Always set to unflipped initially and configure mode
        let flashcard = FindFlashcardDiv();
        flashcard.flip({
            trigger: 'manual',
            reverse: true
        });
        //let flipModel = flashcard.data('flip-model');

        RenderRandomCardFromDeck(activeDeck);
    });


    function RenderRandomCardFromDeck(deck : dtos.DeckDto) : void {
        
        // always set card to unflipped initially
        FlipFlashcardToFront();

        // sometimes show the front, sometimes show the back
		let isInFrontMode : boolean = Math.random() >= 0.5;
		console.log("isInFrontMode:" + isInFrontMode);

		let usedCardIndices: number[] = [];

		let randomCardIndex = GetRandomCardIndex(deck, usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		let card1 = deck.cards[randomCardIndex];
		$("#answer1").html(GetFaceTextByMode(isInFrontMode, card1));
		$("#answer1").data("answer-card-id", card1.cardId);

		randomCardIndex = GetRandomCardIndex(deck, usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		let card2 = deck.cards[randomCardIndex];
		$("#answer2").html(GetFaceTextByMode(isInFrontMode, card2));
		$("#answer2").data("answer-card-id", card2.cardId);

		randomCardIndex = GetRandomCardIndex(deck, usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		let card3 = deck.cards[randomCardIndex];
		$("#answer3").html(GetFaceTextByMode(isInFrontMode, card3));
		$("#answer3").data("answer-card-id", card3.cardId);

		// which one to use as the front?
		let currentCardIndex = usedCardIndices[Math.floor(Math.random() * usedCardIndices.length)];
		console.log("current card index is" + currentCardIndex);
		let currentCard = deck.cards[currentCardIndex];
		datastore.activeCardId = currentCard.cardId;
		$("#frontText").text(GetFaceTextByMode(!isInFrontMode, currentCard));
		$("#backText").text(GetFaceTextByMode(!isInFrontMode, currentCard));
    }


    function ChooseAnswer(caller: any, cardId : string) : void {
        console.log("choosing an answer", caller, cardId);
        let chosenAnswerId = $(caller).data("answer-card-id");
        console.log("chose the card with id", chosenAnswerId);

        let isCorrectAnswer : boolean = (datastore.activeCardId === chosenAnswerId);

        if (isCorrectAnswer) {
            // animate a happy thing
            RenderRandomCardFromDeck(datastore.getActiveDeck());
        }
        else {
            // animate a sad thing
            ShakeDiv(FindFlashcardDiv());
        }
    }


    function ShakeDiv(divToShake : JQuery): void {
		var interval = 100;
		var distance = 10;
		var times = 5;
		$(divToShake).css('position', 'relative');
		for (var iter = 0; iter < (times + 1); iter++) {
			$(divToShake).animate({
				left: ((iter % 2 == 0 ? distance : distance * -1))
			}, interval);
		}
		$(divToShake).animate({ left: 0 }, interval);
	}
    
    
   	/*
	We want to be able to randomly shuffly which mode the cards are shown in (ie. randomly show front OR back)
	*/
	function GetFaceTextByMode(isInFrontMode : boolean, card : dtos.CardDto) : string {
		if (isInFrontMode) {
			return card.frontText;
		}
		return card.backText;
	}

	/*
		
	*/
	function GetRandomCardIndex(deck : dtos.DeckDto, usedCardIndices: number[]): number {
        
		let randomIndex: number = -1;
		while (randomIndex == -1 || $.inArray(randomIndex, usedCardIndices) != -1) {
			randomIndex = Math.floor(Math.random() * deck.cards.length);
        }
        console.log("currently used indices are", usedCardIndices);
        console.log("and for the next random index we selected", randomIndex);
		return randomIndex;
	}


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


    function FlipFlashcardToFront() {
        let flipItDiv = FindFlipItDiv();
        let flashcard = FindFlashcardDiv();
        flashcard.flip(false);
        flipItDiv.show();
    }


    function FindFlashcardDiv() : JQuery {
        let flashcard = $("#card");
        return flashcard;
    }


    function FindFlipItDiv() : JQuery {
        let flipItDiv = $("#flipItDiv");
        return flipItDiv;
    }

    return {
        BuildAndGoToCardsPage: BuildAndGoToCardsPage,
        ChooseAnswer : ChooseAnswer,
        FlipFlashcardToBack: FlipFlashcardToBack
    }

})();