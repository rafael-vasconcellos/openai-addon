interface ContextMenuItem { 
    name: string,
	callback?: CallableFunction
	submenu?: { 
		items: (ContextMenuItem & { 
            key: string 
        })[]
	}
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
    getAllfiles(): { 
        [key: string]: any
    }
    prototype: { 
        translateAllByRows(translator: TranslatorEngine, options): void
    }
    project: { 
        files: { 
            [key: string]: { 
                data: string[][]
            }
        }
    }
    grid: Grid
    data: string[][]
    gridContextMenu: Record<string, ContextMenuItem>
    keyColumn: number
    translator: TranslatorEngine[]
    save(): void
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