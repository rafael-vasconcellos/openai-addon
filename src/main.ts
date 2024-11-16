import { IGeminiModule } from "./Engine/gemini"
try {
const { GeminiEngine } = require("www/addons/gemini/Engine/gemini.js") as IGeminiModule;


const thisAddon = <Addon> (this as unknown)
const engine = new GeminiEngine(thisAddon)
trans["gemini-addon"] = engine
//thisAddon.optionsForm = engine.optionsForm

$(document).ready(function() {
	ui.onReady(function() {
		engine.init();
		alert('dada')
	});
	alert('dada')
});

} catch (e) { alert(e) }