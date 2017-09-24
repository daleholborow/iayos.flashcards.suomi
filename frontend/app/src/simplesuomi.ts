/// <reference path='./my-app.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />

class CardScore {
    cardId: string = null;
    r: number = 0;		// how many times has the user answered this correctly
    w: number = 0;		// how many times has the user answered this incorrectly

    constructor(cardId: string) {
        this.cardId = cardId;
    }
}


interface IDatastore {
    activeCardId: string;
    activeDeck: dtos.DeckDto;
    cardScores: Map<string, CardScore>
}

class DummyDatastore implements IDatastore {
    cardScores: Map<string, CardScore> = new Map<string, CardScore>();

    public activeCardId: string = null;
    public activeDeck: dtos.DeckDto = null;
}

/* 
    Local storage container
*/
class Datastore implements IDatastore {

    static deckStoreKey: string = "ssDeckStore";
    static scoreStoreKey: string = "ssScoreStore";

    get activeCardId(): string { return this.initData.activeCardId; }
    set activeCardId(activeCardId: string) { this.initData.activeCardId = activeCardId; }
    get cardScores(): Map<string, CardScore> { return this.initData.cardScores; }
    //set cardScores(scores : Map<string, CardScore>) { this.initData.cardScores = scores;}
    get activeDeck() : dtos.DeckDto { return this.initData.activeDeck; };
    set activeDeck(deck : dtos.DeckDto) { this.initData.activeDeck = deck; }


    constructor(private initData: IDatastore) {
    }


    setAndSaveActiveCardId(cardId : string) : void {
        this.initData.activeCardId = cardId;
        this.saveToLocalStorage();
    }

    setAndSaveActiveDeck(deck : dtos.DeckDto) : void {
        this.initData.activeDeck = deck;
        this.saveToLocalStorage();
    }

    setAndSaveCardScores(scores : Map<string, CardScore>) : void {
        this.initData.cardScores = scores;
        this.saveToLocalStorage();
    }

    recordCorrectAnswer(cardId: string): void {
        let cardscore = this.getOrInitializeCardscore(cardId);
        cardscore.r = cardscore.r + 1;
        this.saveToLocalStorage();
    }

    recordWrongAnswer(cardId: string): void {
        let cardscore = this.getOrInitializeCardscore(cardId);
        cardscore.w = cardscore.w + 1;
        this.saveToLocalStorage();
    }

    getOrInitializeCardscore(cardId: string): CardScore {
        //  console.log("the scores are currently", this.initData.cardScores);
        let hasCardScore = this.initData.cardScores.has(cardId);
        if (!hasCardScore) {
            this.initData.cardScores.set(cardId, new CardScore(cardId));
        }
        let existingCardScore = this.initData.cardScores.get(cardId);
        return existingCardScore;
    }

    
    reset(): Datastore {
        this.initData = new DummyDatastore();
        this.saveToLocalStorage();
        return this;
    }

    
    static getStore(): Datastore {
        let localStore: Datastore;
        let currentLocalStorage = localStorage.getItem(Datastore.deckStoreKey);
        // console.log("so local data is set to", currentLocalStorage);
        if (currentLocalStorage) {
            //  console.log("and the json parsed obj is", JSON.parse(localStorage.getItem(this.deckStoreKey)));
            localStore = $.extend(new Datastore(new DummyDatastore()), JSON.parse(currentLocalStorage));
            //console.log("stuf", localStorage.getItem(Datastore.scoreStoreKey));
            localStore.initData.cardScores = new Map<string, CardScore>();
            let currentScoreString = localStorage.getItem(Datastore.scoreStoreKey);
            if (currentScoreString != "{}") {
                localStore.initData.cardScores = new Map<string, CardScore>(JSON.parse(currentScoreString));
            }
            // console.log("loaded store from localstorage", localStore);
        }
        else {
            // console.log("store doesnt exist already, create and save now");
            localStore = new Datastore(new DummyDatastore());
            localStore.saveToLocalStorage();
        }
        return localStore;
    }


    saveToLocalStorage(): void {
        localStorage.setItem(Datastore.deckStoreKey, JSON.stringify(this.initData));
        // console.log("about to save scores", this.initData.cardScores);
        localStorage.setItem(Datastore.scoreStoreKey, JSON.stringify(Array.from(this.initData.cardScores.entries())));
    }

}

var mySS = (function () {

    const applicationId = "0d467630-dcab-4883-a754-d2a107442e56";
    const client = new ss.JsonServiceClient("http://flashcardapi.eladaus.com/api");
    let datastore = Datastore.getStore();


    const DeckAccordionItemTemplate = (dto: dtos.DeckDto) : string => {
        // console.log("rendering a deck item", dto.deckId, dto);
        return `
            <li class="item-content">
                <div class="item-inner">
                    <div class="item-title" onclick="mySS.LoadDeckAndShowCardCountSelectionPage('${dto.deckId}');return false;"><b>${dto.name}</b></div>
                    <div class="item-after" onclick="mySS.LoadDeckAndShowCardCountSelectionPage('${dto.deckId}');return false;">
                        <span class="badge">${dto.numberOfCards} cards</span>&nbsp;|&nbsp;
                        <span class="view-score" onclick="mySS.RerouteToScoreboardPage('${dto.deckId}');">score</span>
                    </div>
                </div>
            </li>
        `;
    };


    const DeckCategoryAccordionTemplate = (dto: dtos.DeckCategoryDto) : string => {
        // console.log("rendering a deck item", dto.deckCategoryId, dto);
        let deckAccordionItems = dto.decks.map(DeckAccordionItemTemplate).join('');
        return `
        <div class="accordion-item">
            <div class="accordion-item-toggle">
                <i class="icon icon-plus">+</i>
                <i class="icon icon-minus">-</i>
                <span><b>${dto.name}</b></span>
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


    const BuildDeckScoreboardTemplate = (deckDto : dtos.DeckDto) : string => {
        // console.log("building the scoreboard page template");
        //<div class="table_section_small">Reset</div>
        let html : string = `
            <ul class="responsive_table" id="scoreslist">
                <li class="table_row">
                <div class="table_section_card">Card</div>
                <div class="table_section_accuracy">Accuracy</div>
                
                </li>
            `;
        deckDto.cards.sort((a, b) => {return a.frontText > b.frontText ? 1 : 0});
        for (let card of deckDto.cards) {
            // console.log(card, datastore.cardScores);
            let score = datastore.getOrInitializeCardscore(card.cardId);
            html += `
            <li class="table_row">
                <div class="table_section_card">
                    ${card.frontText}
                    <br/> 
                    ${card.backText}
                </div>
                <div class="table_section_accuracy">${score.r} / ${score.r+score.w}<br/>(${CalculateAccuracy(score.r,score.w)}%)</div>
            </li>
            `;
        //     <div class="table_section_small">
        //     <button>reset</button>
        // </div>
        }
        html = html + `</ul>`;
        return html;
    }


    function CalculateAccuracy(right: number, wrong: number) : number {
		let x = (!!right) ? right : 0;
		let y = (!!wrong) ? wrong : 0;
		if (x == 0 && y == 0) return 0;
		return Math.floor((right / (right + wrong)) * 100);
	}
    
    
    function RerouteToScoreboardPage(deckId: string): void {
        // console.log("Get score for deck and go to scoreboard page");
        // Query the deck with all its cards
        LoadDeckAndCache(deckId).then(x => {
            mainView.router.load({ url: 'scoreboard.html' });
        });
    }


    const LoadDeckAndCache = async (deckId: string) => {
        return QueryDeckWithCards(deckId).then(response => {
            // console.log(response.result);
            datastore.setAndSaveActiveDeck(response.result);
            // console.log("now decks are:", datastore.decks);
        });
    }


    function BuildDeckCategoriesPageListing(): void {
        // console.log("Get deck categories for application and go deck categories page");
        QueryDeckCategories(applicationId).then(response => {
            let content = response.results.map(DeckCategoryAccordionTemplate).join('');
            $("#deckCategoryList").html(content);
        });
    }


    function BuildAndGoToCardsPage(maxNumberOfCards: number): void {
        let availableCards = datastore.activeDeck.cards.slice();
        let selectedCards : dtos.CardDto[] = [];
        while (selectedCards.length < maxNumberOfCards && availableCards.length > 0) {
            let randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            selectedCards.push(randomCard);
            var indexOfRandomCard = availableCards.indexOf(randomCard, 0);
            // console.log("the index of the randomly selected card is", indexOfRandomCard);
            availableCards.splice(indexOfRandomCard, 1);
            // console.log("new count of available cards is", availableCards.length);
        }
        datastore.activeDeck.cards = selectedCards;
        datastore.saveToLocalStorage();
        mainView.router.load({ url: 'flashcards.html' });
    }


    function LoadDeckAndShowCardCountSelectionPage(deckId : string) : void {
        // // console.log("Get deck with cards and go to flashcard page");
        LoadDeckAndCache(deckId).then(x => {
            //mainView.router.load({ url: 'scoreboard.html' });
            mainView.router.load({ url: 'numberOfCards.html' });
        });
    }


    myApp.onPageInit('about', function (page) {
        // console.log('going to the about page' + Date.now());
    });


    myApp.onPageAfterAnimation('clearcache', function (page) {
        // console.log('reset it all' + Date.now());
        datastore.reset();
        // mainView.router.load({ url: 'index.html', reload: true });
        mainView.router.loadPage("index.html");
    });


    myApp.onPageInit('contact', function (page) {
        // console.log('going o viewcontact us' + Date.now());
        let action = `http://flashcardapi.eladaus.com/api/applications/${applicationId}/contact`;
        $('#ContactForm').attr('action', action);
    });


    //myApp.onPageInit('deckcategories', function (page) {
    myApp.onPageBeforeInit('deckcategories', function (page) {
        // console.log('going to view deck categories' + Date.now());
        BuildDeckCategoriesPageListing();
    });

    // myApp.onPageAfterAnimation('deckcategories', function(page) {
    //     console.log("in onpageafternaimation");
    // });
    // myApp.onPageBeforeAnimation('deckcategories', function(page) {
    //     console.log("in onpagbeforeanim");
    // });
    // myApp.onPageBeforeInit('deckcategories', function(page) {
    //     console.log("in onpagebeforeinit");
    // });
    // myApp.onPageInit('deckcategories', function(page) {
    //     console.log("in onpageinit");
    // });
    // myApp.onPageReinit('deckcategories', function(page) {
    //     console.log("in onpagereinit");
    // });


    myApp.onPageInit('flashcards', function (page) {
        // console.log('going to to flashcards for deck now at ' + Date.now());
        let activeDeck = datastore.activeDeck;
        // console.log("active deck is", activeDeck);
        $("#pgFlashcardsTitle").html("Studying: " + datastore.activeDeck.name);

        // Always set to unflipped initially and configure mode
        let flashcard = FindFlashcardDiv();
        flashcard.flip({
            trigger: 'manual',
            reverse: true
        });
        RenderRandomCardFromDeck(activeDeck);
        FindFlipItDiv().show();
    });


    myApp.onPageBeforeAnimation('numberOfCards', function (page) {
        // hacked in to be less than the two "lesser" options to force a card 
        // refresh if some subset currently selected
        if (datastore.activeDeck.cards.length < 26) {
            LoadDeckAndCache(datastore.activeDeck.deckId).then(x => {
                // cards were refreshed for the deck, user can select how many to study
            });
        }
    });
    
    myApp.onPageInit('scoreboard', function (page) {
        // console.log("loading and adeck is", datastore.activeDeck);
        try {
            $("#ttlScoreboardDeck").html("Scoreboard:" + datastore.activeDeck.name);
            // console.log('going to view deck scoreboard' + Date.now());
            $("#scoresplaceholder").html(BuildDeckScoreboardTemplate(datastore.activeDeck));
        }
        catch (Error) {
            console.log(Error.message);
            //RedirectOnError();
        }
    });


    function RedirectOnError() : void {
        let protocol = (window.location.protocol.length == 0) ? "http:" : window.location.protocol;
        let port = (window.location.port.length == 0) ? "" : ":" + window.location.port;
        let url = protocol + "//" + window.location.hostname + port;
        window.location.assign(url);
    }

    
    function RenderRandomCardFromDeck(deck: dtos.DeckDto): void {
        // always set card to unflipped initially
        FlipFlashcardToFront();

        // sometimes show the front text, sometimes show the back
        let isInFrontMode: boolean = Math.random() >= 0.5;
        //console.log("isInFrontMode:" + isInFrontMode);

        let selectedCards: dtos.CardDto[] = [];
        let numCards = 3;
        while (selectedCards.length < numCards) {
            let randomCard = deck.cards[Math.floor(Math.random() * deck.cards.length)];
            if (selectedCards.find(c => c.cardId == randomCard.cardId) == undefined) {
                selectedCards.push(randomCard);
                RenderAnswerButton(isInFrontMode, selectedCards.length, randomCard);
            }
            // console.log("currently selected cards are:", selectedCards);
        }
        let currentCard = selectedCards[Math.floor(Math.random() * selectedCards.length)];
        datastore.setAndSaveActiveCardId(currentCard.cardId);
        $("#frontText").text(GetFaceTextByMode(!isInFrontMode, currentCard));
        $("#backText").text(GetFaceTextByMode(!isInFrontMode, currentCard));
        let imgFolder = "/images/flags/";
        $("#frontflag").attr('src', imgFolder + GetFlagImageByMode(!isInFrontMode, deck));
        $("#backflag").attr('src', imgFolder + GetFlagImageByMode(isInFrontMode, deck));
    }


    function RenderAnswerButton(isInFrontMode: boolean, buttonId: number, card: dtos.CardDto) {
        $("#answer" + buttonId).html(GetFaceTextByMode(isInFrontMode, card));
        $("#answer" + buttonId).data("answer-card-id", card.cardId);
    }


    function ChooseAnswer(caller: any): void {
        // console.log("choosing an answer", caller);
        let chosenAnswerId = $(caller).data("answer-card-id");
        // console.log("chose the card with id", chosenAnswerId);

        let isCorrectAnswer: boolean = (datastore.activeCardId === chosenAnswerId);

        if (isCorrectAnswer) {
            datastore.recordCorrectAnswer(datastore.activeCardId);
            // animate a happy thing
            DoSomethingHappy(FindFlashcardDiv());
        }
        else {
            datastore.recordWrongAnswer(datastore.activeCardId);
            // animate a sad thing
            DoSomethingSad(FindFlashcardDiv());
        }
    }


    function DoSomethingHappy(divToShake: JQuery): void {
        let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        let animationName = 'fadeOutLeft';
        divToShake.addClass('animated ' + animationName);

        // console.log("doing something happy in add class");
        RenderRandomCardFromDeck(datastore.activeDeck);
        // console.log("doing something happy after render card");

        divToShake.one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);
            // console.log("doing something happy removeing class");
            FindFlipItDiv().show();
        });
    }


    function DoSomethingSad(divToShake: JQuery): void {
        divToShake.animateCss('shake');
    }


    $.fn.extend({
        animateCss: function (animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated ' + animationName).one(animationEnd, function () {
                $(this).removeClass('animated ' + animationName);
            });
            return this;
        }
    });


    /*
    We want to be able to randomly shuffly which mode the cards are shown in (ie. randomly show front OR back)
    */
    function GetFaceTextByMode(isInFrontMode: boolean, card: dtos.CardDto): string {
        if (isInFrontMode) {
            return card.frontText;
        }
        return card.backText;
    }

    function GetFlagImageByMode(useFrontLanguage : boolean, deck : dtos.DeckDto) : string {
        let language = (useFrontLanguage) ? deck.frontLanguage : deck.backLanguage;
        // console.log("the language is", language);
        if (language.toLowerCase() === "finnish") return "fi.png";
        if (language.toLowerCase() === "english") return "gb.png";
        return "gb.gif";
    }

	/*
		
	*/
    function GetRandomCardIndex(deck: dtos.DeckDto, usedCardIndices: number[]): number {
        let randomIndex: number = -1;
        while (randomIndex == -1 || $.inArray(randomIndex, usedCardIndices) != -1) {
            randomIndex = Math.floor(Math.random() * deck.cards.length);
        }
        // console.log("currently used indices are", usedCardIndices);
        // console.log("and for the next random index we selected", randomIndex);
        return randomIndex;
    }


    const QueryDeckCategories = async (applicationId: string) => {
        let request = new dtos.ListDeckCategoriesByApplicationRequest();
        request.applicationId = applicationId;
        request.includeDecks = true;  
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
        let flashcard = FindFlashcardDiv();
        flashcard.flip(false);
    }


    function FindFlashcardDiv(): JQuery {
        let flashcard = $("#card");
        return flashcard;
    }


    function FindFlipItDiv(): JQuery {
        let flipItDiv = $("#flipItDiv");
        return flipItDiv;
    }


    return {
        BuildAndGoToCardsPage: BuildAndGoToCardsPage,
        ChooseAnswer: ChooseAnswer,
        FlipFlashcardToBack: FlipFlashcardToBack,
        LoadDeckAndShowCardCountSelectionPage : LoadDeckAndShowCardCountSelectionPage,
        RerouteToScoreboardPage: RerouteToScoreboardPage
    }

})();