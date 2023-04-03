export interface StaticRotueAlternateLocale {
    [localeId: string]: string;
}

export interface StaticRouteBase<TType, TData> {
    path: string;
    id: string;
    type: TType;
    locale: string;
    alternateLocale?: StaticRotueAlternateLocale;
    data?: TData;
}

export type StaticRouteBaseGetData<T extends StaticRouteBase<any, any>> = T extends StaticRouteBase<any, infer TData>
    ? TData
    : never;

export interface RouteData<T extends StaticRouteBase<any, any>> {
    data: StaticRouteBaseGetData<T>;
    htmlData?: HtmlData;
}

export interface Config<T extends StaticRouteBase<any, any>> {
    routes: T[];
    getRouteData: (route: T) => Promise<RouteData<T>>;
    defaultHtmlData?: HtmlData;
}

export interface HtmlHeadMeta {
    charset?: string;
    name?: string;
    content?: string;
    httpEquiv?: string;
    property?: string;
}

export interface HtmlHeadLink {
    rel?: string;
    href?: string;
    sizes?: string;
    type?: string;
    as?: string;
    crossorigin?: string;
    fetchpriority?: string;
}

export interface HtmlHead {
    meta?: HtmlHeadMeta[];
    link?: HtmlHeadLink[];
    title?: string;
}

export interface HtmlData {
    lang?: string;
    head?: HtmlHead;
}
