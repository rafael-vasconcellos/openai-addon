declare type Addon = {
    optionsForm: TranslationEngineOptionForm | TranslationEngineOptionForm['schema']
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
    abortTranslation(): void
    prototype: { 
        translateAllByRows(translator: TranslatorEngine, options): void
    }
};

declare var common: {
    fetch: (...args: any) => any
}

declare var $: CallableFunction

declare var ui: { 
    log(text: any): void
};