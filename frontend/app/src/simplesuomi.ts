/// <reference path='./my-app.ts' />
/// <reference path='./model.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />

var mySS = (function () {

    const applicationId = "00000000000000000000000000000000";

    const client = new ss.JsonServiceClient("http://flashcardapi.eladaus.com/api");

    function flipit() {

    }

    const DeckAccordionItemTemplate = (dto : dtos.DeckDto) => {
        // console.log("in here", dto);
        return `
            <li class="item-content">
                <div class="item-inner">
                <div class="item-title"><a href="flashcards.html?${dto.deckId}" >${dto.name}</a></div>
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
        QueryDeckCategories(applicationId).then(response => {
            $("#deckCategoryList").html(response.results.map(DeckCategoryAccordionTemplate).join(''));
        });
    }

    function BuildAndGoToCardsPage(deckId : string) {
        QueryDeckWithCards(deckId).then(response => {
            console.log(response.result);
        });
    }

    // myApp.onPageInit('index', function(page){
    //     console.log("i am totaly in here");
    //     $('#homepagelogo').click(function () {
    //         //parent.history.back();
    //         console.log("testing");
    //         //myApp.
    //         //return false;
    //         $('#lnkDeckcategories').trigger('click');
    //     });

    // });

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
        // Always set to unflipped initially
        let flashcard = $("#card");
        let flipModel = flashcard.data('flip-model');

        // flashcard.flip({
        //     		trigger: 'manual'
        //     	});

		// var flip = $("#card").data("flip-model");
		// $("#card").flip(false);
        console.log("going to flashcards onPageInit", flashcard, flipModel);
    });
    myApp.onPageBeforeAnimation('flashcards', function (page) {
        let flashcard = $("#card");
        let flipModel = flashcard.data('flip-model');
        console.log("does it have a model?", flipModel);
        flashcard.flip({
            trigger: 'manual'
        });
        flipModel = flashcard.data('flip-model');
        // Always set to unflipped initially
		// var flip = $("#card").data("flip-model");
		// $("#card").flip(false);
        console.log("going to flashcard onPageBeforeAnimation", flashcard, flipModel);
    });

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

    // function removeClass(element: JQueryEventObject) {
    //     console.log(element);
    //     element.currentTarget.className = "";
    //     //removeClass("animated flip");
    // }


    return {
        doSomeStuff: function (elId: string) {

            let flashcard = $("#card");
            let flipModel = flashcard.data('flip-model');
            console.log("after flipping the flipmodel is", flipModel);

            console.log("blah blah do some stuff to ", elId);
            let flipTarget = $("#"+elId);
            // flipTarget.addClass('animated flip');
            // flipTarget.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeClass)
            flipTarget.flip();

            flipTarget.flip('toggle');
        },

        fliptoback : function() {
            $("#card").flip(true);
        },
        fliptofront : function() {
            $("#card").flip(false);
        }
    }

})();