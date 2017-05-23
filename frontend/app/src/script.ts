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

		// Couldnt pass options to callback in flip, 
		$('.answer-button').css('opacity', '0.0'); 
				
		// var flip = $("#card").data("flip-model");
		// // e.g. to see currect flip state
		// flip.isFlipped;

		$("#card").flip('toggle', ensureAnswerButtonsVisible);
	}


	function ensureAnswerButtonsVisible() : void {
		// make the answer buttons show now... they are misbehaving
		$('.answer-button').css('opacity', '1.0');  // visible maximum
	}
	

	$(document).on('click', '.answer-button', function () {
		let chosenAnswerId = $(this).data("answer-card-id");
		let isCorrectAnswer: boolean = chooseAnswer(chosenAnswerId);

		if (isCorrectAnswer) {
			// animate a happy thing

			$.mobile.pageContainer.pagecontainer("change", "#page-deck", {
				transition: "slidefade", changeHash: false, reload: false, allowSamePageTransition: true
			});
		}
		else {
			// animate a sad thing
			shake("card");
		}
		// $.mobile.pageContainer.pagecontainer("change", "#page-deck", {
		// 	transition: "slidefade", changeHash: false, reload: false, allowSamePageTransition: true
		// });
	});


	function shake(elementId): void {
		var div = document.getElementById(elementId);
		var interval = 100;
		var distance = 10;
		var times = 5;
		$(div).css('position', 'relative');
		for (var iter = 0; iter < (times + 1); iter++) {
			$(div).animate({
				left: ((iter % 2 == 0 ? distance : distance * -1))
			}, interval);
		}
		$(div).animate({ left: 0 }, interval);
	}


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
		saveStore();
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
			transition: "flip", changeHash: false, reload: true, allowSamePageTransition: false
		});
	}


	function navToScoreboard(): void {
		$.mobile.pageContainer.pagecontainer("change", "#page-scoreboard", {
			transition: "flip", changeHash: false, reload: false, allowSamePageTransition: false
		});
	}


	

	$("#btn-scoreboard").on('click', function () {

		navToScoreboard();

	});


	$(document).on('click', '.select-deck', function () {

		let selectedDeckCode = $(this).data("deck-code");
		updateSelectedDeck(selectedDeckCode);

		// Navigate to the deck view page
		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flip", changeHash: false, reload: false, allowSamePageTransition: false });

	});


	$("#card").flip({
		trigger: 'manual'
	});
 

	$("#toggle-flashcard").click(function () {
		flipToBack();
	});


	function getActiveDeck(): flashcards.Deck {
		let deck = store.decks[store.activeDeckCode];
		return deck;
	}


$(document).on('pagebeforeshow', "#page-scoreboard", function() {
	let myTemplatevalue : string = "dale replace this";
	let scoresList = $("#list-card-scores");
	scoresList.empty();
	scoresList.append(` 
	<li> 
		<a href="#"> 
			<h2>${myTemplatevalue}</h2> 
			<p>
				Right: <br/>
				Wrong: 
			</p>
			<p>Broken Bells</p>
		</a>
		<a href="#" data-rel="popup">reset score</a>
	</li>
	`);
	scoresList.listview('refresh');
});

	$(document).on('pagebeforeshow', '#page-deck', function () {

		$("#page-deck-header").html(getActiveDeck().title);

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
		var flip = $("#card").data("flip-model");
		$("#card").flip(false);

		let activeDeck = getActiveDeck();
		let usedCardIndices: number[] = [];

		let randomCardIndex = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		let card = activeDeck.cards[randomCardIndex];
		$("#answer1").html(card.b);
		$("#answer1").data("answer-card-id", card.id);

		randomCardIndex = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		card = activeDeck.cards[randomCardIndex];
		$("#answer2").html(card.b);
		$("#answer2").data("answer-card-id", card.id);

		randomCardIndex = getRandomCardIndex(usedCardIndices);
		usedCardIndices.push(randomCardIndex);
		card = activeDeck.cards[randomCardIndex];
		$("#answer3").html(card.b);
		$("#answer3").data("answer-card-id", card.id);

		// which one to use as the front?
		let currentCardIndex = usedCardIndices[Math.floor(Math.random() * usedCardIndices.length)];
		let currentCard = activeDeck.cards[currentCardIndex];
		store.activeCardIndex = currentCardIndex;
		$("#frontText").text(currentCard.f);
		$("#backText").text(currentCard.f); 
	}


	function getRandomCardIndex(usedCardIndices: number[]): number {
		let randomIndex: number = -1;
		let activeDeck = getActiveDeck();
		while (randomIndex == -1 || $.inArray(randomIndex, usedCardIndices) != -1) {
			randomIndex = Math.floor(Math.random() * activeDeck.cards.length);
		}
		return randomIndex;
	}

})();