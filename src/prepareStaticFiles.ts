import { readFileJSON, writeFile } from "@nexcodepl/fs";
import { Config, RouteData, StaticRouteBase, StaticRouteBaseGetData } from "./types.js";

export async function prepareStaticFiles<TStaticRoute extends StaticRouteBase<any, any>>(
    config: Config<TStaticRoute>
): Promise<void> {
    for (const route of config.routes) {
        const data = (await config.getRouteData(route)) ?? {};

        await writeFile(`./public/static/${route.id}.json`, JSON.stringify(data));
    }
}

export async function getStaticFile<T extends StaticRouteBase<any, any>>(route: T): Promise<RouteData<T>> {
    const data = await readFileJSON<StaticRouteBaseGetData<T>>(`./public/static/${route.id}.json`);

    if (!data) throw new Error(`Cannot get static-data file ./public/static/${route.id}.json`);

    return data;
}
