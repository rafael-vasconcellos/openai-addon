interface Range { 
    from: Cell
    to: Cell
    highlight: Cell
}[]

interface Cell { 
    row: number
    col: number
}

declare class Grid { 
    getSelectedRange(): Range
    getData(): string[][]
    render(): void
}

declare var t = (s: string) => string