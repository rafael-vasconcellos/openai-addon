import { IPromptModule } from './Prompt';
import { ICustomEngineModule } from './custom';
import { RowsModule } from '../submenus/rows'
import { ClientOptions } from 'openai'
const path = require('path') as typeof import('path');
const { spawn, exec } = require('child_process') as typeof import('child_process');
const { OpenAI } = require('openai') as typeof import('openai');
const { zodResponseFormat } = require('openai/helpers/zod') as typeof import('openai/helpers/zod');
const { z } = require('zod') as typeof import('zod');
const { CustomEngine, TranslationFailException } = require("./custom") as ICustomEngineModule;
const { systemPrompt, userPrompt, parseResponse } = require("./Prompt") as IPromptModule;
const { createSubmenu } = require("../submenus/rows") as RowsModule



const scriptDirPath = path.resolve('www/addons/openai/lib')
const scriptPath = path.join(scriptDirPath, 'g4f_inference.pyz')

function getResponseSchema(batchSize: number = 25) {
    const responseSchema: Record<string, any> = {}
    for (let i=0; i<batchSize; i++) { 
        responseSchema[`${i}`] = z.string().optional()//.nonempty()
    }
    return responseSchema
}

const g4f_models = [
    "gpt-4o", "gpt-4o-mini", "o1", "o1-mini", 
    "deepseek-chat", "deepseek-v3", "deepseek-R1", "command-r-plus", "qwen-2.5-72b", 
    "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-thinking", 
    "claude-3.5-sonnet", "claude-3-opus", 
]

function getPythonPath() { return new Promise<string>(resolve => { 
    exec("where python", (error, stdout, stderr) => {
        if (error || stderr) { 
            const pythonPath = path.resolve('www/addons/openai/lib/python/python.exe')
            resolve(pythonPath)
        }
        else if (stdout) { resolve("python") } //stdout.trim()
    });
})}

class OpenAIClient extends OpenAI { 
    constructor(options: ClientOptions) { 
        super({ 
            ...options,
            dangerouslyAllowBrowser: true
        })
    }

    public static build(options: ClientOptions): OpenAIClient { 
        return new OpenAIClient(options)
    }

    async generate(texts: string[], model: string, target_language: string = "English - US"): Promise<string[]> { 
        const response = await this.chat.completions.create({ 
            model,
            messages: [ 
                { 
                    role: "system",
                    content: systemPrompt(target_language)
                }, { 
                    role: "user",
                    content: userPrompt(texts)
                }
            ],
            temperature: 0,
            response_format: zodResponseFormat(z.object(getResponseSchema(texts.length)), 'json_schema'),
            //provider: "OpenaiChat Copilot GithubCopilot"
        }, { 
            //query: {  }
        }).catch(e => { 
            throw new TranslationFailException({
                message: `Error while fetching: ${e}`,
                status: 500
            })
        })

        const response_text = response?.choices?.[0]?.message?.content ?? ""
        let result = await parseResponse(response_text, texts.length)
        if (result.length !== texts.length || !(result instanceof Array)) { 
            const message = result.length === 0? 
				"Failed to parse JSON."
				: `Unexpected error: length ${result.length} out of ${texts.length}.` + '\n\n' + response_text;
            throw new TranslationFailException({
                message,
                status: 200
            }) 

        } //else if (result.length > texts.length) { result = result.slice(0, texts.length) }

        return result
    }
}


class EngineClient extends CustomEngine { 
    private readonly default_base_url = "http://localhost:1337/v1"
    private readonly api_placeholder = "Placeholder"
    public g4f_server_status = false
    private interval?: NodeJS.Timeout | null
    public readonly package_name: string
    public readonly package_title: string
    get model_name(): string { return this.getEngine()?.getOptions('model_name') || "gpt-4.1" }
    get api_key(): string { return this.getEngine()?.getOptions('api_key') || this.api_placeholder }
    get base_url(): string { return this.getEngine()?.getOptions('base_url') || this.default_base_url }
    get rows_translation_models(): string { return this.getEngine()?.getOptions('rows_translation_models') || 'command-r-plus,gemini-2.0-flash,deepseek-v3,gpt-4o' }

    constructor(thisAddon: Addon) { 
        trans.config.maxRequestLength = 200
        super({ 
            id: thisAddon.package.name,
            name: thisAddon.package.title,
            description: thisAddon.package.description,
            version: thisAddon.package.version,
            author: typeof thisAddon.package.author === 'object'? 
                thisAddon.package.author.name : thisAddon.package.author ?? '',
            // maxRequestLength: batchSize,
            batchDelay: 1, // 0 is a falsy value, i'd be reverted to the default value (5000)
            optionsForm: { 
                schema: { 
                    base_url: { 
                        type: "string",
                        title: "Base URL",
                        description: "insert the base URL.",
                        required: true,
                        default: "http://localhost:1337/v1"
                    },
                    api_key: { 
                        type: "string",
                        title: "API Key",
                        description: "If you're using a provider that requires a key, insert it here.",
                        required: false
                    },
                    maxRequestLength: { 
                        type: "number",
                        title: "Batch size",
                        description: "Number of lines to be translated per request.",
                        required: false,
                        default: 25
                    },
                    model_name: { 
                        type: "string",
                        title: "Model name",
                        description: "Choose the model.",
                        default: "gpt-4o",
                        required: false,
                    },
                    target_language: { 
                        type: "string",
                        title: "Target language",
                        description: "Choose the target language.",
                        default: "English - US",
                        required: false
                    },
                    rows_translation_models: { 
                        type: "string",
                        title: "Models for rows translation",
                        description: "Type the name of the models to use for translating entire selected rows. format: model1,model2,etc. (order matters)",
                        required: false,
                        default: 'command-r-plus,gemini-2.0-flash,deepseek-v3,gpt-4o'
                    },
                },

                form: [ 
                    {
                        key: "base_url",
                    }, {
                        key: "api_key"
                    }, {
                        key: "model_name"
                    }, {
                        key: "maxRequestLength"
                    }, {
                        key: "target_language"
                    }, {
                        key: "rows_translation_models"
                    }, 
                ],
                onChange: (elm: HTMLInputElement, key: string, value: unknown) => { 
                    if (key === "base_url" && value === this.default_base_url && !this.g4f_server_status) { 
                        this.setup()
                    }
                    if (key === "rows_translation_models") { this.setRowsTranslationContextMenu() }
                    this.update(key, value && typeof value !== "object"? value : "")
                }
            }

        })
        //this.setup()
        this.package_name = thisAddon.package.name
        this.package_title = thisAddon.package.title
        this.setRowsTranslationContextMenu()
    }

    public async fetcher(texts: string[], model: string = this.model_name) { 
        await this.setup().catch(e => { 
            throw new Error(`exec error: ${e.stack}`)
        })
        const client = new OpenAIClient({ 
            baseURL: this.base_url,
            apiKey: this.api_key!==this.api_placeholder? this.api_key : undefined,
        })

        return await client.generate(texts, model, this.target_language)
    }

    private setup() { return new Promise<void>((resolve, reject) => { 
        const spawnChild = async() => { 
            const child = spawn(await getPythonPath(), [scriptPath])
            child.on('close', () => { this.g4f_server_status = false })
        }

        if (this.base_url === this.default_base_url && !this.g4f_server_status) { 
            ui.log('Starting G4F server...')
            if (!this.interval) { spawnChild() }
            else { clearInterval(this.interval) }
            this.interval = setInterval(() => { 
                fetch(this.base_url).then(response => { 
                    if (response.ok) { 
                        ui.log("G4F server started!")
                        clearInterval(this.interval!)
                        this.interval = null
                        this.g4f_server_status = true
                        resolve()
                    }
                })
            }, 1000)

        } else { resolve() }

    })}

    setRowsTranslationContextMenu() { 
        if (!this.package_name || !this.package_title || !this.rows_translation_models) { return }
        trans.gridContextMenu[this.package_name] = createSubmenu({ 
            clientBuild: OpenAIClient.build, 
            rowModels: this.rows_translation_models.split(','),
            package_name: this.package_name,
            package_title: this.package_title,
            //models: EngineClient.models
        })
    }

}


const EngineModule = { EngineClient, OpenAIClient }
export type IEngineModule = typeof EngineModule
module.exports = EngineModule

