module flashcards {
	export class Card {
		id: number = -1;
		f: string = null;	// front
		b: string = null;  // back
		score: number = 0;		// how many times has the user answered this correctly
	}

	export class Deck {
		id: number = -1;
		code: string = null;
		title: string = null;
		cards: Card[] = [];
	}

	
	export class DeckStore  {

		activeDeckCode: string = null;

		activeCardIndex: number = 0;

		decks: Deck[] = [];

		constructor() {

		}

	}

}

