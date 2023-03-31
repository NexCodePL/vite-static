export interface StaticRouteBase<TType, TData> {
    path: string;
    id: string;
    type: TType;
    data?: TData;
}

export type StaticRouteBaseGetData<T extends StaticRouteBase<any, any>> = T extends StaticRouteBase<any, infer TData>
    ? TData
    : never;

export interface Config<T extends StaticRouteBase<any, any>> {
    routes: T[];
    getRouteData: (route: T) => Promise<StaticRouteBaseGetData<T>>;
}
