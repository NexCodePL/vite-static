import { build } from "./build.js";
import { dev } from "./dev.js";
import { StaticRouteBase, Config } from "./types.js";

export function config<T extends StaticRouteBase<any, any>>(config: Config<T>) {
    const command = process.argv[2];

    switch (command) {
        case "dev":
            return dev(config);

        case "build":
            return build(config);

        default:
            return console.log(`Use 'build' or 'dev' argument`);
    }
}
