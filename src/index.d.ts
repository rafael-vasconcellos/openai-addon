declare type Addon = {
    optionsForm: TranslationEngineOptionForm
    package: {
        name: string,
        author: {
            name: string
        },
        version: string,
        description: string,
        title: string
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