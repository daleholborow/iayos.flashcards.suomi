/// <reference path="../../typings/index.d.ts" />

(function () {

	//let activeDeck = localStorage.getItem("activeDeck");
	let store : any = {};

	if (localStorage.getItem("store") === null) { 
		store = getFreshStore();
		localStorage.setItem("store", JSON.stringify(store));
	}
	store = localStorage.getItem("store");

	function getDeck(deckCode) {
		if (!!store.decks[deckCode] == false) {
			$.getJSON("/data/" + deckCode + ".json", function (json) {
				console.log(json); // this will show the info it in firebug console
				store.decks[deckCode] = json;
			});
		}
		return store.decks[deckCode];
	}

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



	function getFreshStore() {
		return {
			activeDeckCode: null,
			activeDeck: null,
			activeCard: null,
			activeCardIndex: null
		};
	}

	function selectDeck(deckCode) {
		console.log("selected a deck: " + deckCode);
		store.activeDeckCode = deckCode;
	}

	function resetAndGoToHome() {
		store = getFreshStore();
		$.mobile.changePage("#page-home");
	}

	$(document).on('pagebeforeshow', '#page-home', function () {

		store = getFreshStore();
	});

	$(document).on('pagebeforeshow', '#page-deck', function () {

		if (!!store.activeDeckCode == false) resetAndGoToHome();

		var flip = $("#flashcard").data("flip-model");

		// e.g. to see currect flip state
		console.log("is the card flipped? : " + flip.isFlipped);

		// Always set to unflipped initially
		$("#flashcard").flip(false);
		//$(".front").show(true);
		//$(".back").hide(true);
		// $('.front').css('visibility','display');
		// $('.back').css('visibility','hidden');



		let myItem = localStorage.getItem(store.activeDeckCode);
		console.log("tried to load active deck :" + store.activeDeckCode);
		if (!!myItem == false) {
			$.getJSON("/data/" + store.activeDeckCode + ".json", function (json) {
				console.log(json); // this will show the info it in firebug console
				store.activeDeck = json;

				// by default select the first question
				initializeQuestion(store.activeCardIndex);
			});
		}
		else {
			store.activeDeck = myItem;
			// by default select the first question
			initializeQuestion(store.activeCardIndex);
		}


		// $('#movie-data').empty();
		// $.each(movieInfo.result, function(i, row) {
		//     if(row.id == movieInfo.id) {
		//         var movieHandler = Handlebars.compile($("#movie-template").html());
		//         $('#movie-data').html(movieHandler(row));                
		//     } 
		// });          
		// $('#movie-data').listview('refresh');

	});

	function initializeQuestion(cardIndex) {
		if (!!cardIndex == false) throw Error("cant use empty card index");
		store.activeCardIndex = cardIndex;

		store.activeCard = store.activeDeck.cards[cardIndex];

		var activeCard = store.activeDeck.cards[cardIndex];
		let wrongCard1 = getRandomCard(store.activeDeck.cards, cardIndex);
		let wrongCard2 = getRandomCard(store.activeDeck.cards, cardIndex);

		// var wrongCard1 = storeObject.activeDeck.cards[cardIndex + 1];
		// var wrongCard2 = storeObject.activeDeck.cards[cardIndex + 2];
		//storeObject.correctAnswerId = 1;
		// load up the deck, 
		// load up the question
		// load up 1 correct and 2 random answers

		console.log(activeCard, wrongCard1, wrongCard2);

		$("#frontText").text(activeCard.f);
		$("#backText").text(activeCard.f);
		$("#answer1").html(activeCard.b);
		//$("#answer1").html(activeCard.b);
		$("#answer1").data("answer-card-id", activeCard.id);
		// //$("#answer2").val("BAD");
		$("#answer2").html(wrongCard1.b);
		$("#answer2").data("answer-card-id", wrongCard1.id);
		// //$("#answer3").val("UGLY");
		$("#answer3").html(wrongCard2.b);
		$("#answer3").data("answer-card-id", wrongCard2.id);
		// $("#answer3").data("answerId", 3);

		//console.log("clicking answer 1 will give ansewrid: " + $("#answer1").data("answerId"));
		// console.log($("#frontText").text("HYVA")); // = "test";
	}

	function getRandomCard(cards, whereNotIndex) {
		let randomIndex = whereNotIndex;
		while (randomIndex == whereNotIndex) {
			randomIndex = Math.floor(Math.random() * cards.length);
		}
		return cards[randomIndex];
	}

	$(document).on('click', '.select-deck', function () {
		//Change page
		// console.log("deck selcetiojn called by " + this.id);

		let selectedDeckCode = $(this).data("deck-code");
		selectDeck(selectedDeckCode);
		$.mobile.changePage("#page-deck");
	});

	$(document).on('click', '.answer-button', function () {
		//Change page
		// console.log("answer called by element " + this.id);
		// console.log("clicked answer 1 and should se ansewrid: " + $("#answer1").data("answerId"));
		// console.log("chose answer: " + $(this).data("answerId"));
		let chosenAnswerId = $(this).data("answer-card-id");
		if (store.activeCard.id === chosenAnswerId) {
			// correct
			console.log("Answered correctly");
		}
		else {
			// incorrect
			console.log("Answered incorrectly");
		}
		store.activeCardIndex = store.activeCardIndex + 1;
		//$.mobile.changePage("#page-deck");
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flow", changeHash: false, reload: false, allowSamePageTransition: true })

		console.log("answered a question");
	});
})();