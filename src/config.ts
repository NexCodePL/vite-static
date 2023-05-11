import { InlineConfig } from "vite";
import { build } from "./build.js";
import { dev } from "./dev.js";
import { StaticRouteBase, Config } from "./types.js";

export function config<T extends StaticRouteBase<any, any>>(config: Config<T>, viteConfig: InlineConfig = {}) {
    const command = process.argv[2];

    switch (command) {
        case "dev":
            return dev(config, viteConfig);

        case "build":
            return build(config, viteConfig);

        default:
            return console.log(`Use 'build' or 'dev' argument`);
    }
}
