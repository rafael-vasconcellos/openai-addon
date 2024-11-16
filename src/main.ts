import { IGeminiModule } from "./Engine/gemini"
try {
const { GeminiClient } = require("www/addons/gemini/Engine/gemini.js") as IGeminiModule;


const thisAddon = <Addon> (this as unknown)
const client = new GeminiClient(thisAddon)
trans["gemini-addon"] = client.getEngine()
//thisAddon.optionsForm = engine.optionsForm

$(document).ready(function() {
	client.init();
});

} catch (e) { alert(e) }