//import 'fetch-everywhere';

module ss {

    export interface IReturnVoid {
        createResponse();
    }
    export interface IReturn<T> {
        createResponse(): T;
    }
    export class ResponseStatus {
        errorCode: string;
        message: string;
        stackTrace: string;
        errors: ResponseError[];
        meta: { [index: string]: string; };
    }
    export class ResponseError {
        errorCode: string;
        fieldName: string;
        message: string;
        meta: { [index: string]: string; };
    }
    export class ErrorResponse {
        responseStatus: ResponseStatus;
    }

    export interface IResolver {
        tryResolve(Function): any;
    }

    export class NewInstanceResolver implements IResolver {
        tryResolve(ctor: ObjectConstructor): any {
            return new ctor();
        }
    }

    export class SingletonInstanceResolver implements IResolver {

        tryResolve(ctor: ObjectConstructor): any {
            return (ctor as any).instance
                || ((ctor as any).instance = new ctor());
        }
    }

    export interface ServerEventMessage {
        type: "ServerEventConnect" | "ServerEventHeartbeat" | "ServerEventJoin" | "ServerEventLeave" | "ServerEventUpdate" | "ServerEventMessage";
        eventId: number;
        channel: string;
        data: string;
        selector: string;
        json: string;
        op: string;
        target: string;
        cssSelector: string;
        body: any;
        meta: { [index: string]: string; };
    }

    export interface ServerEventCommand extends ServerEventMessage {
        userId: string;
        displayName: string;
        channels: string;
        profileUrl: string;
    }

    export interface ServerEventConnect extends ServerEventCommand {
        id: string;
        unRegisterUrl: string;
        heartbeatUrl: string;
        updateSubscriberUrl: string;
        heartbeatIntervalMs: number;
        idleTimeoutMs: number;
    }

    export interface ServerEventHeartbeat extends ServerEventCommand { }
    export interface ServerEventJoin extends ServerEventCommand { }
    export interface ServerEventLeave extends ServerEventCommand { }
    export interface ServerEventUpdate extends ServerEventCommand { }

    const TypeMap = {
        onConnect: "ServerEventConnect",
        onHeartbeat: "ServerEventHeartbeat",
        onJoin: "ServerEventJoin",
        onLeave: "ServerEventLeave",
        onUpdate: "ServerEventUpdate"
    };

    export interface IReconnectServerEventsOptions {
        url?: string;
        onerror?: (...args: any[]) => void;
        onmessage?: (...args: any[]) => void;
        error?: Error;
    }

    /**
     * EventSource
     */
    export enum ReadyState { CONNECTING = 0, OPEN = 1, CLOSED = 2 }

    export interface IEventSourceStatic extends EventTarget {
        new(url: string, eventSourceInitDict?: IEventSourceInit): IEventSourceStatic;
        url: string;
        withCredentials: boolean;
        CONNECTING: ReadyState; // constant, always 0
        OPEN: ReadyState; // constant, always 1
        CLOSED: ReadyState; // constant, always 2
        readyState: ReadyState;
        onopen: Function;
        onmessage: (event: IOnMessageEvent) => void;
        onerror: Function;
        close: () => void;
    }

    export interface IEventSourceInit {
        withCredentials?: boolean;
    }

    export interface IOnMessageEvent {
        data: string;
    }

    declare var EventSource: IEventSourceStatic;

    export interface IEventSourceOptions {
        channels?: string;
        handlers?: any;
        receivers?: any;
        onException?: Function;
        onReconnect?: Function;
        onTick?: Function;
        resolver?: IResolver;
        validate?: (request: ServerEventMessage) => boolean;
        heartbeatUrl?: string;
        unRegisterUrl?: string;
        updateSubscriberUrl?: string;
        heartbeatIntervalMs?: number;
        heartbeat?: number;
    }

    export class HttpMethods {
        static Get = "GET";
        static Post = "POST";
        static Put = "PUT";
        static Delete = "DELETE";
        static Patch = "PATCH";
        static Head = "HEAD";
        static Options = "OPTIONS";

        static hasRequestBody = (method: string) =>
            !(method === "GET" || method === "DELETE" || method === "HEAD" || method === "OPTIONS");
    }

    export interface IRequestFilterOptions {
        url: string
    }

    export interface Cookie {
        name: string;
        value: string;
        path: string;
        domain?: string;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: string;
    }

    class GetAccessToken implements IReturn<GetAccessTokenResponse> {
        refreshToken: string;
        createResponse() { return new GetAccessTokenResponse(); }
        getTypeName() { return "GetAccessToken"; }
    }
    export class GetAccessTokenResponse {
        accessToken: string;
        responseStatus: ResponseStatus;
    }

    export interface ISendRequest {
        method: string;
        request: any | null;
        body?: any | null;
        args?: any;
        url?: string;
        returns?: { createResponse: () => any };
    }

    export class JsonServiceClient {
        baseUrl: string;
        replyBaseUrl: string;
        oneWayBaseUrl: string;
        mode: RequestMode;
        credentials: RequestCredentials;
        headers: Headers;
        userName: string;
        password: string;
        bearerToken: string;
        refreshToken: string;
        refreshTokenUri: string;
        requestFilter: (req: Request, options?: IRequestFilterOptions) => void;
        responseFilter: (res: Response) => void;
        exceptionFilter: (res: Response, error: any) => void;
        onAuthenticationRequired: () => Promise<any>;
        manageCookies: boolean;
        cookies: { [index: string]: Cookie };

        static toBase64: (rawString: string) => string;

        constructor(baseUrl: string) {
            if (baseUrl == null)
                throw "baseUrl is required";

            this.baseUrl = baseUrl;
            this.replyBaseUrl = combinePaths(baseUrl, "json", "reply") + "/";
            this.oneWayBaseUrl = combinePaths(baseUrl, "json", "oneway") + "/";

            this.mode = "cors";
            this.credentials = 'include';
            this.headers = new Headers();
            this.headers.set("Content-Type", "application/json");
            this.manageCookies = typeof document == "undefined"; //because node-fetch doesn't
            this.cookies = {};
        }

        setCredentials(userName: string, password: string): void {
            this.userName = userName;
            this.password = password;
        }

        // @deprecated use bearerToken property
        setBearerToken(token: string): void {
            this.bearerToken = token;
        }

        get<T>(request: IReturn<T> | string, args?: any): Promise<T> {
            return typeof request != "string"
                ? this.send<T>(HttpMethods.Get, request, args)
                : this.send<T>(HttpMethods.Get, null, args, this.toAbsoluteUrl(request));
        }

        delete<T>(request: IReturn<T> | string, args?: any): Promise<T> {
            return typeof request != "string"
                ? this.send<T>(HttpMethods.Delete, request, args)
                : this.send<T>(HttpMethods.Delete, null, args, this.toAbsoluteUrl(request));
        }

        post<T>(request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Post, request, args);
        }

        postToUrl<T>(url: string, request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Post, request, args, this.toAbsoluteUrl(url));
        }

        postBody<T>(request: IReturn<T>, body: string | any, args?: any) {
            return this.sendBody<T>(HttpMethods.Post, request, body, args);
        }

        put<T>(request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Put, request, args);
        }

        putToUrl<T>(url: string, request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Put, request, args, this.toAbsoluteUrl(url));
        }

        putBody<T>(request: IReturn<T>, body: string | any, args?: any) {
            return this.sendBody<T>(HttpMethods.Post, request, body, args);
        }

        patch<T>(request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Patch, request, args);
        }

        patchToUrl<T>(url: string, request: IReturn<T>, args?: any): Promise<T> {
            return this.send<T>(HttpMethods.Patch, request, args, this.toAbsoluteUrl(url));
        }

        patchBody<T>(request: IReturn<T>, body: string | any, args?: any) {
            return this.sendBody<T>(HttpMethods.Post, request, body, args);
        }

        createUrlFromDto<T>(method: string, request: IReturn<T>): string {
            let url = combinePaths(this.replyBaseUrl, nameOf(request));

            const hasRequestBody = HttpMethods.hasRequestBody(method);
            if (!hasRequestBody)
                url = appendQueryString(url, request);

            return url;
        }

        toAbsoluteUrl(relativeOrAbsoluteUrl: string): string {
            return relativeOrAbsoluteUrl.startsWith("http://") ||
                relativeOrAbsoluteUrl.startsWith("https://")
                ? relativeOrAbsoluteUrl
                : combinePaths(this.baseUrl, relativeOrAbsoluteUrl);
        }

        private createRequest({ method, request, url, args, body }: ISendRequest): [Request, IRequestFilterOptions] {

            if (!url)
                url = this.createUrlFromDto(method, request);
            if (args)
                url = appendQueryString(url, args);

            if (this.bearerToken != null) {
                this.headers.set("Authorization", "Bearer " + this.bearerToken);
            }
            else if (this.userName != null) {
                this.headers.set('Authorization', 'Basic ' + JsonServiceClient.toBase64(`${this.userName}:${this.password}`));
            }

            if (this.manageCookies) {
                var cookies = Object.keys(this.cookies)
                    .map(x => {
                        var c = this.cookies[x];
                        return c.expires && c.expires < new Date()
                            ? null
                            : `${c.name}=${encodeURIComponent(c.value)}`
                    })
                    .filter(x => !!x);

                if (cookies.length > 0)
                    this.headers.set("Cookie", cookies.join("; "));
                else
                    this.headers.delete("Cookie");
            }

            // Set `compress` false due to common error
            // https://github.com/bitinn/node-fetch/issues/93#issuecomment-200791658
            var reqOptions = {
                method: method,
                mode: this.mode,
                credentials: this.credentials,
                headers: this.headers,
                compress: false
            };
            const req = new Request(url, reqOptions);

            if (HttpMethods.hasRequestBody(method))
                (req as any).body = body || JSON.stringify(request);

            var opt: IRequestFilterOptions = { url };
            if (this.requestFilter != null)
                this.requestFilter(req, opt);

            return [req, opt];
        }

        private createResponse<T>(res: Response, request: any | null) {
            if (!res.ok)
                throw res;

            if (this.manageCookies) {
                var setCookies = [];
                res.headers.forEach((v, k) => {
                    if ("set-cookie" == k.toLowerCase())
                        setCookies.push(v);
                });
                setCookies.forEach(x => {
                    var cookie = parseCookie(x);
                    if (cookie)
                        this.cookies[cookie.name] = cookie;
                });
            }

            if (this.responseFilter != null)
                this.responseFilter(res);

            var x = request && typeof request != "string" && typeof request.createResponse == 'function'
                ? request.createResponse()
                : null;

            if (typeof x === 'string')
                return res.text().then(o => o as Object as T);

            var contentType = res.headers.get("content-type");
            var isJson = contentType && contentType.indexOf("application/json") !== -1;
            if (isJson) {
                return res.json().then(o => o as Object as T);
            }

            if (typeof Uint8Array != "undefined" && x instanceof Uint8Array) {
                if (typeof res.arrayBuffer != 'function')
                    throw new Error("This fetch polyfill does not implement 'arrayBuffer'");

                return res.arrayBuffer().then(o => new Uint8Array(o) as Object as T);

            } else if (typeof Blob == "function" && x instanceof Blob) {
                if (typeof res.blob != 'function')
                    throw new Error("This fetch polyfill does not implement 'blob'");

                return res.blob().then(o => o as Object as T);
            }

            let contentLength = res.headers.get("content-length");
            if (contentLength === "0" || (contentLength == null && !isJson)) {
                return x;
            }

            return res.json().then(o => o as Object as T); //fallback
        }

        private handleError(holdRes: Response, res) {

            if (res instanceof Error)
                throw this.raiseError(holdRes, res);

            // res.json can only be called once.
            if (res.bodyUsed)
                throw this.raiseError(res, createErrorResponse(res.status, res.statusText));

            if (typeof res.json == "undefined" && res.responseStatus) {
                return new Promise((resolve, reject) =>
                    reject(this.raiseError(null, res))
                );
            }

            return res.json().then(o => {
                var errorDto = sanitize(o);
                if (!errorDto.responseStatus)
                    throw createErrorResponse(res.status, res.statusText);
                throw errorDto;
            }).catch(error => {
                // No responseStatus body, set from `res` Body object
                if (error instanceof Error)
                    throw this.raiseError(res, createErrorResponse(res.status, res.statusText));
                throw this.raiseError(res, error);
            });
        }

        send<T>(method: string, request: any | null, args?: any, url?: string): Promise<T> {
            return this.sendRequest<T>({ method, request, args, url });
        }

        private sendBody<T>(method: string, request: IReturn<T>, body: string | any, args?: any) {
            let url = combinePaths(this.replyBaseUrl, nameOf(request));
            return this.sendRequest<T>({
                method,
                request: body,
                body: typeof body == "string" ? body : JSON.stringify(body),
                url: appendQueryString(url, request),
                args,
                returns: request
            });
        }

        sendRequest<T>(info: ISendRequest): Promise<T> {

            const [req, opt] = this.createRequest(info);

            const returns = info.returns || info.request;

            let holdRes: Response = null;
            return fetch(opt.url || req.url, req)
                .then(res => {
                    holdRes = res;
                    const response = this.createResponse(res, returns);
                    return response;
                })
                .catch(res => {

                    if (res.status === 401) {
                        if (this.refreshToken) {
                            const jwtReq = new GetAccessToken();
                            jwtReq.refreshToken = this.refreshToken;
                            let url = this.refreshTokenUri || this.createUrlFromDto(HttpMethods.Post, jwtReq);
                            return this.postToUrl<GetAccessTokenResponse>(url, jwtReq)
                                .then(r => {
                                    this.bearerToken = r.accessToken;
                                    const [req, opt] = this.createRequest(info);
                                    return fetch(opt.url || req.url, req)
                                        .then(res => this.createResponse(res, returns))
                                        .catch(res => this.handleError(holdRes, res));
                                })
                                .catch(res => this.handleError(holdRes, res));
                        }

                        if (this.onAuthenticationRequired) {
                            return this.onAuthenticationRequired().then(() => {
                                const [req, opt] = this.createRequest(info);
                                return fetch(opt.url || req.url, req)
                                    .then(res => this.createResponse(res, returns))
                                    .catch(res => this.handleError(holdRes, res));
                            });
                        }
                    }

                    return this.handleError(holdRes, res);
                });
        }

        raiseError(res: Response, error: any): any {
            if (this.exceptionFilter != null) {
                this.exceptionFilter(res, error);
            }
            return error;
        }
    }

    const createErrorResponse = (errorCode: string | number, message: string) => {
        const error = new ErrorResponse();
        error.responseStatus = new ResponseStatus();
        error.responseStatus.errorCode = errorCode && errorCode.toString();
        error.responseStatus.message = message;
        return error;
    };

    export const toCamelCase = (key: string) => {
        return !key ? key : key.charAt(0).toLowerCase() + key.substring(1);
    };

    export const sanitize = (status: any): any => {
        if (status.responseStatus)
            return status;
        if (status.errors)
            return status;
        var to: any = {};

        for (let k in status) {
            if (status.hasOwnProperty(k)) {
                if (status[k] instanceof Object)
                    to[toCamelCase(k)] = sanitize(status[k]);
                else
                    to[toCamelCase(k)] = status[k];
            }
        }

        to.errors = [];
        if (status.Errors != null) {
            for (var i = 0, len = status.Errors.length; i < len; i++) {
                var o = status.Errors[i];
                var err = {};
                for (var k in o)
                    err[toCamelCase(k)] = o[k];
                to.errors.push(err);
            }
        }

        return to;
    }

    export const nameOf = (o: any) => {
        if (!o)
            return "null";

        if (typeof o.getTypeName == "function")
            return o.getTypeName();

        var ctor = o && o.constructor;
        if (ctor == null)
            throw `${o} doesn't have constructor`;

        if (ctor.name)
            return ctor.name;

        var str = ctor.toString();
        return str.substring(9, str.indexOf("(")); //"function ".length == 9
    };

    /* utils */

    function log<T>(o: T, prefix: string = "LOG") {
        console.log(prefix, o);
        return o;
    }

    export const css = (selector: string | NodeListOf<Element>, name: string, value: string) => {
        const els = typeof selector == "string"
            ? document.querySelectorAll(selector as string)
            : selector as NodeListOf<Element>;

        for (let i = 0; i < els.length; i++) {
            const el = els[i] as any;
            if (el != null && el.style != null) {
                el.style[name] = value;
            }
        }
    }

    export const splitOnFirst = (s: string, c: string): string[] => {
        if (!s) return [s];
        var pos = s.indexOf(c);
        return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s];
    };

    export const splitOnLast = (s: string, c: string): string[] => {
        if (!s) return [s];
        var pos = s.lastIndexOf(c);
        return pos >= 0
            ? [s.substring(0, pos), s.substring(pos + 1)]
            : [s];
    };

    const splitCase = (t: string) =>
        typeof t != 'string' ? t : t.replace(/([A-Z]|[0-9]+)/g, ' $1').replace(/_/g, ' ').trim();

    export const humanize = s => (!s || s.indexOf(' ') >= 0 ? s : splitCase(s));

    export const queryString = (url: string): any => {
        if (!url || url.indexOf('?') === -1) return {};
        var pairs = splitOnFirst(url, '?')[1].split('&');
        var map = {};
        for (var i = 0; i < pairs.length; ++i) {
            var p = pairs[i].split('=');
            map[p[0]] = p.length > 1
                ? decodeURIComponent(p[1].replace(/\+/g, ' '))
                : null;
        }
        return map;
    };

    export const combinePaths = (...paths: string[]): string => {
        var parts = [], i, l;
        for (i = 0, l = paths.length; i < l; i++) {
            var arg = paths[i];
            parts = arg.indexOf("://") === -1
                ? parts.concat(arg.split("/"))
                : parts.concat(arg.lastIndexOf("/") === arg.length - 1 ? arg.substring(0, arg.length - 1) : arg);
        }
        var combinedPaths = [];
        for (i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if (!part || part === ".") continue;
            if (part === "..") combinedPaths.pop();
            else combinedPaths.push(part);
        }
        if (parts[0] === "") combinedPaths.unshift("");
        return combinedPaths.join("/") || (combinedPaths.length ? "/" : ".");
    };

    export const createPath = (route: string, args: any) => {
        var argKeys = {};
        for (let k in args) {
            argKeys[k.toLowerCase()] = k;
        }
        var parts = route.split("/");
        var url = "";
        for (let i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (p == null) p = "";
            if (p[0] === "{" && p[p.length - 1] === "}") {
                const key = argKeys[p.substring(1, p.length - 1).toLowerCase()];
                if (key) {
                    p = args[key];
                    delete args[key];
                }
            }
            if (url.length > 0) url += "/";
            url += p;
        }
        return url;
    };

    export const createUrl = (route: string, args: any) => {
        var url = createPath(route, args);
        return appendQueryString(url, args);
    };

    export const appendQueryString = (url: string, args: any): string => {
        for (let k in args) {
            if (args.hasOwnProperty(k)) {
                url += url.indexOf("?") >= 0 ? "&" : "?";
                url += k + "=" + qsValue(args[k]);
            }
        }
        return url;
    };

    const qsValue = (arg: any) => {
        if (arg == null)
            return "";
        if (typeof Uint8Array != "undefined" && arg instanceof Uint8Array)
            return bytesToBase64(arg as Uint8Array);
        return encodeURIComponent(arg) || "";
    }

    //from: https://github.com/madmurphy/stringview.js/blob/master/stringview.js
    export const bytesToBase64 = (aBytes: Uint8Array): string => {
        var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";
        for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }
        return eqLen === 0
            ? sB64Enc
            : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
    }

    const uint6ToB64 = (nUint6: number): number =>
        nUint6 < 26 ?
            nUint6 + 65
            : nUint6 < 52 ?
                nUint6 + 71
                : nUint6 < 62 ?
                    nUint6 - 4
                    : nUint6 === 62 ? 43
                        : nUint6 === 63 ? 47 : 65;

    //JsonServiceClient.toBase64 requires IE10+ or node
    interface NodeBuffer extends Uint8Array {
        toString(encoding?: string, start?: number, end?: number): string;
    }
    interface Buffer extends NodeBuffer { }
    declare var Buffer: {
        new(str: string, encoding?: string): Buffer;
    }
    var _btoa = typeof btoa == 'function'
        ? btoa
        : (str) => new Buffer(str).toString('base64');

    //from: http://stackoverflow.com/a/30106551/85785
    JsonServiceClient.toBase64 = (str: string) =>
        _btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match: any, p1: string) =>
            String.fromCharCode(new Number('0x' + p1).valueOf())
        ));

    export const stripQuotes = (s: string) =>
        s && s[0] == '"' && s[s.length] == '"' ? s.slice(1, -1) : s;

    export const tryDecode = (s: string) => {
        try {
            return decodeURIComponent(s);
        } catch (e) {
            return s;
        }
    };

    export const parseCookie = (setCookie: string): Cookie => {
        if (!setCookie)
            return null;
        var to: Cookie = null;
        var pairs = setCookie.split(/; */);
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var parts = splitOnFirst(pair, '=');
            var name = parts[0].trim();
            var value = parts.length > 1 ? tryDecode(stripQuotes(parts[1].trim())) : null;
            if (i == 0) {
                to = { name, value, path: "/" };
            } else {
                var lower = name.toLowerCase();
                if (lower == "httponly") {
                    to.httpOnly = true;
                } else if (lower == "secure") {
                    to.secure = true;
                } else if (lower == "expires") {
                    to.expires = new Date(value);
                } else {
                    to[name] = value;
                }
            }
        }
        return to;
    }

    export const normalizeKey = (key: string) => key.toLowerCase().replace(/_/g, '');

    const isArray = (o: any) => Object.prototype.toString.call(o) === '[object Array]';

    export const normalize = (dto: any, deep?: boolean) => {
        if (isArray(dto)) {
            if (!deep) return dto;
            const to = [];
            for (let i = 0; i < dto.length; i++) {
                to[i] = normalize(dto[i], deep);
            }
            return to;
        }
        if (typeof dto != "object") return dto;
        var o = {};
        for (let k in dto) {
            o[normalizeKey(k)] = deep ? normalize(dto[k], deep) : dto[k];
        }
        return o;
    }

    export const getField = (o: any, name: string) =>
        o == null || name == null ? null :
            o[name] ||
            o[Object.keys(o).filter(k => normalizeKey(k) === normalizeKey(name))[0] || ''];

    export const parseResponseStatus = (json: string, defaultMsg = null) => {
        try {
            var err = JSON.parse(json);
            return sanitize(err.ResponseStatus || err.responseStatus);
        } catch (e) {
            return {
                message: defaultMsg || e.message || e,
                __error: { error: e, json: json }
            };
        }
    };

    export const toDate = (s: string) => new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1]));
    export const toDateFmt = (s: string) => dateFmt(toDate(s));
    export const padInt = (n: number) => n < 10 ? '0' + n : n;
    export const dateFmt = (d: Date = new Date()) => d.getFullYear() + '/' + padInt(d.getMonth() + 1) + '/' + padInt(d.getDate());
    export const dateFmtHM = (d: Date = new Date()) => d.getFullYear() + '/' + padInt(d.getMonth() + 1) + '/' + padInt(d.getDate()) + ' ' + padInt(d.getHours()) + ":" + padInt(d.getMinutes());
    export const timeFmt12 = (d: Date = new Date()) => padInt((d.getHours() + 24) % 12 || 12) + ":" + padInt(d.getMinutes()) + ":" + padInt(d.getSeconds()) + " " + (d.getHours() > 12 ? "PM" : "AM");
}