declare class TranslatorEngine {
    constructor(options: TranslationEngineOptions);
    update(id: string, value: any);
    optionsForm: TranslationEngineOptionForm;
    init(): void;
    on(
        eventType: string, 
        listener: (evt: Event, obj: {key: string, value: any}) => void
    ): void;
    escapeCharacter(sentence: string);
    escapeLineBreak(text: string);
    id: string;
    fixTranslationFormatting(text: string);
    getOptions(...args: any[]): any;
    loadOptions(): void;
    mergeOptionsForm(optionsForm: TranslationEngineOptionForm): void;
    // TODO: Find what options: any is
    preProcessText(text: string, options: any);
    replacer(match, p1, p2, p3, offset, string): string;
    replacerS(match, p1, p2, p3, offset, string): string;
    maxRequestLength: number;
    batchDelay: number;

    /**
     * Returns the string to it's original state line-break-wise
     * @param text - the string with linebreaks replaced by something else
     */
    restoreLineBreak(text: string): string;
    restorer(...args: Array<string>): string;
    restorerS(...args: Array<string>): string;

    /**
     * Saves configuration status
     */
    save(): void;
    str2Num(num): string;
    translate(text: Array<string>, options: TranslatorOptions): void;
    unescapeCharacter(sentence): string;

    abort(): void;
    abortTranslation(): void;
    pause(): void;
    resume(): void;

    targetUrl: string;
    targetUrls: Array<string>;

    // Variables
    //[id: string]: any;
}

declare type TranslatorOptions = {
    onAfterLoading: (result: any) => any | Promise<any>;
    onError: (reason: any) => any | Promise<any>;
    always: () => any | Promise<any>;
    progress: (perc: number) => void;
    sl: string;
    tl: string;
}

declare type TranslatorEngineResults = {
    sourceText: string;
    translationText: string;
    source: Array<string>;
    translation: Array<string | undefined>;
}

