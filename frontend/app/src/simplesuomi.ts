/// <reference path='./my-app.ts' />
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

        QueryDeckCategories(applicationId).then(response => {
            console.log("after our asycncccalled", response.results);
        });

    }

    
    myApp.onPageInit('about', function (page) {
        console.log('going to the about page' + Date.now());
    });

    myApp.onPageInit('deckcategories', function (page) {
        console.log('going o view deck categories' + Date.now());
        BuildAndGoToDeckCategoriesPage();
    });
    

    const QueryDeckCategories = async (applicationId : string) => {
        let request = new dtos.ListDeckCategoriesByApplicationRequest();
        request.applicationId = applicationId;
        try {
            const response = await client.get(request)
            return response;
          } catch (err) {
            console.log(err)
          }
    }

})();