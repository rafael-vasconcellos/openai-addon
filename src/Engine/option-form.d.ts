declare type TranslationEngineOptionForm = {
    schema: {[id: string]: TranslationEngineOptionFormSchema};
    form: Array<TranslationEngineOptionFormUpdater>;
}

declare type TranslationEngineOptionFormSchema<Type> = {
    type: typeof Type;
    title?: string;
    description?: string;
    default: Type;
    required?: boolean;
    enum?: any;
}

declare type TranslationEngineOptionFormUpdater = {
    key?: string;
    title?: string;
    fieldHtmlClass?: string;
    inlinetitle?: string;
    type?: string;
    titleMap?: {[id: string]: string};
    onChange?: (evt) => any;
    items?: {[id: string]: any};
}