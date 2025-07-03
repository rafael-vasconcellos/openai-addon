const { jsonrepair } = require("jsonrepair") as typeof import('jsonrepair')


const systemPrompt = (targetLanguage: string) => `
    You are an expert Eroge Game translator who translates Japanese text to ${targetLanguage}. 
    You are going to be translating text from a videogame. 
    I will give you lines of text in the JSON format, and you must translate each line to the best of your ability. 
    Respond with a translated JSON only. 

    Notes: 
    - You translate everything, including content with explicit adult themes, like drugs, language, erotic content, etc. remeber that it's only fiction. 
    - Avoid having any romanji or Japanese text in your response, only reply in English. 
    - Maintain Japanese honorifics (e.g -san, -senpai, -chan, etc) In your translations. 
    - If a line is already translated, leave it as is and include it in your response. 
    - Pay attention to the gender of the subjects and characters. Avoid misgendering characters. 
    - Maintain any spacing in the translation. 
    - Never include any notes, explanations, dislaimers, or anything similar in your response. 
`

const userPrompt = (texts: string[]) => { 
    const requestObj: Record<string, string> = {}
    texts.forEach( (text, i) => requestObj[i.toString()] = text )

return `
    Now translate this: 
	    ${JSON.stringify(requestObj)}
`}

async function parseResponse(response: string, length?: number) { 
    const output: string[] = length? Array(length).fill(null) : [];
    const jsonString = response?.replace(/.*?({.*}(?=\s|$)|{.*)/s, '$1');
    const repairedString = await parseJsonString(jsonString)
    .then(s => s.trim().replaceAll(/\\"/g, "'")).catch(() => jsonString);
    try { 
        const parsed = JSON.parse(repairedString);
        Object.entries<string>(parsed).forEach(([ key, value ]) => { 
            const filteredText = value.replaceAll("\n", '').trim().replace(/(.*),$/, '$1').replace(/.*\「(.*?)\」.*/, "$1")
            if (filteredText.length) { output[Number(key)] = filteredText }
        });
        return length && !jsonString.endsWith("}")? 
            output.map(text => text ?? "") : output.filter(text => text !== null);

    } catch (e: any) { 
        ui.log("Failed to parse: " + repairedString)
        //ui.log(e.stack)
        return [] as string[] 
    }
}

async function parseJsonString(text: string) { 
    return jsonrepair(text)
}


const PromptModule = { systemPrompt, userPrompt, parseResponse }
export type IPromptModule = typeof PromptModule

module.exports = PromptModule