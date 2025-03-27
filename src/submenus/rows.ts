interface TranslateSelectionOptions { 
	clientBuild: ClientBuilder
	rowModels: string[]
	package_name: string
}

type ClientBuilder = (options: Record<string, any>) => IClient

interface IClient { 
	generate(texts: string[], model: string, target_language?: string): Promise<string[]>
}

interface TranslationResult { 
	index: number
	inputText: string
	output: string[]
}

interface CreateSubmenuInit extends TranslateSelectionOptions { 
	models: string[]
	package_title: string
}



class Client implements IClient { 
	constructor(public package_name: string) {}
	generate(texts: string[], model: string, _?: string): Promise<string[]> {
		return trans[this.package_name]?.fetcher(texts, model)
	}
}

class TranslateSelection { 
	private client: IClient
	private rowModels: string[]
	constructor(options: TranslateSelectionOptions) { 
		this.client = new Client(options.package_name)
		this.rowModels = options.rowModels
	}

	async translate() { 
		return this.translateSelectedRows()
		.catch(e => alert(e?.stack))
	}

	async translateSelectedRows() { 
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
		trans.grid.render();
		const stream = this.translateRowsBatch([ ...tempTextPool ])
		for await (const response of stream) { 
			this.applyTranslationToTable(response)
		}
		//trans.textEditorSetValue(trans.getTextFromLastSelected());
	}

	async* translateRowsBatch(texts: string[]) { 
		const promises = this.rowModels.map(model => { 
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

	async translateRows(entries: [string, Cell][], model: string) { 
		const promises = entries.map(entry => this.translateRow(entry, model))
		return Promise.all(promises).then(() => true)
	}

	async translateRow([text, cell]: [string, Cell], model: string) { 
		if (!cell || !model || !text) { return }
		const response = await this.client.generate([text], model)
		.then(result => result[0])
		.catch(e => { //alert(e.stack)
			return ""
		})

		const index = trans.data.findIndex(row => row[0] === text)
		trans.data[index][cell.col] = response
	}

	applyTranslationToTable(result: TranslationResult) { 
		const { index, output, inputText } = result;
		trans.data[index] = [inputText, ...output];
		trans.grid.render();
		trans.evalTranslationProgress();
	}

	async translateSelectedCells(model: string) { 
		const thisData = trans.grid.getData();
		const rowPool = common.gridSelectedCells() || [];
		const tempTextPool: Record<string, Cell> = {};
		for (const cell of rowPool) { 
			if (cell.col === trans.keyColumn) { continue }
			const text = thisData[cell.row][trans.keyColumn];
			if (text && !(text in tempTextPool)) { 
				tempTextPool[text] = cell
				trans.data[cell.row][cell.col] = "Fetching..."
			}
		}

		if (!Object.keys(tempTextPool).length) return;
		trans.grid.render();
		await this.translateRows(Object.entries(tempTextPool), model)
		trans.grid.render();
		trans.evalTranslationProgress();
		//trans.textEditorSetValue(trans.getTextFromLastSelected());
	}

}


function createSubmenu({ package_name, rowModels, clientBuild, package_title, models }: CreateSubmenuInit): ContextMenuItem { 
	const translateSelection = new TranslateSelection({ 
		package_name,
		rowModels,
		clientBuild,
	})

	return { 
		name: package_title,
		submenu: { 
			items: [ 
				{ 
					key: package_name + ':rows-translation',
					name: "Translate entire selected rows",
					callback: translateSelection.translateSelectedRows.bind(translateSelection)
				}, 
				...models.map(model => ({ 
					key: package_name + ":" + model,
					name: "Translate selected with " + model,
					callback: () => translateSelection.translateSelectedCells.call(translateSelection, model)
				}))
			]
		}
	}
}




const rowsModule = { TranslateSelection, createSubmenu }
export type RowsModule = typeof rowsModule
module.exports = rowsModule


