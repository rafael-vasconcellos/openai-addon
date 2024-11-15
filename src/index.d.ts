declare module "https://cdn.jsdelivr.net/npm/@google/generative-ai@0.21.0/dist/index.min.js" {
    export * from "@google/generative-ai";
}

declare type Addon = {
    package: {
        name: string,
        author: {
            name: string
        },
        version: string,
        description: string,
    };
    getPathRelativeToRoot: () => string;
}

declare var trans: {
    [id: string]: TranslatorEngine;
    getSl(): string;
    getTl(): string;
};

declare var common: {
    fetch: (...args: any) => any
}

declare var $: CallableFunction

declare var ui: any;