import { ICustomEngineModule } from "./Engine/custom"

try {
	const { EngineClient } = require("www/addons/gemini/Engine/gemini.js") as ICustomEngineModule;
	const thisAddon = <Addon> (this as unknown)
	const client = new EngineClient(thisAddon)
	trans["gemini-addon"] = client.getEngine()
	thisAddon.optionsForm = client.getEngine().optionsForm

	$(document).ready(function() {
		client.init();
	});

} catch (e) { alert(e) }