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

declare var $: CallableFunction & { 
    ready(callback: CallableFunction): unknown
}

declare var ui: any;