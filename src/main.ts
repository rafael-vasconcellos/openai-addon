import { ICustomEngineModule } from "./Engine/custom"

try {
	const { EngineClient } = require("www/addons/openai/Engine/openai.js") as ICustomEngineModule;
	const thisAddon = <Addon> (this as unknown)
	const client = new EngineClient(thisAddon)
	trans[thisAddon.package.name] = client.getEngine()
	thisAddon.optionsForm = client.getEngine().optionsForm

	$(document).ready(function() {
		client.init();
	});

} catch (e: any) { alert(e.stack) }