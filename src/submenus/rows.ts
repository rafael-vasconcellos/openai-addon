const translateSelection = async function(currentSelection?: Range, options = {}) { 
	currentSelection = currentSelection || trans.grid.getSelectedRange() || [{}];
	const currentEngine = trans["openai-addon"];

	if (typeof currentSelection == 'undefined') {
		alert(t("nothing is selected"));
		return false;
	}
	if (typeof trans.translator == "undefined" || trans.translator.length < 1) {
		alert(t("no translator loaded"));
		return false;
	}

	if (currentEngine.isDisabled == true) return alert(currentEngine.id+" is disabled!");


	const thisData = trans.grid.getData();
	const rowPool = common.gridSelectedCells() || [];
	const tempTextPool = new Set<string>();
	for (const cell of rowPool) {
		const text = thisData[cell.row][trans.keyColumn];
		if (text && !tempTextPool.has(text)) { 
			tempTextPool.add(text)
			trans.data[cell.row] = [text, ...Array(4).fill("Fetching...")]
		}
	}
	if (!tempTextPool.size) return;

	var preTransData;
	if (currentEngine.skipReferencePair) {
		preTransData = [...tempTextPool];
	} else {
		preTransData = trans.translateByReference([ ...tempTextPool ]);
	}


	console.log("Translate using : ",currentEngine.id);
	trans.grid.render();
	const stream = translateRows(preTransData)
	for await (const response of stream) { 
		const { index, output, inputText } = response;
		trans.data[index] = [inputText, ...output];
		trans.grid.render();
		trans.evalTranslationProgress();
	}
	//trans.textEditorSetValue(trans.getTextFromLastSelected());
}


const translateRows = async function*(texts: string[]) { 
    for (const text of texts) {
        const result = await translateRow(text)
		if (result) { yield result }
    }
}

const translateRow = async function(text: string) { 
	const models = ['gemini-2.0-flash', 'qwen-2.5-72b', 'deepseek-v3', 'gpt-4o']
	const promises = models.map(model => { 
		if (!model) { return Promise.resolve("") }
		return trans["openai-addon"]?.fetcher([text], model)
		.then(result => result[0])
		.catch(e => { //alert(e.stack)
			return ""
		})
	})

	const responses = await Promise.all(promises)
	if (responses.length) { 
		return { 
			inputText: text,
			output: responses,
			index: trans.data.findIndex(row => row[0] === text)
		}
	}
}


const rowsModule = { 
    translateSelection,
    translateRows,
    translateRow,
    menuItem: { 
        name: "Translate selected (OpenAI)",
        callback: () => translateSelection()
    }
}

export type TranslateSelection = typeof translateSelection
export type TranslateRows = typeof translateRows
export type TranslateRow = typeof translateRow
export type RowsModule = typeof rowsModule

module.exports = rowsModule