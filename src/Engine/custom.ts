interface IEngineOptions { 
    api_key: string | null
    target_language: string
    api_type: "free" | "pro"
}

class CustomEngine { 
    public options: IEngineOptions = { 
        api_key: this.getEngine()?.api_key ?? null,
        target_language: this.getEngine()?.target_language ?? "English - US",
        api_type: this.getEngine()?.api_type ?? "free"
    }
    private engine: TranslatorEngine & Partial<IEngineOptions>

    constructor(engineOptions: TranslationEngineOptions) { 
        this.engine = new TranslatorEngine(engineOptions)
        this.engine.translate = this.translate.bind(this)
        this.engine.abortTranslation = this.abort
        this.engine.abort = this.abort
        this.engine.pause = this.pause
        this.engine.resume = this.resume
    }

    public update(option: string, value: any) { 
        if (option in this.options) { 
            this.getEngine().update(option, value)
        }
    }
    public getEngine() { return this.engine }
    public init() { this.engine.init() }
    public abort() {}
    public pause() {}
    public resume() {}

    public async fetcher(texts: string[]) {}

    protected formatInput(texts: string[], n: number) { 
        const result = []
        for (let i=0; i<texts.length; i+=n) { 
            const batch = texts.slice(i, i+n)
            result.push(batch)
        }

        return result
    }

    protected prepare(texts: string[]) { return this.formatInput(texts, 25) }

    public translate(texts: string[], options: TranslatorOptions): void { 
        if (!this.options.api_key) { return alert('No API key specified!') }

        alert(texts.length)
        // @ts-ignore
        if (this.started) { return }
        // @ts-ignore
        this.started = true
        const mock_translation = Array(texts.length).fill('b')
        const mock_result = {
			sourceText: texts.join(),
			translationText: mock_translation.join(),
			source: texts,
			translation: mock_translation
		};

        options.onAfterLoading(mock_result)
        options.always()
    }

}


const CustomEngineModule = { CustomEngine }
export type ICustomEngineModule = typeof CustomEngineModule

module.exports = CustomEngineModule