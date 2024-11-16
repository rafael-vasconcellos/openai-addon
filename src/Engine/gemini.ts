import { PromptFeedback, GoogleGenerativeAIResponseError } from "@google/generative-ai"
import { ICustomEngineModule } from './custom'
import { IPromptModule } from './Prompt'
const { 
    GoogleGenerativeAI, 
    HarmCategory, 
    HarmBlockThreshold, 
} = require("www/addons/gemini/Engine/google-generative-ai.js") as typeof import('@google/generative-ai');
const { systemPrompt, userPrompt } = require("www/addons/gemini/Engine/Prompt.js") as IPromptModule;
const { CustomEngine } = require("www/addons/gemini/Engine/custom.js") as ICustomEngineModule;




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

class GeminiClient extends CustomEngine { 
    public model_name: string = "gemini-1.5-flash"

    constructor(thisAddon: Addon) { 
        super({ 
            id: thisAddon.package.name,
            name: thisAddon.package.title,
            description: thisAddon.package.description,
            version: thisAddon.package.version,
            author: thisAddon.package.author?.name ?? thisAddon.package.author as unknown,
            optionsForm: { 
                schema: { 
                    api_key: { 
                        type: "string",
                        title: "API Key",
                        description: "Insert your Google's gemini API key",
                        required: true
                    },
                    api_type: { 
                        type: "string",
                        title: "Api type",
                        description: "Select your api type",
                        default: "free",
                        required: false,
                        enum: ["free", "pro"]
                    },
                    target_language: { 
                        type: "string",
                        title: "Target language",
                        description: "Choose the target language",
                        default: "English - US",
                        required: false
                    },
                    model_name: { 
                        type: "string",
                        title: "Model name",
                        description: "Choose the gemini model",
                        default: "gemini-1.5-flash",
                        required: false
                    }
                },

                form: [ 
                    { 
                        key: "api_key",
                        /* onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.api_key = evt.target.value }
                        } */
                    }, { 
                        key: "model_name"
                    }, { 
                        key: "target_language"
                    }, { 
                        key: "api_type"
                    }
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => {
                    this.update(key, value);
                }
            }

        })
    }

    public async fetcher(texts: string[]) { 
        const GoogleClient = new GoogleGenerativeAI(this.options.api_key as string)
        const generativeModel = GoogleClient.getGenerativeModel({ 
            model: this.model_name,
            systemInstruction: systemPrompt(this.options.target_language)
        })
        const parts = [
            { text: userPrompt(texts) },
        ]

        const response = (await generativeModel.generateContent({ 
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0 },
            safetySettings,
        })
        .catch( (e: GoogleGenerativeAIResponseError<IGoogleFilterBlock>) => console.log(e.message))
        )?.response?.text()?.replace(/.*(\[.*?\]).*/, "$1")

        if (response) { 
            try { return JSON.parse(response) }
            catch (e) { console.log(e) }
        }
    }


}


const GeminiModule = { GeminiClient }
export type IGeminiModule = typeof GeminiModule
module.exports = GeminiModule