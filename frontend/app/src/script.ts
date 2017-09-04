// /// <reference path="../../typings/index.d.ts" />
// /// <reference path='./model.ts' />


// (function () {



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




// 	function calculateAccuracy(right: number, wrong: number): number {
// 		let x = (!!right) ? right : 0;
// 		let y = (!!wrong) ? wrong : 0;
// 		if (x == 0 && y == 0) return 0;
// 		return Math.floor((right / (right + wrong)) * 100);
// 	}


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

