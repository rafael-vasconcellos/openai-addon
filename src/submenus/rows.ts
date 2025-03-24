interface TranslateSelectionOptions { 
	clientBuild: ClientBuilder
	models: string[]
	package_name: string
}

type ClientBuilder = (options: Record<string, any>) => IClient

interface IClient { 
	generate(texts: string[], model: string, target_language?: string): Promise<string[]>
}




class Client implements IClient { 
	constructor(public package_name: string) {}
	generate(texts: string[], model: string, _?: string): Promise<string[]> {
		return trans[this.package_name]?.fetcher(texts, model)
	}
}

class TranslateSelection { 
	private client: IClient
	private models: string[]
	constructor(options: TranslateSelectionOptions) { 
		this.client = new Client(options.package_name)
		this.models = options.models
	}

	async translate() { 
		return this.translateSelectedRows()
		.catch(e => alert(e?.stack))
	}

	async translateSelectedRows(currentSelection?: Range) { 
		currentSelection = currentSelection || trans.grid.getSelectedRange() || [{}] as unknown as Range;
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
		const stream = this.translateRows(preTransData)
		for await (const response of stream) { 
			const { index, output, inputText } = response;
			trans.data[index] = [inputText, ...output];
			trans.grid.render();
			trans.evalTranslationProgress();
		}
		//trans.textEditorSetValue(trans.getTextFromLastSelected());
	}

	async* translateRowsBatch(texts: string[]) { 
		const promises = this.models.map(model => { 
			if (!model) { return Promise.resolve([""]) }
			return this.client.generate(texts, model)
			.catch(e => { //alert(e.stack)
				return [""]
			})
		})

		const responses = await Promise.all(promises)
		for (let i=0; i<texts.length; i++) { 
			yield { 
				inputText: texts[i],
				output: responses.map(response => response[i]),
				index: trans.data.findIndex(row => row[0] === texts[i])
			}
		}
	}

	async* translateRows(texts: string[]) { 
		for (const text of texts) {
			const result = await this.translateRow(text)
			if (result) { yield result }
		}
	}

	async translateRow(text: string) { 
		const promises = this.models.map(model => { 
			if (!model) { return Promise.resolve("") }
			return this.client.generate([text], model)
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

}




const rowsModule = { TranslateSelection }
export type RowsModule = typeof rowsModule
module.exports = rowsModule


