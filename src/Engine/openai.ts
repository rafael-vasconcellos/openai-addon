import { IPromptModule } from './Prompt';
import { ICustomEngineModule } from './custom';
import { RowsModule } from '../submenus/rows'
const path = require('path') as typeof import('path');
const { spawn, exec } = require('child_process') as typeof import('child_process');
const { OpenAI } = require('www/addons/openai/lib/openai.js') as typeof import('openai');
const { zodResponseFormat } = require('www/addons/openai/lib/openai/helpers/zod.js') as typeof import('openai/helpers/zod');
const { z } = require('www/addons/openai/lib/zod.js') as typeof import('zod');
const { CustomEngine, TranslationFailException } = require("www/addons/openai/Engine/custom.js") as ICustomEngineModule;
const { systemPrompt, userPrompt, parseResponse } = require("www/addons/openai/Engine/Prompt.js") as IPromptModule;
const { menuItem } = require("www/addons/openai/submenus/rows.js") as RowsModule



const scriptDirPath = path.resolve('www/addons/openai/lib')
const scriptPath = path.join(scriptDirPath, 'g4f_inference.pyz')

const batchSize = 25
const responseSchema: Record<string, any> = {}
for (let i=0; i<batchSize; i++) { 
    responseSchema[`${i}`] = z.string().nonempty()
}

function getPythonPath() {
    let result = 'www/addons/openai/lib/python/python.exe'
    exec("where python", (erro, stdout, stderr) => {
        if (erro || stderr) { //console.log("Python não encontrado.");
            return;
        }
        
        result = "python" //stdout.trim()
    });
    return path.resolve(result)
}


class EngineClient extends CustomEngine { 
    private readonly default_base_url = "http://localhost:1337/v1"
    private g4f_server_status = false
    get model_name(): string { return this.getEngine()?.getOptions('model_name') ?? "gpt-4o" }
    get api_key(): string { return this.getEngine()?.getOptions('api_key') ?? "Placeholder" }
    get base_url(): string { return this.getEngine()?.getOptions('base_url') ?? this.default_base_url }
    private interval?: NodeJS.Timeout | null

    constructor(thisAddon: Addon) { 
        trans.gridContextMenu['rowsTranslation'] = menuItem
        trans.config.maxRequestLength = batchSize
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
                        enum: [
                            "gpt-4o", "gpt-4o-mini", "o1", "o1-preview", "o1-mini", 
                            "claude-3.5-sonnet", "claude-3-opus", 
                            "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-thinking", 
                            "meta-ai", "llama-3.1-70b", "llama-3.2-11b", "llama-3.2-90b", "llama-3.3-70b", 
                            "command-r-plus", "qwen-2.5-72b", "deepseek-chat", "deepseek-v3", "grok-2"
                        ]
                    }
                },

                form: [ 
                    { 
                        key: "base_url",
                    }, { 
                        key: "model_name"
                    }, {
                        key: "api_key"
                    }, { 
                        key: "target_language"
                    }, 
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => { 
                    if (key === "base_url" && value === this.default_base_url && !this.g4f_server_status) { 
                        this.setup()
                    }
                    this.update(key, value) 
                }
            }

        })
        this.setup()
    }

    public async fetcher(texts: string[], model: string = this.model_name) { 
        await this.setup().catch(e => { 
            throw new Error(`exec error: ${e.stack}`)
        })
        const client = new OpenAI({ 
            baseURL: this.base_url,
            apiKey: this.api_key,
            dangerouslyAllowBrowser: true
        })

        const response = await client.chat.completions.create({ 
            model,
            messages: [ 
                { 
                    role: "system",
                    content: systemPrompt(this.target_language)
                }, { 
                    role: "user",
                    content: userPrompt(texts)
                }
            ],
            temperature: 0,
            response_format: zodResponseFormat(z.object(responseSchema), 'json_schema'),
        }, { 
            //query: {  }
        }).catch(e => { 
            throw new TranslationFailException({
                message: "Error while fetching.",
                status: 500
            })
        })

        const response_text = response.choices[0].message.content ?? ""
        const result = await parseResponse(response_text)
        if (result.length !== texts.length || !(result instanceof Array)) { 
            const message = result.length === 0? 
				"Failed to parse: " + response_text 
				: `Unexpected error: length ${result.length} out of ${texts.length}.` + '\n\n' + response_text;
            throw new TranslationFailException({
                message,
                status: 200
            }) 
        }

        return result
    }

    private setup() { return new Promise<void>( (resolve, reject) => { 
        const spawnChild = () => { 
            const child = spawn(getPythonPath(), [scriptPath])
            child.on('close', () => { this.g4f_server_status = false })
        }

        if (this.base_url === this.default_base_url && !this.g4f_server_status) { 
            ui.log('Starting G4F server...')
            if (!this.interval) { spawnChild() }
            else { clearInterval(this.interval) }
            this.interval = setInterval(() => { 
                fetch(this.base_url).then(response => { 
                    if (response.ok) { 
                        clearInterval(this.interval!)
                        this.interval = null
                        this.g4f_server_status = true
                        resolve()
                    }
                })
            }, 1000)

        } else { resolve() }

    })}

}


const EngineModule = { EngineClient }
export type IEngineModule = typeof EngineModule
module.exports = EngineModule

