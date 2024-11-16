class CustomEngine { 
    public api_key?: string
    public target_language: string = "English - US"
    public api_type: "free" | "pro" = "free"
    private engine: TranslatorEngine

    constructor(options: TranslationEngineOptions) { 
        this.engine = new TranslatorEngine(options)
        this.engine.translate = this.translate
    }

    public getEngine() { return this.engine }
    public init() { this.engine.init() }

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

    public translate(text: string[], options: any): void { //console.log(options)
        if (!this.api_key) { return alert('No API key specified!') }

        const formated_texts = this.prepare(text)
        console.log("Batch size: " + formated_texts.length + "\n\n")
        formated_texts.forEach(requests => { 
            console.log("request size: " + requests.length)
            if (requests[0] as any instanceof Array) { console.log("text size: " + requests[0]?.length) }
        })
    }

}


const CustomEngineModule = { CustomEngine }
export type ICustomEngineModule = typeof CustomEngineModule

module.exports = CustomEngineModule