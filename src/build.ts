import { readFileSync } from "fs";
import { resolve } from "path";
import { Config, StaticRouteBase } from "./types.js";
import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import { getStaticFile, prepareStaticFiles } from "./prepareStaticFiles.js";
import { writeFile } from "@nexcodepl/fs";

export async function build<T extends StaticRouteBase<any, any>>(config: Config<T>) {
    await prepareStaticFiles(config);

    await viteBuild({
        plugins: [react()],
        build: {
            outDir: "./build/static",
        },
    });

    console.log(`Static assets built`);

    await viteBuild({
        plugins: [react()],
        build: {
            outDir: "./build/prerender",
            ssr: "./src/index-server.tsx",
            copyPublicDir: false,
        },
    });

    console.log(`Render script built`);

    // @ts-ignore
    const { render } = await import(resolve(process.cwd(), "./build/prerender/index-server.js"));

    const template = readFileSync("./build/static/index.html", "utf-8");

    for (const route of config.routes) {
        const staticData = await getStaticFile(route);
        const data = { [`${route.id}`]: staticData };
        const appHtml = render(route.path, data);

        const html = template.replace(`<!--app-html-->`, appHtml).replace(
            `<!--static-data-->`,
            `<script>
            window.staticData = {
                '${route.id}': ${JSON.stringify(staticData)},
            }
        </script>`
        );

        const path = `./build/static${route.path}${route.path !== "/" ? "/" : ""}index.html`;

        writeFile(path, html);
    }
}
