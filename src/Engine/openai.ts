import { IPromptModule } from './Prompt';
import { ICustomEngineModule } from './custom';
const { OpenAI } = require('www/addons/openai/lib/openai.js') as typeof import('openai');
const { exec } = require('child_process') as typeof import('child_process');
const { CustomEngine, TranslationFailException } = require("www/addons/openai/Engine/custom.js") as ICustomEngineModule;
const { systemPrompt, userPrompt, parseResponse } = require("www/addons/openai/Engine/Prompt.js") as IPromptModule;



class EngineClient extends CustomEngine { 
    private readonly default_base_url = "http://localhost:1337/v1"
    private g4f_server_status = false
    get model_name(): string { return this.getEngine()?.getOptions('model_name') ?? "gpt-4o" }
    get api_key(): string { return this.getEngine()?.getOptions('api_key') ?? "Placeholder" }
    get base_url(): string { return this.getEngine()?.getOptions('base_url') ?? this.default_base_url }

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
                    base_url: { 
                        type: "string",
                        title: "Base URL",
                        description: "insert the base URL.",
                        required: true,
                        default: "http://localhost:1337/v1"
                    },
                    target_language: { 
                        type: "string",
                        title: "Target language",
                        description: "Choose the target language.",
                        default: "English - US",
                        required: false
                    },
                    api_key: { 
                        type: "string",
                        title: "API Key",
                        description: "If you're using the official openai API, insert your API key.",
                        required: false
                    },
                    model_name: { 
                        type: "string",
                        title: "Model name",
                        description: "Choose the model.",
                        default: "gpt-4o",
                        required: false,
                        enum: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-002", "gemini-1.5-pro-002", "gemini-2.0-flash-exp"]
                    }
                },

                form: [ 
                    { 
                        key: "base_url",
                        /* onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.api_key = evt.target.value }
                        } */
                    }, { 
                        key: "model_name"
                    }, {
                        key: "api_key"
                    }, { 
                        key: "target_language"
                    }, 
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => { this.update(key, value) }
            }

        })
    }

    public async fetcher(texts: string[]) { 
        this.setup()
        const client = new OpenAI({ 
            baseURL: this.base_url,
            apiKey: this.api_key
        })
        
        const response = await client.chat.completions.create({ 
            model: this.model_name,
            messages: [ 
                { 
                    role: "system",
                    content: systemPrompt(this.target_language)
                }, { 
                    role: "user",
                    content: userPrompt(texts)
                }
            ]
        }).catch(e => { 
            throw new TranslationFailException({
                message: "Error while fetching.",
                status: 500
            })
        })

        const result = await parseResponse(response.choices[0].message.content ?? "")
        if (result.length !== texts.length) { 
            const message = result.length === 0? 
				"Failed to parse: " + response 
				: `Unexpected error: length ${result.length} out of ${texts.length}.` + '\n\n' + response;
            throw new TranslationFailException({
                message,
                status: 200
            }) 
        }

        return result
    }

    setup() { 
        if (this.base_url === this.default_base_url && !this.g4f_server_status) { 
            this.g4f_server_status = true
            exec('www/addons/openai/lib/g4f-inference.exe') 
        }
    }

}


const EngineModule = { EngineClient }
export type IEngineModule = typeof EngineModule
module.exports = EngineModule

