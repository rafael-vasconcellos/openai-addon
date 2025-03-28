interface SelectionTranslatorOptions { 
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

interface CreateSubmenuInit extends SelectionTranslatorOptions { 
	package_title: string
	models?: string[]
}



class Client implements IClient { 
	constructor(public package_name: string) {}
	generate(texts: string[], model: string, _?: string): Promise<string[]> {
		return trans[this.package_name]?.fetcher(texts, model)
	}
}

class SelectionTranslator { 
	private client: IClient
	private rowModels: string[]
	constructor(options: SelectionTranslatorOptions) { 
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

	async translateRows(texts_map: Record<string, Cell>, model: string) { 
		const texts = Object.keys(texts_map)
		const response = await this.client.generate(texts, model)
		texts.forEach((text, i) => { 
			const index = trans.data.findIndex(row => row[0] === text)
			const cell = texts_map[text]
			if (index>=0 && cell) { 
				trans.data[index][cell.col] = response[i]
			}
		})
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
		await this.translateRows(tempTextPool, model)
		trans.grid.render();
		trans.evalTranslationProgress();
		//trans.textEditorSetValue(trans.getTextFromLastSelected());
	}

}


function createSubmenu({ package_name, rowModels, clientBuild, package_title, models }: CreateSubmenuInit): ContextMenuItem { 
	const translateSelection = new SelectionTranslator({ 
		package_name,
		rowModels,
		clientBuild,
	})
	const submenu: Partial<ContextMenuItem> = models?.length? { 
		submenu: { 
			items: [ 
				{ 
					key: package_name + ':rows-translation',
					name: "Translate entire selected rows",
					callback: translateSelection.translateSelectedRows.bind(translateSelection)
				}, 
				...models.map(model => ({ 
					key: package_name + ":" + model.replaceAll(":", "-"),
					name: "Translate selected with " + model,
					callback: () => translateSelection.translateSelectedCells.call(translateSelection, model)
				}))
			]
		}
	} : { 
		name: "Translate entire selected rows",
		callback: translateSelection.translateSelectedRows.bind(translateSelection)
	}


	return { 
		name: package_title,
		...submenu
	}
}




const rowsModule = { SelectionTranslator, createSubmenu }
export type RowsModule = typeof rowsModule
module.exports = rowsModule


