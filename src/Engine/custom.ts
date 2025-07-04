type IRateLimit = { 
    requests: number
    seconds: number
}

type IProgress = { 
    step: number
    startTime: number
}

interface ITranslationFailExceptionDTO { 
    message: string
    status?: number | string
}



function replaceNativeFunction() { 
    const originalFunc = trans.translateAllByRows?.toString()
    if (originalFunc) { 
        let customFunc = originalFunc.replace("escapedSentence.length > currentMaxLength", "false")
        customFunc = customFunc.replace(
            "escapedSentence.length+currentRequestLength", 
            "thisTranslator.job.batch[currentBatchID].length+1"
        )

        return eval(`(${customFunc})`)
    }

    return null
}

class CustomEngine { 
    private engine: TranslatorEngine
    private progress: Partial<IProgress> = {}
    private clear() { this.progress = {} }

    constructor(engineOptions: TranslationEngineOptions) { 
        engineOptions.mode = "rowByRow"
        trans.translateAllByRows = replaceNativeFunction() ?? trans.translateAllByRows
        this.engine = new TranslatorEngine(engineOptions)
        this.engine.translate = this.translate.bind(this)
        this.engine.abort = this.clear.bind(this)
        this.engine.fetcher = this.fetcher.bind(this)
        //this.engine.translateAll = this.translateAll.bind(this)
    }

    get api_key(): string | null { return this.getEngine()?.getOptions('api_key') ?? null }
    get target_language(): string { return this.getEngine()?.getOptions('target_language') ?? "English - US" }
    get api_type(): "free" | "pro" { return this.getEngine()?.getOptions('api_type') ?? "free" }
    get timeout(): number { return this.getEngine()?.getOptions('timeout') ?? 0 }

    public update(option: string, value: any) { 
        this.getEngine().update(option, value)
    }
    public init() { this.engine.init() }
    public getEngine() { return this.engine }
    public abort() { 
        trans.abortTranslation()
        this.clear()
    }

    public async fetcher(texts: string[]): Promise<string[]> { 
        throw new Error('Non implemented method!')
    }

    public async translateAll(options: Partial<TranslatorOptions> = {}) { 
        const pace = 25
        const files = trans.getAllfiles()
        for (const file in files) { 
            const fileData = trans.project?.files?.[file]?.data
            for (let i=0; i<fileData.length; i+=pace) { 
                const batch = fileData.slice(i, i+pace).map(rows => rows[0])
                await this.translate(batch, { 
                    ...options,
                    onAfterLoading: async(result) => { 
                        this.applyTranslationToTable(result, fileData)
                        if (options.saveOnEachBatch) {
                            ui.log("Saving your project");
                            await trans.save();
                        }
                    },
                    onError: (e: ErrorEvt, _: any, message: string) => { 
                        ui.log("Status: " + e.status)
                        ui.log(message)
                    }
                })
            }
        }
    }

    public async translate(texts: string[], options: Partial<TranslatorOptions>) { 
        const start_time = performance.now() / 1000
        if (!this.api_key) { 
            alert('No API key specified!')
            return this.abort()
        }

        ui.log("\n\n" + "Batch size: " + texts.length);
        return await this.execute(texts)
            .then(result => { 
                const end_time = performance.now() / 1000
                ui.log(`Batch done in ${end_time - start_time}s.`)
                if (!options.onAfterLoading) { throw new TranslationFailException({ 
                    status: 200,
                    message: 'Fatal error: "onAfterLoading" method not received!'
                }) }
                options.onAfterLoading(result)
            })
            .catch( (obj: TranslationFailException) => { 
                if (!obj.status) { ui.log(obj.stack) }
                if (!options.onError) { return ui.log('Fatal error: "onError" method not received!') }
                options.onError(obj, undefined, obj.message)
            })
            .finally(() => options.always && options.always())
    }

    private mockTranslate(texts: string[]) { return new Promise(resolve => { 
        // @ts-ignore
        if (true) { 
            // @ts-ignore
            this.started = true
            //const mock_translation = Array(texts.length).fill('b')
            resolve({
                sourceText: texts.join(),
                translationText: texts.join(),
                source: texts,
                translation: texts
            })
        }
    })}

    protected async execute(texts: string[]): Promise<TranslatorEngineResults | void> { 
        return this.buildTranslationResult(texts)
    }

    protected async executeWithRateLimit(texts: string[], rateLimit: IRateLimit): Promise<TranslatorEngineResults> { 
        if (!this.progress.step) { 
            this.progress.step = 1
            this.progress.startTime = performance.now() 

        } else if ( (this.progress.step > rateLimit.requests) && this.progress.startTime ) { 
            const exec_time = performance.now() - this.progress.startTime
            const remaining_time = Math.max(0, (1000*rateLimit.seconds) - exec_time)
            this.progress = {}
            ui.log('Waiting ' + remaining_time/1000 + 's...')
            await new Promise(res => setTimeout(res, remaining_time)) 
        }

        const result = this.buildTranslationResult(texts)
        if (this.progress.step) { this.progress.step += 1 }
        return result
    }

    protected async buildTranslationResult(texts: string[]): Promise<TranslatorEngineResults> { 
        const promise = this.fetcher(texts).then(response => ({
			sourceText: texts.join(),
			translationText: response.join(),
			source: texts,
			translation: response
		}))
        if (!this.timeout) { return await promise }


        let timeoutId: NodeJS.Timeout
        const timeoutPromise = new Promise<any>((_, reject) => { 
            timeoutId = setTimeout(() => { 
                reject(new TranslationFailException({ 
                    status: 200,
                    message: "Request timed out!"
                }))
            }, this.timeout * 1000)
        })
        return Promise.race([
            promise.finally(() => clearTimeout(timeoutId)), // Limpa o timeout se a promise original resolver/rejeitar
            timeoutPromise
        ])
    }

    private applyTranslationToTable(result: TranslatorEngineResults, fileData: string[][]) { 
        for (let i=0; i<result.source.length; i++) { 
            const inputText = result?.source?.[i]
            const index = fileData.findIndex(row => row[0] === inputText)
            const output = Array(3).fill('')
            output[this.getEngine().targetColumn ?? 0] = result?.translation?.[i]
            fileData[index] = [inputText, ...output];
        }
        trans.grid.render();
        trans.evalTranslationProgress();
	}

    protected formatInput(texts: string[], n: number): (string | string[])[] { 
        const result = []
        for (let i=0; i<texts.length; i+=n) { 
            const batch = texts.slice(i, i+n)
            result.push(batch)
        }

        return result.length>1? result : result[0]
    }

}


declare class EngineClient extends CustomEngine { 
    constructor(thisAddon: Addon);
}


class TranslationFailException extends Error { 
    public status: ITranslationFailExceptionDTO['status']
    constructor(data: ITranslationFailExceptionDTO) { 
        super(data.message)
        this.status = data.status
    }
}


const CustomEngineModule = { CustomEngine, TranslationFailException }
export type ICustomEngineModule = typeof CustomEngineModule & { 
    EngineClient: typeof EngineClient
}
export type ICustomEngine = typeof CustomEngine

module.exports = CustomEngineModule

