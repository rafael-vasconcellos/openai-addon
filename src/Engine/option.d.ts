declare type TranslatorEngineOptions = {
    onAfterLoading: (result: any) => any | Promise<any>;
    onError: (reason: any) => any | Promise<any>;
    always: () => any | Promise<any>;
    progress: (perc: number) => void;
    sl: string;
    tl: string;
}

declare type TranslationEngineOptions = {
    id?: string;
    name?: string;
    author: string;
    version: string;
    description?: string;
    batchDelay?: number;
    skipReferencePair?: boolean;
    lineDelimiter?: string;
    mode?: string;
    targetUrl?: string;
    languages?: {[id: string]: string};
    optionsForm?: TranslationEngineOptionForm;
}

