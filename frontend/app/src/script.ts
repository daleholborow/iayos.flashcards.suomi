// /// <reference path="../../typings/index.d.ts" />
// /// <reference path='./model.ts' />


// (function () {

// 	const required_score = 10;
// 	const store_key = "store";
// 	let store: flashcards.DeckStore;
// 	store = getStore();


// 	/*
		
// 	*/
// 	function saveStore(): void {
// 		localStorage.setItem(store_key, JSON.stringify(store));
// 	}


// 	/*
		
// 	*/
// 	function getStore(): flashcards.DeckStore {
// 		if (localStorage.getItem(store_key) === null) {
// 			store = new flashcards.DeckStore();
// 			saveStore();
// 		}
// 		else {

// 			store = JSON.parse(localStorage.getItem(store_key));
// 			//console.log("loaded store from localstorage", store);
// 		}
// 		return store;
// 	}


// 	/*
		
// 	*/
// 	function updateSelectedDeck(deckCode: string): void {
// 		store.activeDeckCode = deckCode;
// 		store.activeCardId = 0;

// 		if (!!getActiveDeck() == false) {
// 			//console.log("trying to update selected and didnt find in cache");
// 			$.ajaxSetup({ "async": false });
// 			$.getJSON("/data/" + deckCode + ".json", function (json) {
// 				store.decks[store.decks.length] = json;
// 				saveStore();
// 				console.log("saved a new deck into store", store);
// 				$.ajaxSetup({ "async": false });
// 			});
// 		} else {
// 			//console.log("Selected deck already existed in store", store.decks[deckCode]);
// 		}
// 	}


// 	/*
		
// 	*/
// 	function flipToBack(): void {

// 		// Couldnt pass options to callback in flip, 
// 		$('.answer-button').css('opacity', '0.0');

// 		// var flip = $("#card").data("flip-model");
// 		// // e.g. to see currect flip state
// 		// flip.isFlipped;

// 		$("#card").flip('toggle', ensureAnswerButtonsVisible);
// 	}


// 	/*
		
// 	*/
// 	function ensureAnswerButtonsVisible(): void {
// 		// make the answer buttons show now... they are misbehaving
// 		$('.answer-button').css('opacity', '1.0');  // visible maximum
// 	}


// 	$(document).on('click', '#btn-reset-deck', function() {
// 		let index = store.decks.findIndex(d => d.code == store.activeDeckCode);
// 		if (index > -1) {
// 		   store.decks.splice(index, 1);
// 		   store.activeCardId = null;
// 		   store.activeDeckCode = null;
// 		   saveStore();
// 		}
// 		$.mobile.pageContainer.pagecontainer("change", "#page-home", {
// 			transition: "slidefade", changeHash: false, reload: true, allowSamePageTransition: false
// 		});
// 	});

// 	/*
		
// 	*/
// 	$(document).on('click', '.answer-button', function () {
// 		let chosenAnswerId = $(this).data("answer-card-id");
// 		let isCorrectAnswer: boolean = chooseAnswer(chosenAnswerId);

// 		if (isCorrectAnswer) {
// 			// animate a happy thing
// 			$.mobile.pageContainer.pagecontainer("change", "#page-deck", {
// 				transition: "slidefade", changeHash: false, reload: false, allowSamePageTransition: true
// 			});
// 		}
// 		else {
// 			// animate a sad thing
// 			shake("card");
// 		}
// 		// $.mobile.pageContainer.pagecontainer("change", "#page-deck", {
// 		// 	transition: "slidefade", changeHash: false, reload: false, allowSamePageTransition: true
// 		// });
// 	});


// 	/*
		
// 	*/
// 	function shake(elementId): void {
// 		var div = document.getElementById(elementId);
// 		var interval = 100;
// 		var distance = 10;
// 		var times = 5;
// 		$(div).css('position', 'relative');
// 		for (var iter = 0; iter < (times + 1); iter++) {
// 			$(div).animate({
// 				left: ((iter % 2 == 0 ? distance : distance * -1))
// 			}, interval);
// 		}
// 		$(div).animate({ left: 0 }, interval);
// 	}


// 	/*
		
// 	*/
// 	function chooseAnswer(selectedCardId: number): boolean {

// 		let activeDeck = getActiveDeck();
// 		// Because we deserialized store from JSON some properties might not be set correctly
// 		let activeCard : flashcards.Card = activeDeck.cards.find(x => x.id == store.activeCardId);
// 		if (!!(activeCard.r) == false) {
// 			activeCard.r = 0;
// 		}
// 		if (!!(activeCard.w) == false) {
// 			activeCard.w = 0;
// 		}

// 		let isCorrectAnswer: boolean = validateAnswer(selectedCardId);
// 		if (isCorrectAnswer) {
// 			activeCard.r += 1;
// 		}
// 		else {
// 			activeCard.w += 1;
// 		}

// 		saveStore();

// 		// console.log("Updated the score to  ",
// 		// 	activeDeck.cards[store.activeCardIndex].r,
// 		// 	activeDeck.cards[store.activeCardIndex].w,
// 		// 	activeDeck.cards[store.activeCardIndex].r / (
// 		// 		activeDeck.cards[store.activeCardIndex].r +
// 		// 		activeDeck.cards[store.activeCardIndex].w
// 		// 	)
// 		// );

// 		return isCorrectAnswer;
// 	}


// 	/*
		
// 	*/
// 	function validateAnswer(selectedCardId: number): boolean {
// 		// get the correct answer
// 		let correctCard: flashcards.Card = getActiveDeck().cards.find(x => x.id == store.activeCardId);
// 		let isCorrectAnswer: boolean = (correctCard.id === selectedCardId);
// 		return isCorrectAnswer;
// 	}


// 	/*
		
// 	*/
// 	function navToHome(): void {
// 		$.mobile.pageContainer.pagecontainer("change", "#page-home", {
// 			transition: "flip", changeHash: false, reload: true, allowSamePageTransition: false
// 		});
// 	}


// 	/*
		
// 	*/
// 	function navToScoreboard(): void {
// 		$.mobile.pageContainer.pagecontainer("change", "#page-scoreboard", {
// 			transition: "flip", changeHash: false, reload: false, allowSamePageTransition: false
// 		});
// 	}


// 	/*
		
// 	*/
// 	$("#btn-scoreboard").on('click', function () {

// 		navToScoreboard();

// 	});


// 	/*
		
// 	*/
// 	$(document).on('click', '.select-deck', function () {

// 		let selectedDeckCode = $(this).data("deck-code");
// 		updateSelectedDeck(selectedDeckCode);

// 		// Navigate to the deck view page
// 		$.mobile.pageContainer.pagecontainer("change", "#page-deck", { transition: "flip", changeHash: false, reload: false, allowSamePageTransition: false });

// 	});


// 	/*
		
// 	*/
// 	$("#card").flip({
// 		trigger: 'manual'
// 	});


// 	/*
		
// 	*/
// 	$("#toggle-flashcard").click(function () {
// 		flipToBack();
// 	});


// 	/*
		
// 	*/
// 	function getActiveDeck(): flashcards.Deck {
// 		let deck = store.decks.find(x => x.code == store.activeDeckCode);
// 		return deck;
// 	}


// 	/*
		
// 	*/
// 	function calculateAccuracy(right: number, wrong: number): number {
// 		let x = (!!right) ? right : 0;
// 		let y = (!!wrong) ? wrong : 0;
// 		if (x == 0 && y == 0) return 0;
// 		return Math.floor((right / (right + wrong)) * 100);
// 	}


// 	/*

// 	 */
// 	$(document).on('pagebeforeshow', "#page-scoreboard", function () {
// 		let activeDeck = getActiveDeck();
// 		$("#hd-scoreboard-deckname").text(activeDeck.title);

// 		let myTemplatevalue: string = "dale replace this";
// 		let scoresTbl = $("#tbody-cardscores");
// 		scoresTbl.empty();
// 		for (let card of activeDeck.cards) {
// 			let accuracy = calculateAccuracy(card.r, card.w);
// 			scoresTbl.append(`
// 				<tr>
// 					<td>${card.f}</td>
// 					<td rowspan="2"><div class="center" id="card-id-accuracy${card.id}">${accuracy}%</div></td>
// 					<td rowspan="2">
// 						<div class="center">
// 							<a href="#" data-card-id="${card.id}" class="clear-card ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all">Reset</a>
// 						</div>
// 					</td>
// 				</tr>
// 				<tr>
// 					<td colspan="1">
// 						${card.b} 
// 					</td>
// 				</tr>
// 			`);
// 		}
// 		// Add the appropriate handler to dynamically added reset buttons
// 		$(".clear-card").on('click', function () {
// 			let cardId : number = Number($(this).attr("data-card-id"));
// 			resetCardScore(cardId);
// 			$("#card-id-accuracy" + cardId).text("0%");
// 		});
// 	});


// 	/*
		
// 	*/
// 	function resetCardScore(cardId : number) : void {
// 		getActiveDeck().cards.find(c => c.id == cardId).r = 0;
// 		getActiveDeck().cards.find(c => c.id == cardId).w = 0;
// 		saveStore();
// 	}


// 	/*
		
// 	*/
// 	$(document).on('pagebeforeshow', '#page-deck', function () {

// 		$("#page-deck-header").html(getActiveDeck().title);

// 		// we might want to do something like show the scoreboard every now and then? or maybe an advertisement

// 		if (false) {
// 			// show advert every 10th page ??

// 		}
// 		else {
// 			renderRandomCard();
// 		}
// 	});


// 	/*
		
// 	*/
// 	function renderRandomCard(): void {

// 		// Always set to unflipped initially
// 		var flip = $("#card").data("flip-model");
// 		$("#card").flip(false);

// 		// sometimes show the front, sometimes show the back
// 		let isInFrontMode : boolean = Math.random() >= 0.5;
// 		console.log("isInFrontMode:" + isInFrontMode);

// 		let activeDeck = getActiveDeck();
// 		let usedCardIndices: number[] = [];

// 		let randomCardIndex = getRandomCardIndex(usedCardIndices);
// 		usedCardIndices.push(randomCardIndex);
// 		let card1 = activeDeck.cards[randomCardIndex];
// 		$("#answer1").html(getFaceTextByMode(isInFrontMode, card1));
// 		$("#answer1").data("answer-card-id", card1.id);

// 		randomCardIndex = getRandomCardIndex(usedCardIndices);
// 		usedCardIndices.push(randomCardIndex);
// 		let card2 = activeDeck.cards[randomCardIndex];
// 		$("#answer2").html(getFaceTextByMode(isInFrontMode, card2));
// 		$("#answer2").data("answer-card-id", card2.id);

// 		randomCardIndex = getRandomCardIndex(usedCardIndices);
// 		usedCardIndices.push(randomCardIndex);
// 		let card3 = activeDeck.cards[randomCardIndex];
// 		$("#answer3").html(getFaceTextByMode(isInFrontMode, card3));
// 		$("#answer3").data("answer-card-id", card3.id);

// 		// which one to use as the front?
// 		let currentCardIndex = usedCardIndices[Math.floor(Math.random() * usedCardIndices.length)];
// 		console.log("current card index is" + currentCardIndex);
// 		let currentCard = activeDeck.cards[currentCardIndex];
// 		store.activeCardId = currentCard.id;
// 		$("#frontText").text(getFaceTextByMode(!isInFrontMode, currentCard));
// 		$("#backText").text(getFaceTextByMode(!isInFrontMode, currentCard));
// 	}


// 	/*
// 	We want to be able to randomly shuffly which mode the cards are shown in (ie. randomly show front OR back)
// 	*/
// 	function getFaceTextByMode(isInFrontMode : boolean, card : flashcards.Card) : string {
// 		if (isInFrontMode) {
// 			return card.f;
// 		}
// 		return card.b;
// 	}

// 	/*
		
// 	*/
// 	function getRandomCardIndex(usedCardIndices: number[]): number {
// 		let randomIndex: number = -1;
// 		let activeDeck = getActiveDeck();
// 		while (randomIndex == -1 || $.inArray(randomIndex, usedCardIndices) != -1) {
// 			randomIndex = Math.floor(Math.random() * activeDeck.cards.length);
// 		}
// 		return randomIndex;
// 	}

// })();