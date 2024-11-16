import { IGeminiModule } from "./Engine/gemini"
try {
const { GeminiEngine } = require("www/addons/gemini/Engine/gemini.js") as IGeminiModule;


const thisAddon = <Addon> (this as unknown)
const gemini = new GeminiEngine(thisAddon)
trans["gemini-addon"] = gemini.getEngine()
//thisAddon.optionsForm = engine.optionsForm

$(document).ready(function() {
	gemini.init();
});

} catch (e) { alert(e) }