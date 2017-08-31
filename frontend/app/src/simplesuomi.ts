/// <reference path='./model.ts' />
/// <reference path='./flashcardapi.dtos.ts' />
/// <reference path='./servicestack-client.ts' />
/// <reference path="../../typings/index.d.ts" />

(function () {
    
    const applicationId = "00000000000000000000000000000000";

    const client = new ss.JsonServiceClient("http://flashcardapi.eladaus.com/api");
    
    
    // $("#homepagelogo").bind("click", function (e) {
    //     e.preventDefault();
    //     console.log("clocked the logo");
    // });

    // $("#homepagelogo").click(function() {
    //     console.log("handler for img click callsed");
    // });


    // $(function () {
        
    //         $('#homepagelogo').on('click', 'a', function (e) {
    //             console.log('this is the click');
    //             e.preventDefault();
    //         });
        
    //     });

    console.log("got here", $("#homepagelogo"));
    function BuildAndGoToDeckCategoriesPage() {

        QueryDeckCategories().then(results => {
            console.log("after our asycncccalled", results);
        });

    }

    
    // myApp.onPageInit('about', function (page) {
    //     alert('going to the about pageXY');
    // //        your functions loaded here.....
    // })
    
    // myApp.onPageInit('about', function (page) {
    //     alert('going to the about page');
    // //        your functions loaded here.....
    // })

    const QueryDeckCategories = async () => {
        let request = new dtos.ListDeckCategoriesByApplicationRequest();
        request.applicationId = applicationId;
        try {
            const data = await client.get(request)
            //console.log("data that came back", data)
            return data;
          } catch (err) {
            console.log(err)
          }
    }
    // // const required_score = 10;
	// // const store_key = "store";
	// // let store: flashcards.DeckStore;
	// // store = getStore(); 

    // // let stuff : flashcards.Deck;
    // // stuff = new flashcards.Deck();

    // let request: dtos.ListDeckCategoriesByApplicationRequest;
    // request = new dtos.ListDeckCategoriesByApplicationRequest();  

    // // const response = client.get(request).then(data => {console.log("the data is", data); return data;}).catch(error => { console.log(error); return error });
    // // console.log("the response is", response);

    // let data: dtos.ListDeckCategoriesByApplicationRequestResponse;

    

    // const makeRequest =  async () => {
    //     // console.log(await client.get(request))
    //     // return "done"
    //     let data: dtos.ListDeckCategoriesByApplicationRequestResponse;
    //     try {
    //         // this parse may fail
    //         const data = await client.get(request)
    //         console.log("data that came back", data)
    //         return data;
    //       } catch (err) {
    //         console.log(err)
    //       }
    // }
    // //console.log("ended with", makeRequest);

    // // const result =  makeRequest(data);
    // // console.log("now the reuslt was", result, data);
    // makeRequest().then(data => {
    //     console.log("after our asycncccalled", data);
    // })

    // // const response2 = await client.get(request);
    // // console.log("the response is", response2);

    // // const blah =  response.then(() => {
    // //     console.log(blah.)
    // // })

    

//    $.getJSON(createUrl("http://flashcardapi.eladaus.com/api/applications/3b05754d-b2c0-4c5a-9b32-70bda5b8efb4/deckCategories", request), request, 
//    function (r: dtos.ListDeckCategoriesByApplicationRequestResponse) {
//        console.log("we got the results: ", r.results);
//    });

//    alert(shit);
    
// function createUrl(path: string, params: any): string {
//     for (var key in params) {
//         path += path.indexOf('?') < 0 ? "?" : "&";
//         path += key + "=" + encodeURIComponent(params[key]);
//     }
//     return path;
// }
})();