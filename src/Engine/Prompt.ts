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
    texts.forEach( (text, i) => requestObj[i] = text )

return `
    Now translate this: 
	    ${JSON.stringify(requestObj)}
`}

async function parseResponse(response: string) { 
    const output: string[] = [];
    const jsonString = response?.replace(/.*?\s({.*}).*/s, '$1');
    const repairedString = await parseJsonString(jsonString).catch( () => jsonString );
    try { 
        const parsed = JSON.parse(repairedString);
        (Object.entries(parsed) as ([string, string])[])
        .forEach(entry => { 
            const [ key, value ] = entry
            output[Number(key)] = value.replaceAll("\n", '').trim().replace(/(.*),$/, '$1').replace(/.*\「(.*?)\」.*/, "$1")
        });
        return output;

    } catch (e) { return [] as string[] }
}

async function parseJsonString(text: string) { 
    return jsonrepair(text)
}


const PromptModule = { systemPrompt, userPrompt, parseResponse }
export type IPromptModule = typeof PromptModule

module.exports = PromptModule