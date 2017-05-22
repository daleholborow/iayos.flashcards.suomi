/// <reference path="../../typings/index.d.ts" />
/// <reference path='./model.ts' />


(function () {

	const required_score = 10;
	const store_key = "store";
	let store: flashcards.DeckStore;
	store = getStore();


	function saveStore(): void {
		localStorage.setItem(store_key, JSON.stringify(store));
	}


	function getStore(): flashcards.DeckStore {
		if (localStorage.getItem(store_key) === null) {
			store = new flashcards.DeckStore();
			saveStore();
		}
		else {
			store = JSON.parse(localStorage.getItem(store_key));
		}
		return store;
	}


	function updateSelectedDeck(deckCode: string): void {
		store.activeDeckCode = deckCode;
		store.activeCardIndex = 0;

		if (!!store.decks[deckCode] == false) {
			$.ajaxSetup({ "async": false });
			$.getJSON("/data/" + deckCode + ".json", function (json) {
				store.decks[deckCode] = json;
				saveStore();
				$.ajaxSetup({ "async": false });
			});
		} else {
			console.log("Selected deck already existed in store", store.decks[deckCode]);
		}
	}


	function flipToBack(): void {
		$("#flashcard").flip('toggle');
	}


	$(document).on('click', '.answer-button', function () {
		let chosenAnswerId = $(this).data("answer-card-id");
		let isCorrectAnswer: boolean = chooseAnswer(chosenAnswerId);

		if (isCorrectAnswer) {
			// animate a happy thing
		}
		else {
			// animate a sad thing
		}
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", {
			transition: "slidefade", changeHash: false, reload: false, allowSamePageTransition: true
		});
	});


	function chooseAnswer(selectedCardId: number): boolean {

		// Because we deserialized store from JSON some properties might not be set correctly
		if (!!(store.decks[store.activeDeckCode].cards[store.activeCardIndex].score) == false) {
			store.decks[store.activeDeckCode].cards[store.activeCardIndex].score = 0;
		}

		let scoreIncrement: number = 0;
		let isCorrectAnswer: boolean = validateAnswer(selectedCardId);
		if (isCorrectAnswer) {
			scoreIncrement = 1;
		}
		else {
			scoreIncrement = -1;
		}

		store.decks[store.activeDeckCode].cards[store.activeCardIndex].score += scoreIncrement;
		console.log("Updated the score to  ", store.decks[store.activeDeckCode].cards[store.activeCardIndex].score);

		return isCorrectAnswer;
	}


	function validateAnswer(selectedCardId: number): boolean {
		// get the correct answer
		let correctCard: flashcards.Card = getActiveDeck().cards[store.activeCardIndex];
		let isCorrectAnswer: boolean = (correctCard.id === selectedCardId);
		return isCorrectAnswer;
	}


	function navToHome(): void {
		$.mobile.pageContainer.pagecontainer("change", "#page-home", {
			transition: "fade", changeHash: false, reload: true, allowSamePageTransition: false
		});
	}


	function navToScoreboard(): void {
		$.mobile.pageContainer.pagecontainer("change", "#page-scoreboard", {
			transition: "slide", changeHash: false, reload: true, allowSamePageTransition: false
		});
	}


	function goToScoreBoard(): void {
		$.mobile.pageContainer.pagecontainer("change", "#page-scoreboard", {
			transition: "fade", changeHash: false, reload: false, allowSamePageTransition: false
		});
	}


	$("#btn-scoreboard").on('click', function () {

		goToScoreBoard();

	});


	$(document).on('click', '.select-deck', function () {

		let selectedDeckCode = $(this).data("deck-code");
		updateSelectedDeck(selectedDeckCode);

		// Navigate to the deck view page
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: false });

	});


	$("#flashcard").flip({
		trigger: 'manual'
	});


	$("#toggle-flashcard").click(function () {
		flipToBack();
	});


	function getActiveDeck(): flashcards.Deck {
		let deck = store.decks[store.activeDeckCode];
		return deck;
	}


	$(document).on('pagebeforeshow', '#page-deck', function () {

		// we might want to do something like show the scoreboard every now and then? or maybe an advertisement

		if (false) {
			// show advert every 10th page ??

		}
		else {
			renderRandomCard();
		}
	});


	function renderRandomCard(): void {

		// Always set to unflipped initially
		var flip = $("#flashcard").data("flip-model");
		$("#flashcard").flip(false);


		let activeDeck = getActiveDeck();
		let usedCardIndices: number[] = [];

		let currentCardIndex = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(currentCardIndex);
		let activeCard = activeDeck.cards[currentCardIndex];

		let wrongCard1Index = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(wrongCard1Index);
		let wrongCard1 = activeDeck.cards[wrongCard1Index];

		let wrongCard2Index = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(wrongCard2Index);
		let wrongCard2 = activeDeck.cards[wrongCard2Index];

		$("#frontText").text(activeCard.f);
		$("#backText").text(activeCard.f);
		$("#answer1").html(activeCard.b);
		$("#answer1").data("answer-card-id", activeCard.id);
		$("#answer2").html(wrongCard1.b);
		$("#answer2").data("answer-card-id", wrongCard1.id);
		$("#answer3").html(wrongCard2.b);
		$("#answer3").data("answer-card-id", wrongCard2.id);
	}


	function getRandomCardIndex(usedCardIndices: number[]): number {
		// if (usedCardIndices.length == 0)
		let randomIndex: number = -1;
		let activeDeck = getActiveDeck();
		while (randomIndex == -1 || !!usedCardIndices.find(x => x == randomIndex)) {
			randomIndex = Math.floor(Math.random() * activeDeck.cards.length);
		}
		return randomIndex;
	}

})();