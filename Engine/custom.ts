import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GoogleGenerativeAIResponseError, PromptFeedback } from "@google/generative-ai";
import { systemPrompt, userPrompt } from "./Prompt";


interface IGoogleFilterBlock { 
    text: CallableFunction // throws the error
    functionCall: CallableFunction
    functionCalls: CallableFunction
    usageMetadata: Record<string, unknown>
    promptFeedback: PromptFeedback
}

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }, {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }, {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }, {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }
]

export class CustomEngine extends TranslatorEngine { 
    public api_key?: string
    public target_language: string = "English - US"
    public api_type: "free" | "pro" = "free"

    constructor(options: TranslationEngineOptions) { 
        super(options)
    }

    public async fetch(texts: string[]) {}

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

