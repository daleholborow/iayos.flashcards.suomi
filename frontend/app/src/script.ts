/// <reference path="../../typings/index.d.ts" />

(function () {

	class Card {
		id: number = -1;
		f: string = null;	// front
		b: string = null;  // back
		score: number = 0;		// how many times has the user answered this correctly
	}

	class Deck {
		id: number = -1;
		code: string = null;
		title: string = null;
		cards: Card[] = [];
	}

	class DeckStore {

		activeDeckCode: string = null;
		activeCardIndex: number = 0;
		decks: Deck[] = [];

		constructor() {
		}
	}

	const store_key = "store";
	let store: DeckStore;
	store = getStore();


	function activeDeck(): Deck {
		let deck = store.decks[store.activeDeckCode];
		return deck;
	}


	function getStore(): DeckStore {
		if (localStorage.getItem(store_key) === null) {
			store = new DeckStore();
			saveStore();
		}
		else {
			store = JSON.parse(localStorage.getItem(store_key));
		}
		return store;
	}


	function saveStore() {
		localStorage.setItem(store_key, JSON.stringify(store));
	}


	$("#flashcard").flip({
		trigger: 'manual'
	});


	$("#toggle-flashcard").click(function () {
		$("#flashcard").flip('toggle');
	});


	$(document).on('click', '.select-deck', function () {
		let selectedDeckCode = $(this).data("deck-code");
		selectDeck(selectedDeckCode);
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: false });
	});


	function selectDeck(deckCode) {
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
			console.log("found a deck in the store:", store.decks[deckCode]);
		}
	}


	function resetDeckAndGoToHomepage() {
		store.activeDeckCode = null;
		store.activeCardIndex = 0;
		saveStore();
		$.mobile.pageContainer.pagecontainer("change", "#page-home", { transition: "flow", changeHash: false, reload: true, allowSamePageTransition: false });
	}


	function cardCanBeDisplayed() {
		if (
			!!store.activeDeckCode === false
			|| !(store.activeCardIndex >= 0)
			|| !!store.decks[store.activeDeckCode] === false
		) resetDeckAndGoToHomepage();
		if (store.activeCardIndex == store.decks[store.activeDeckCode].cards.length) {
			goToScoreBoard();
			return false;
		}
		return true;
	}


	function goToScoreBoard() {
		console.log("should move to scoreboard");
		$.mobile.pageContainer.pagecontainer("change", "#page-scoreboard", { transition: "flow", changeHash: false, reload: true, allowSamePageTransition: false });
	}


	$(document).on('pagebeforeshow', '#page-deck', function () {
		renderCard();
	});


	function renderCard() {

		let isValid = cardCanBeDisplayed();
		if (isValid == false) return;

		// Always set to unflipped initially
		var flip = $("#flashcard").data("flip-model");
		$("#flashcard").flip(false);
		
		let cardIndex: number = store.activeCardIndex;

		let activeCard = activeDeck().cards[cardIndex];
		let wrongCard1 = getRandomCard(cardIndex);
		let wrongCard2 = getRandomCard(cardIndex);

		$("#frontText").text(activeCard.f);
		$("#backText").text(activeCard.f);
		$("#answer1").html(activeCard.b);
		$("#answer1").data("answer-card-id", activeCard.id);
		$("#answer2").html(wrongCard1.b);
		$("#answer2").data("answer-card-id", wrongCard1.id);
		$("#answer3").html(wrongCard2.b);
		$("#answer3").data("answer-card-id", wrongCard2.id);
	}


	function getRandomCard(whereNotIndex) {
		let randomIndex = whereNotIndex;
		let activeDeckCards = activeDeck().cards;
		while (randomIndex == whereNotIndex) {
			randomIndex = Math.floor(Math.random() * activeDeckCards.length);
		}
		return activeDeckCards[randomIndex];
	}



	$(document).on('click', '.answer-button', function () {
		let chosenAnswerId = $(this).data("answer-card-id");
		let scoreIncrement = 0;
		if (store.decks[store.activeDeckCode].cards[store.activeCardIndex].id === chosenAnswerId) {
			// correct
			console.log("Answered correctly");
			scoreIncrement = 1;
		}
		else {
			// incorrect
			console.log("Answered incorrectly");
			scoreIncrement = -1;
		}

		// Because we deserialized store from JSON some properties might not be set correctly
		if (!!(store.decks[store.activeDeckCode].cards[store.activeCardIndex].score) == false) {
			store.decks[store.activeDeckCode].cards[store.activeCardIndex].score = 0;
		}
		store.decks[store.activeDeckCode].cards[store.activeCardIndex].score += scoreIncrement;
		store.activeCardIndex = store.activeCardIndex + 1;
		saveStore();

		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: true })

	});
})();