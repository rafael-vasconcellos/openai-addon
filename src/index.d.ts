interface ContextMenuItem { 
    name: string
    callback: CallableFunction
}

declare type Addon = { 
    optionsForm: TranslationEngineOptionForm | TranslationEngineOptionForm['schema']
    package: {
        name: string,
        author: {
            name: string
        } | string,
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
    grid: Grid
    data: string[][]
    gridContextMenu: Record<string, ContextMenuItem>
    keyColumn: number
    translator: TranslatorEngine[]
    evalTranslationProgress(): void
    getTextFromLastSelected(): string
    textEditorSetValue(s: string): void
    translateByReference(arr: string[]): any
};

declare var common: {
    fetch: (...args: any) => any
    gridSelectedCells(): Cell[]
}

declare var $: CallableFunction

declare var ui: { 
    log(text: any): void
};