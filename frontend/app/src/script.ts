/// <reference path="../../typings/index.d.ts" />

(function () {

/*
	const store_key = "store";
	var store = getStore();

	function getNewStore() {
		return {
			activeStoreCode: null
		};
	}

	function getStore() {
		if (localStorage.getItem(store_key) === null) {
			//store = new DeckStore();
			store = getNewStore();
			saveStore();
		}
		else {
			store = JSON.parse(localStorage.getItem(store_key));
		}
		console.log("i loaded a store ", store);
		return store;
	}



	function saveStore() {
		console.log("goiing to update teh store");
		localStorage.setItem(store_key, JSON.stringify(store));
		console.log("updated the store", store);
	}

	// console.log("kicking off the fun.! but now i have to see how fast this is this is atest");
	// console.log("Oh Yeah Dude 2!!wdae");

	$("#flashcard").flip({
		trigger: 'manual'
	});

	$("#toggle-flashcard").click(function () {
		// $('.back').css('visibility','display');
		// $('.front').css('visibility','hidden');
		$("#flashcard").flip('toggle');
	});

	$(document).on('click', '.select-deck', function () {
		//Change page
		// console.log("deck selcetiojn called by " + this.id);

		var selectedDeckCode = $(this).data("deck-code");
		selectDeck(selectedDeckCode);
		$.mobile.changePage("#page-deck");
	});


	function selectDeck(deckCode) {
		console.log("selected a deck: " + deckCode);
		store.activeDeckCode = deckCode;
		store.activeCardIndex = 0;

		if (!!store.decks[deckCode] == false) {
			console.log("couldnt find the deck by coade, try to load it from json now");
			$.ajaxSetup({ "async": false });
			$.getJSON("/data/" + deckCode + ".json", function (json) {

				console.log("loaded a deck from json", json); // this will show the info it in firebug console
				store.decks[deckCode] = json;
				saveStore();
				$.ajaxSetup({ "async": false });
			});
		} else {
			console.log("found a deck in the store:", store.decks[deckCode]);
		}
		// console.log("selected a deck: " + store.activeDeckCode);
		// return store.decks[deckCode];
	}

	function resetDeckAndGoToHomepage() {
		console.log("we reset the deck and about to head homepage");
		store.activeDeckCode = null;
		store.activeCardIndex = 0;
		$.mobile.changePage("#page-home");
	}

	// $(document).on('pagebeforeshow', '#page-home', function () {
	// 	store = getFreshStore();
	// });

	function validateCardDisplay() {
		console.log("active card ind", store.activeCardIndex);
		console.log("active deck code", store.activeDeckCode);
		if (!!store.activeDeckCode === false || !(store.activeCardIndex >= 0)) resetDeckAndGoToHomepage();
	}

	$(document).on('pagebeforeshow', '#page-deck', function () {

		validateCardDisplay();

		var flip = $("#flashcard").data("flip-model");

		// e.g. to see currect flip state
		console.log("is the card flipped? : " + flip.isFlipped);

		// Always set to unflipped initially
		$("#flashcard").flip(false);
		//$(".front").show(true);
		//$(".back").hide(true);
		// $('.front').css('visibility','display');
		// $('.back').css('visibility','hidden');

		console.log("show the page deck, where the decks are", store.decks);

		renderCard();

	});

	function renderCard() {

		validateCardDisplay();

		let cardIndex: number = store.activeCardIndex;
		//if (!!store.activeCardIndex == false) throw Error("cant use empty card index");

console.log("form within the render card method, the decks are", store.decks);

		let wrongCard1 = getRandomCard(cardIndex);
		// let wrongCard2 = getRandomCard(cardIndex);

		//if (store.)

		// store.activeCardIndex = cardIndex;

		// store.activeCard = store.activeDeck.cards[cardIndex];

		// var activeCard = store.activeDeck.cards[cardIndex];
		// let wrongCard1 = getRandomCard(store.activeDeck.cards, cardIndex);
		// let wrongCard2 = getRandomCard(store.activeDeck.cards, cardIndex);

		// // var wrongCard1 = storeObject.activeDeck.cards[cardIndex + 1];
		// // var wrongCard2 = storeObject.activeDeck.cards[cardIndex + 2];
		// //storeObject.correctAnswerId = 1;
		// // load up the deck, 
		// // load up the question
		// // load up 1 correct and 2 random answers

		// console.log(activeCard, wrongCard1, wrongCard2);

		// $("#frontText").text(activeCard.f);
		// $("#backText").text(activeCard.f);
		// $("#answer1").html(activeCard.b);
		// //$("#answer1").html(activeCard.b);
		// $("#answer1").data("answer-card-id", activeCard.id);
		// // //$("#answer2").val("BAD");
		// $("#answer2").html(wrongCard1.b);
		// $("#answer2").data("answer-card-id", wrongCard1.id);
		// // //$("#answer3").val("UGLY");
		// $("#answer3").html(wrongCard2.b);
		// $("#answer3").data("answer-card-id", wrongCard2.id);
		// // $("#answer3").data("answerId", 3);

		// //console.log("clicking answer 1 will give ansewrid: " + $("#answer1").data("answerId"));
		// // console.log($("#frontText").text("HYVA")); // = "test";
	}

	function getRandomCard(whereNotIndex) {
		let randomIndex = whereNotIndex;

		console.log("going to get a random card", store);
		var activeDeckCards = getActiveDeck().cards;
		while (randomIndex == whereNotIndex) {
			randomIndex = Math.floor(Math.random() * activeDeckCards.length);
		}
		return activeDeckCards[randomIndex];
	}

	function getActiveDeck() {
		console.log("looking for active deck: ", store.activeDeckCode, "from decks", store.decks);
		//store.activeDeck = store.decks.find(x => x.code === store.activeDeckCode);
		
		console.log("found an active deck", store.decks[store.activeDeckCode]);
		return store.decks[store.activeDeckCode];
	}


	// $(document).on('click', '.answer-button', function () {
	// 	//Change page
	// 	// console.log("answer called by element " + this.id);
	// 	// console.log("clicked answer 1 and should se ansewrid: " + $("#answer1").data("answerId"));
	// 	// console.log("chose answer: " + $(this).data("answerId"));
	// 	let chosenAnswerId = $(this).data("answer-card-id");
	// 	if (store.activeCard.id === chosenAnswerId) {
	// 		// correct
	// 		console.log("Answered correctly");
	// 	}
	// 	else {
	// 		// incorrect
	// 		console.log("Answered incorrectly");
	// 	}
	// 	store.activeCardIndex = store.activeCardIndex + 1;
	// 	//$.mobile.changePage("#page-deck");
	// 	$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: true })

	// 	console.log("answered a question");
	// });





*/



	/*
	"id" : "1",
		"code" : "deck_top_100_verbs",
		"title": "Top 100 Verbs",
		"cards" : [
			{
				"id" : "1",
				"f" : "puhuu",
				"b" : "to speak"
			},
			*/
	class Card {
		id: number;
		f: string;	// front
		b: string;  // back
	}

	class Deck {
		id: number;
		code: string;
		title: string;
		cards: Card[] = [];
	}

	class DeckStore {

		activeDeckCode: string;
		//activeDeck : Deck;
		//activeCard : Card;
		activeCardIndex: number;
		decks: Deck[] = [];

		constructor() {
			this.activeDeckCode = null;
			//this.activeDeck = null;
			this.activeCardIndex = 0;
			//this.activeCard = null;
		}


		// findActiveDeck(deck) {
		// 	console.log("really going to try to find active deck", this.activeDeckCode);
		// 	return deck.code === this.activeDeckCode;
		// }

		// public activeDeck(): Deck {
		// 	console.log("looki for active deck with code: " + this.activeDeckCode);
		// 	console.log("from decks: " + this.decks);
		// 	// let deck = this.decks.find(this.findActiveDeck);
		// 	// console.log("and found the matching deck:", deck);
		// 	// return deck;

		// 	console.log("trying by index", store.decks[0]);

		// 	let deck = this.decks.find(x => x.code == this.activeDeckCode);
		// 	console.log("and found the matching deck:", deck);
		// 	return deck;
		// }
		// activeDeck() : void {
		// 	let findActiveDeck = Deck.code === this.activeDeckCode;
		// 	return this.decks.find(findActiveDeck);
		// }
	}

	const store_key = "store";

	//let activeDeck = localStorage.getItem("activeDeck");
	let store: DeckStore;
	store = getStore();

	function getActiveDeck(): Deck {
		// console.log("looki for active deck with code: " + store.activeDeckCode);
		// console.log("from decks: " + store.decks);
		// console.log("trying by index", store.decks[0]);
		//let deck = store.decks.find(x => x.code == store.activeDeckCode);
		let deck = store.decks[store.activeDeckCode];
		console.log("and found the matching deck:", deck);
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
		console.log("i loaded a store " , store);
		return store;
	}



	function saveStore() {
		console.log("goiing to update teh store");
		localStorage.setItem(store_key, JSON.stringify(store));
		console.log("updated the store", store);
	}

	// function getDeck(deckCode) {
	// 	if (!!store.decks[deckCode] == false) {
	// 		$.getJSON("/data/" + deckCode + ".json", function (json) {

	// 			console.log("loaded a deck from json", json); // this will show the info it in firebug console
	// 			store.decks[deckCode] = json;
	// 			saveStore();
	// 		});
	// 	} else {
	// 		console.log("found a deck in the store:", store.decks[deckCode]);
	// 	}
	// 	return store.decks[deckCode];
	// }

	console.log("kicking off the fun.! but now i have to see how fast this is this is atest");
	console.log("Oh Yeah Dude 2!!wdae");

	$("#flashcard").flip({
		trigger: 'manual'
	});

	$("#toggle-flashcard").click(function () {
		// $('.back').css('visibility','display');
		// $('.front').css('visibility','hidden');
		$("#flashcard").flip('toggle');
	});

	$(document).on('click', '.select-deck', function () {
		//Change page
		// console.log("deck selcetiojn called by " + this.id);

		let selectedDeckCode = $(this).data("deck-code");
		selectDeck(selectedDeckCode);
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: false });
	});


	function selectDeck(deckCode) {
		//console.log("selected a deck: " + deckCode);
		store.activeDeckCode = deckCode;
		store.activeCardIndex = 0;

		if (!!store.decks[deckCode] == false) {
			console.log("couldnt find the deck by coade, try to load it from json now");
			$.ajaxSetup({ "async": false });
			$.getJSON("/data/" + deckCode + ".json", function (json) {

				console.log("loaded a deck from json", json); // this will show the info it in firebug console
				store.decks[deckCode] = json;
				saveStore();
				$.ajaxSetup({ "async": false });
			});
		} else {
			console.log("found a deck in the store:", store.decks[deckCode]);
		}
		// console.log("selected a deck: " + store.activeDeckCode);
		// return store.decks[deckCode];
	}

	function resetDeckAndGoToHomepage() {
		console.log("we reset the deck and about to head homepage"); 
		store.activeDeckCode = null;
		store.activeCardIndex = 0;
		saveStore();
		//$.mobile.changePage("#page-home");
		$.mobile.pageContainer.pagecontainer("change", "#page-home", { transition: "flow", changeHash: false, reload: true, allowSamePageTransition: false }); 
	}

	// $(document).on('pagebeforeshow', '#page-home', function () {
	// 	store = getFreshStore();
	// });

	function validateCardDisplay() {
		console.log("active card ind", store.activeCardIndex);
		console.log("active deck code", store.activeDeckCode);
		
		console.log("test 1", !!store.activeDeckCode);

		if (
			!!store.activeDeckCode === false 
			|| !(store.activeCardIndex >= 0)
			|| !!store.decks[store.activeDeckCode] === false
		) resetDeckAndGoToHomepage();
	}

	$(document).on('pagebeforeshow', '#page-deck', function () {

		validateCardDisplay();

		var flip = $("#flashcard").data("flip-model");

		// e.g. to see currect flip state
		console.log("is the card flipped? : " + flip.isFlipped);

		// Always set to unflipped initially
		$("#flashcard").flip(false);
		//$(".front").show(true);
		//$(".back").hide(true);
		// $('.front').css('visibility','display');
		// $('.back').css('visibility','hidden');

		renderCard();

		// let myItem = localStorage.getItem(store.activeDeckCode);
		// console.log("tried to load active deck :" + store.activeDeckCode);
		// if (!!myItem == false) {
		// 	$.getJSON("/data/" + store.activeDeckCode + ".json", function (json) {
		// 		console.log(json); // this will show the info it in firebug console
		// 		store.activeDeck = json;

		// 		// by default select the first question
		// 		initializeQuestion(store.activeCardIndex);
		// 	});
		// }
		// else {
		// 	store.activeDeck = myItem;
		// 	// by default select the first question
		// 	initializeQuestion(store.activeCardIndex);
		// }


		// $('#movie-data').empty();
		// $.each(movieInfo.result, function(i, row) {
		//     if(row.id == movieInfo.id) {
		//         var movieHandler = Handlebars.compile($("#movie-template").html());
		//         $('#movie-data').html(movieHandler(row));                
		//     } 
		// });          
		// $('#movie-data').listview('refresh');

	});

	function renderCard() {

		validateCardDisplay();

		let cardIndex: number = store.activeCardIndex;
		//if (!!store.activeCardIndex == false) throw Error("cant use empty card index");


		let  activeCard = getActiveDeck().cards[cardIndex];
		let wrongCard1 = getRandomCard(cardIndex);
		let wrongCard2 = getRandomCard(cardIndex);

		console.log("while rendering cards the active card is", activeCard);

		//if (store.)

		// store.activeCardIndex = cardIndex;

		// store.activeCard = store.activeDeck.cards[cardIndex];

		// var activeCard = store.activeDeck.cards[cardIndex];
		// let wrongCard1 = getRandomCard(store.activeDeck.cards, cardIndex);
		// let wrongCard2 = getRandomCard(store.activeDeck.cards, cardIndex);

		// // var wrongCard1 = storeObject.activeDeck.cards[cardIndex + 1];
		// // var wrongCard2 = storeObject.activeDeck.cards[cardIndex + 2];
		// //storeObject.correctAnswerId = 1;
		// // load up the deck, 
		// // load up the question
		// // load up 1 correct and 2 random answers

		// console.log(activeCard, wrongCard1, wrongCard2);

		$("#frontText").text(activeCard.f);
		$("#backText").text(activeCard.f);
		$("#answer1").html(activeCard.b);
		// //$("#answer1").html(activeCard.b);
		$("#answer1").data("answer-card-id", activeCard.id);
		// // //$("#answer2").val("BAD");
		$("#answer2").html(wrongCard1.b);
		$("#answer2").data("answer-card-id", wrongCard1.id);
		// // //$("#answer3").val("UGLY");
		$("#answer3").html(wrongCard2.b);
		$("#answer3").data("answer-card-id", wrongCard2.id);
		// // $("#answer3").data("answerId", 3);

		// //console.log("clicking answer 1 will give ansewrid: " + $("#answer1").data("answerId"));
		// // console.log($("#frontText").text("HYVA")); // = "test";
	}

	function getRandomCard(whereNotIndex) {
		let randomIndex = whereNotIndex;

		console.log(store);
		var activeDeckCards = getActiveDeck().cards;
		while (randomIndex == whereNotIndex) {
			randomIndex = Math.floor(Math.random() * activeDeckCards.length);
		}
		return activeDeckCards[randomIndex];
	}



	// $(document).on('click', '.answer-button', function () {
	// 	//Change page
	// 	// console.log("answer called by element " + this.id);
	// 	// console.log("clicked answer 1 and should se ansewrid: " + $("#answer1").data("answerId"));
	// 	// console.log("chose answer: " + $(this).data("answerId"));
	// 	let chosenAnswerId = $(this).data("answer-card-id");
	// 	if (store.activeCard.id === chosenAnswerId) {
	// 		// correct
	// 		console.log("Answered correctly");
	// 	}
	// 	else {
	// 		// incorrect
	// 		console.log("Answered incorrectly");
	// 	}
	// 	store.activeCardIndex = store.activeCardIndex + 1;
	// 	//$.mobile.changePage("#page-deck");
	// 	$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: true })

	// 	console.log("answered a question");
	// });
})();