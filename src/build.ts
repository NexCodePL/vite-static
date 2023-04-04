import { readFileSync } from "fs";
import { resolve } from "path";
import { Config, HtmlData, StaticRouteBase } from "./types.js";
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

        const htmlData = mergeData(config.defaultHtmlData, staticData.htmlData);

        const headContent = generateHeadContent(htmlData);

        const html = template
            .replace(`{lang}`, htmlData.lang ?? "en")
            .replace(`<!--head-data-->`, headContent)
            .replace(
                `<!--static-data-->`,
                `<script>
            window.staticData = {
                '${route.id}': ${JSON.stringify(staticData)},
            }
        </script>`
            )
            .replace(`<!--app-html-->`, appHtml);

        const path = `./build/static${route.path}${route.path !== "/" ? "/" : ""}index.html`;

        writeFile(path, html);
    }
}

function mergeData(defaultHtmlData: HtmlData | undefined, routeHtmlDataRaw: HtmlData | undefined): HtmlData {
    const htmlData: HtmlData = defaultHtmlData === undefined ? {} : copy(defaultHtmlData);
    const routeHtmlData = copy(routeHtmlDataRaw);
    if (!routeHtmlData) return htmlData;

    if (routeHtmlData.lang !== undefined) htmlData.lang = routeHtmlData.lang;
    if (!routeHtmlData.head) return htmlData;

    if (!htmlData.head) htmlData.head = {};
    if (!htmlData.head.link) htmlData.head.link = [];
    if (!htmlData.head.meta) htmlData.head.meta = [];

    if (routeHtmlData.head.title !== undefined) htmlData.head.title = routeHtmlData.head.title;

    htmlData.head.link.push(...(routeHtmlData.head.link ?? []));

    for (const meta of routeHtmlData.head.meta ?? []) {
        if (meta.name) {
            const linkIndex = htmlData.head.meta.findIndex(e => e.name === meta.name);
            if (linkIndex !== -1) {
                htmlData.head.meta.splice(linkIndex, 1, meta);
                continue;
            }
        }
        htmlData.head.meta.push(meta);
    }

    return htmlData;
}

function copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

function generateHeadContent(htmlData: HtmlData): string {
    const headElements: string[] = [];

    if (htmlData.head?.title) {
        headElements.push(`<title>${htmlData.head.title}</title>`);
    }

    for (const meta of htmlData.head?.meta ?? []) {
        const metaElements: string[] = [
            elem(meta.charset, "charset"),
            elem(meta.content, "content"),
            elem(meta.httpEquiv, "http-equiv"),
            elem(meta.name, "name"),
            elem(meta.property, "property"),
        ].filter(e => e !== "");
        headElements.push(`<meta ${metaElements.join(" ")} data-vitestatic="1" />`);
    }

    for (const link of htmlData.head?.link ?? []) {
        const linkElements: string[] = [
            elem(link.as, "as"),
            elem(link.crossorigin, "crossorigin"),
            elem(link.fetchpriority, "fetchpriority"),
            elem(link.href, "href"),
            elem(link.rel, "rel"),
            elem(link.sizes, "sizes"),
            elem(link.type, "type"),
        ].filter(e => e !== "");
        headElements.push(`<link ${linkElements.join(" ")} data-vitestatic="1" />`);
    }

    return headElements.join("\r\n");
}

function elem(value: string | undefined, prop: string): string {
    if (value === undefined) return "";
    return `${prop}="${value}"`;
}
