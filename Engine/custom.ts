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

    constructor(options: TranslationEngineOptions) { 
        super(options)
    }

    public async fetch(texts: string[]) {}

    translate(text: string[], options: any): void { //console.log(options)
        if (!this.api_key) { return alert('No API key specified!') }

        //
    }

}

