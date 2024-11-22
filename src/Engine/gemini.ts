import { PromptFeedback, GoogleGenerativeAIResponseError as IGoogleGenerativeAIResponseError } from "@google/generative-ai"
import { ICustomEngineModule } from './custom'
import { IPromptModule } from './Prompt'
const { 
    GoogleGenerativeAI, 
    HarmCategory, 
    HarmBlockThreshold, 
} = require("www/addons/gemini/lib/generative-ai.js") as typeof import('@google/generative-ai');
const { CustomEngine, TranslationFailException } = require("www/addons/gemini/Engine/custom.js") as ICustomEngineModule;
const { systemPrompt, userPrompt, parseResponse } = require("www/addons/gemini/Engine/Prompt.js") as IPromptModule;




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

class EngineClient extends CustomEngine { 
    get model_name(): string { return this.getEngine()?.getOptions('model_name') ?? "gemini-1.5-flash" }

    constructor(thisAddon: Addon) { 
        trans.config.maxRequestLength = 25
        super({ 
            id: thisAddon.package.name,
            name: thisAddon.package.title,
            description: thisAddon.package.description,
            version: thisAddon.package.version,
            author: thisAddon.package.author?.name ?? thisAddon.package.author as unknown,
            maxRequestLength: trans.config.maxRequestLength,
            batchDelay: 1, // 0 is a falsy value, it'll be reverted to the default value (5000)
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
                        required: false,
                        enum: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-002", "gemini-1.5-pro-002"]
                    }
                },

                form: [ 
                    { 
                        key: "api_key",
                        /* onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.api_key = evt.target.value }
                        } */
                    }, { 
                        key: "api_type"
                    }, { 
                        key: "model_name"
                    }, { 
                        key: "target_language"
                    }, 
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => { 
                    this.update(key, value);
                    if (this.api_type==="free" && this.model_name.includes("pro")) { 
                        alert("Cannot use a pro model with a free key! Rate limit is too low (50 requests per day).")
                    }
                }
            }

        })
    }

    public async fetcher(texts: string[]) { 
        const GoogleClient = new GoogleGenerativeAI(this.api_key as string)
        const generativeModel = GoogleClient.getGenerativeModel({ 
            model: this.model_name,
            systemInstruction: systemPrompt(this.target_language)
        })
        const parts = [
            { text: userPrompt(texts) },
        ]

        const response = (await generativeModel.generateContent({ 
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0 },
            safetySettings,
        })
        .catch( (e: IGoogleGenerativeAIResponseError<IGoogleFilterBlock>) => { 
            throw new TranslationFailException({ 
                message: e.message,
                status: e.response?.promptFeedback.blockReason
            })
        }))?.response?.text()


        const result = parseResponse(response) 
        if (result.length!==texts.length) { 
            const message = result.length===0? "Failed to parse: " + response : 'Unexpected error!'
            throw new TranslationFailException({
                message,
                status: 200
            }) 
        }

        return result
    }

    protected async execute(texts: string[]) { 
        if (this.api_type==="free" && this.model_name.includes("pro")) { 
            alert("Cannot use a pro model with a free key! Rate limit is too low (50 requests per day).")
            return this.abort()
        }

        if (this.api_type === "free") { 
            return this.executeWithRateLimit(texts, { 
                requests: 15,
                seconds: 60
            }) 

        } else { return this.buildTranslationResult(texts) }
    }


}


const GeminiModule = { EngineClient }
export type IGeminiModule = typeof GeminiModule
module.exports = GeminiModule