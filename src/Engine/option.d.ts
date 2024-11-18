declare type TranslationEngineOptions = {
    id?: string;
    name?: string;
    author: string;
    version: string;
    description?: string;
    batchDelay?: number;
    maxRequestLength: number;
    skipReferencePair?: boolean;
    lineDelimiter?: string;
    mode?: string;
    targetUrl?: string;
    languages?: {[id: string]: string};
    optionsForm?: TranslationEngineOptionForm;
}

