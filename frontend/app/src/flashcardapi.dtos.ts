/* Options:
Date: 2017-09-01 12:09:58
Version: 4.512
Tip: To override a DTO option, remove "//" prefix before updating
BaseUrl: http://flashcardapi.eladaus.com/api

GlobalNamespace: dtos
//MakePropertiesOptional: True
//AddServiceStackTypes: True
//AddResponseStatus: False
//AddImplicitVersion: 
//AddDescriptionAsComments: True
//IncludeTypes: 
//ExcludeTypes: 
//DefaultImports: 
*/


module dtos
{

    export interface IReturnVoid
    {
        createResponse() : void;
    }

    export interface IReturn<T>
    {
        createResponse() : T;
    }

    // @DataContract
    export class ResponseError
    {
        // @DataMember(Order=1, EmitDefaultValue=false)
        errorCode: string;

        // @DataMember(Order=2, EmitDefaultValue=false)
        fieldName: string;

        // @DataMember(Order=3, EmitDefaultValue=false)
        message: string;

        // @DataMember(Order=4, EmitDefaultValue=false)
        meta: { [index:string]: string; };
    }

    // @DataContract
    export class ResponseStatus
    {
        // @DataMember(Order=1)
        errorCode: string;

        // @DataMember(Order=2)
        message: string;

        // @DataMember(Order=3)
        stackTrace: string;

        // @DataMember(Order=4)
        errors: ResponseError[];

        // @DataMember(Order=5)
        meta: { [index:string]: string; };
    }

    export class Response
    {
        // @DataMember(Order=1)
        responseStatus: ResponseStatus;
    }

    export class UnitPayloadResponse<TPayloadDto> extends Response
    {
        // @DataMember(Order=2)
        result: TPayloadDto;
    }

    export type LanguageFlag = "ENGLISH" | "FINNISH" | "GERMAN" | "SPANISH";

    export class CardDto
    {
        cardId: string;
        order: number;
        frontText: string;
        backText: string;
    }

    export class DeckDto
    {
        deckId: string;
        name: string;
        frontLanguage: LanguageFlag;
        backLanguage: LanguageFlag;
        numberOfCards: number;
        cards: CardDto[];
    }

    export class DeckCategoryDto
    {
        deckCategoryId: string;
        name: string;
        decks: DeckDto[];
    }

    export class ApplicationDto
    {
        id: string;
        name: string;
        deckCategoryDtos: DeckCategoryDto[];
    }

    export class ListPayloadResponse<TPayloadDto> extends Response
    {
        // @DataMember(Order=2)
        total: number;

        // @DataMember(Order=3)
        offset: number;

        // @DataMember(Order=4)
        results: TPayloadDto[];
    }

    export class CreateApplicationRequestResponse extends UnitPayloadResponse<string>
    {
    }

    export class GetApplicationByIdRequestResponse extends UnitPayloadResponse<ApplicationDto>
    {
    }

    export class CreateDeckRequestResponse extends UnitPayloadResponse<string>
    {
    }

    export class GetDeckRequestResponse extends UnitPayloadResponse<DeckDto>
    {
    }

    export class ListDeckCategoriesByApplicationRequestResponse extends ListPayloadResponse<DeckCategoryDto>
    {
    }

    // @Route("/applications", "POST")
    export class CreateApplicationRequest implements IReturn<CreateApplicationRequestResponse>
    {
        name: string;
        createResponse() { return new CreateApplicationRequestResponse(); }
        getTypeName() { return "CreateApplicationRequest"; }
    }

    // @Route("/applications/{applicationId}", "GET")
    export class GetApplicationByIdRequest implements IReturn<GetApplicationByIdRequestResponse>
    {
        applicationId: string;
        createResponse() { return new GetApplicationByIdRequestResponse(); }
        getTypeName() { return "GetApplicationByIdRequest"; }
    }

    // @Route("/decks", "POST")
    export class CreateDeckRequest implements IReturn<CreateDeckRequestResponse>
    {
        applicationId: string;
        deckCategoryId: string;
        name: string;
        frontLanguage: LanguageFlag;
        backLanguage: LanguageFlag;
        createResponse() { return new CreateDeckRequestResponse(); }
        getTypeName() { return "CreateDeckRequest"; }
    }

    // @Route("/applications/{applicationId}/decks/{deckId}", "GET")
    export class GetDeckRequest implements IReturn<GetDeckRequestResponse>
    {
        applicationId: string;
        deckId: string;
        createResponse() { return new GetDeckRequestResponse(); }
        getTypeName() { return "GetDeckRequest"; }
    }

    // @Route("/applications/{applicationId}/deckCategories", "GET")
    export class ListDeckCategoriesByApplicationRequest implements IReturn<ListDeckCategoriesByApplicationRequestResponse>
    {
        applicationId: string;
        includeDecks: boolean;
        createResponse() { return new ListDeckCategoriesByApplicationRequestResponse(); }
        getTypeName() { return "ListDeckCategoriesByApplicationRequest"; }
    }

}
