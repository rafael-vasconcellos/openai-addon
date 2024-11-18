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
    get model_name() { return this.getEngine()?.getOptions('model_name') ?? "gemini-1.5-flash" }

    constructor(thisAddon: Addon) { 
        super({ 
            id: thisAddon.package.name,
            name: thisAddon.package.title,
            description: thisAddon.package.description,
            version: thisAddon.package.version,
            author: thisAddon.package.author?.name ?? thisAddon.package.author as unknown,
            maxRequestLength: 375,
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
                        key: "api_type"
                    }, { 
                        key: "model_name"
                    }, { 
                        key: "target_language"
                    }, 
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => { 
                    if (key === "api_type") { 
                        //this.update("batchDelay", value==="free"? 60 : 1)
                        this.update("maxRequestLength", value==="free"? 375 : 25)
                    }
                    this.update(key, value);
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
        .catch( (e: GoogleGenerativeAIResponseError<IGoogleFilterBlock>) => console.log(e.message))
        )?.response?.text()?.replace(/.*(\[.*?\]).*/, "$1")

        if (response) { 
            try { return JSON.parse(response) }
            catch (e) { 
                console.log(e) 
                throw new Error("Fetch failed!")
            }
        }
    }

    protected async execute(texts: string[]) { 
        if (this.api_type === "free") { 
            const start_time = performance.now()
            const batches = this.formatInput(texts, 25) as any[]
            for (let i=0; i<batches.length; i++) { 
                if (batches[i] instanceof Array) { 
                    const translated_batch = await this.fetcher(batches[i])
                    batches.splice(i, 1, ...translated_batch)
                    await new Promise(res => setTimeout(res, 1000))
                }
            }

            const end_time = performance.now()
            const exec_time = end_time - start_time
            const remaining_time = Math.max(0, (1000*60) - exec_time);
            await new Promise(res => setTimeout(res, remaining_time))
            return {
                sourceText: texts.join(),
                translationText: batches.join(),
                source: texts,
                translation: batches
            }

        } else { return super.execute(texts) }
    }


}


const GeminiModule = { GeminiClient }
export type IGeminiModule = typeof GeminiModule
module.exports = GeminiModule