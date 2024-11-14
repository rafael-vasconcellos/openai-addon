import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { systemPrompt, userPrompt } from "./Prompt";


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

export class GeminiEngine extends TranslatorEngine { 
    private api_key?: string
    private model_name: string = "gemini-1.5-flash"
    private target_language: string = "English - US"

    constructor() { 
        super({ 
            id: "gemini-addon",
            name: "Gemini",
            description: "Google's gemini support for Translator++.",
            version: "1.0.0",
            optionsForm: { 
                schema: { 
                    api_key: { 
                        type: "string",
                        title: "API Key",
                        description: "Insert your Google's gemini API key",
                        required: true
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
                        onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.api_key = evt.target.value }
                        }
                    }, { 
                        key: "model_name",
                        onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.model_name = evt.target.value }
                        },
                    }, { 
                        key: "target_language",
                        onChange: (evt: Event & { target: HTMLInputElement }) => { 
                            if (evt.target?.value) { this.target_language = evt.target.value }
                        },
                    }, 
                ]
            }

        })
    }


    private async fetch(texts: string[]) { 
        const GoogleClient = new GoogleGenerativeAI(this.api_key as string)
        const generativeModel = GoogleClient.getGenerativeModel({ 
            model: this.model_name,
            systemInstruction: systemPrompt(this.target_language)
        })
        const parts = [
            { text: userPrompt(texts) },
        ]

        return (await generativeModel.generateContent({ 
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0 },
            safetySettings,
        }))
        .response.text()
    }

    translate(text: string[], options: any): void { console.log(options)
        if (!this.api_key) { return alert('No API key specified!') }
    }

}

