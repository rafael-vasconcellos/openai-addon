import { GeminiEngine } from "./Engine/gemini";


const engine = new GeminiEngine()
trans["gemini-addon"] = engine

$(document).ready(function() {
	engine.init();
});

