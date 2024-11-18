class CustomEngine { 
    private engine: TranslatorEngine

    constructor(engineOptions: TranslationEngineOptions) { 
        this.engine = new TranslatorEngine(engineOptions)
        this.engine.translate = this.translate.bind(this)
        this.engine.abortTranslation = this.abort
        this.engine.abort = this.abort
        this.engine.pause = this.pause
        this.engine.resume = this.resume
    }

    get api_key() { return this.getEngine()?.getOptions('api_key') ?? null }
    get target_language() { return this.getEngine()?.getOptions('target_language') ?? "English - US" }
    get api_type() { return this.getEngine()?.getOptions('api_type') ?? "free" }

    public update(option: string, value: any) { 
        this.getEngine().update(option, value)
    }
    public getEngine() { return this.engine }
    public init() { this.engine.init() }
    public abort() {}
    public pause() {}
    public resume() {}

    public async fetcher(texts: string[]): Promise<string[] | void> { 
        throw new Error('Non implemented method!')
    }

    public translate(texts: string[], options: TranslatorOptions): void { 
        if (!this.api_key) { return alert('No API key specified!') }
        this.mockTranslate(texts)
        .then(result => options.onAfterLoading(result))
        .catch(reason => options.onError(reason))
        .finally(options.always())
    }

    private mockTranslate(texts: string[]) { return new Promise(resolve => {
        alert(texts.length)
        // @ts-ignore
        if (!this.started) { 
            // @ts-ignore
            this.started = true
            const mock_translation = Array(texts.length).fill('b')
            resolve({
                sourceText: texts.join(),
                translationText: mock_translation.join(),
                source: texts,
                translation: mock_translation
            })
        }
    })}

    protected async execute(texts: string[]) { 
        const translated_texts = await this.fetcher(texts)
        const result = translated_texts? {
			sourceText: texts.join(),
			translationText: translated_texts.join(),
			source: texts,
			translation: translated_texts
		} : null

        if (result) { return result }
    }

    protected formatInput(texts: string[], n: number): (string | string[])[] { 
        const result = []
        for (let i=0; i<texts.length; i+=n) { 
            const batch = texts.slice(i, i+n)
            result.push(batch)
        }

        return result.length>1? result : result[0]
    }

}


const CustomEngineModule = { CustomEngine }
export type ICustomEngineModule = typeof CustomEngineModule

module.exports = CustomEngineModule