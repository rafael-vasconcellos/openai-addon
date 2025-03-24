import { IEngineModule } from '../src/Engine/openai'
import { test, expect } from 'vitest'
const { OpenAIClient } = require('../dist/openai/Engine/openai') as IEngineModule


export const testTimeout = 0
const models = ['gemini-2.0-flash', 'qwen-2.5-72b', 'grok-2']

models.forEach(async model => { 
    test(`model ${model} availability`, async() => { 
        const client = new OpenAIClient({ 
            baseURL: "https://playmak3r-g4f.hf.space/v1",
            apiKey: "Placeholder"
        })

        const [ translated_text ] = await client.generate(["ダンガンロンパ 希望の学園と絶望の高校生"], model)

        expect(translated_text).toBeTruthy()
    }, 0)
})


