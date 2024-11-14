declare type TranslationEngineOptionFormUpdater = {
    key?: string;
    title?: string;
    fieldHtmlClass?: string;
    inlinetitle?: string;
    type?: string;
    titleMap?: {[id: string]: string};
    onChange?: function;
    items?: {[id: string]: any};
}

declare type TranslationEngineOptionForm = {
    schema: {[id: string]: TranslationEngineOptionSchema};
    form: Array<TranslationEngineOptionFormUpdater>;
}