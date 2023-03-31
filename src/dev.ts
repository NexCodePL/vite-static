import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { Config, StaticRouteBase } from "./types.js";
import { prepareStaticFiles } from "./prepareStaticFiles.js";

export async function dev<TStaticRoute extends StaticRouteBase<any, any>>(config: Config<TStaticRoute>) {
    await prepareStaticFiles(config);

    const server = await createServer({
        configFile: false,
        root: ".",
        plugins: [react()],
        server: {
            port: 3400,
        },
    });

    await server.listen();

    server.printUrls();
}
