import { shuffle } from './helpers'

export type Position = { row: number; column: number }
export type CellValue = 'Bomb' | number
export type Cell =
    | { status: 'Covered'; value: CellValue }
    | { status: 'Uncovered'; value: CellValue }

export type Grid = Cell[][]

const getSurroundingIndexes = (position:Position, grid:Grid): Position[] =>
[
    { row: position.row + 1, column: position.column + 1 }, // top right
    { row: position.row + 0, column: position.column + 1 }, // right
    { row: position.row - 1, column: position.column + 1 }, // bottom right
    { row: position.row + 1, column: position.column + 0 }, // top
    { row: position.row - 1, column: position.column + 0 }, // bottom
    { row: position.row + 1, column: position.column - 1 }, // top left
    { row: position.row + 0, column: position.column - 1 }, // left
    { row: position.row - 1, column: position.column - 1 } // bottom left
].filter(
    (key) =>
        key.row >= 0 &&
        key.column >= 0 &&
        key.row < grid.length &&
        key.column < grid.length
)

/*
Given a row index, a column index and a grid of cells,
if the cell contains a bomb, leave it unchanged,
otherwise the cell contains a number representing the number of
bombs surrounding it.
*/
function mineOrNumber(i: number, j: number, grid: Grid): Cell {
    // if you dont filter the values that cant exist in the grid, the browser will yell at you.
    const surrondingIndexes: Position[] = [
        { row: i + 1, column: j + 1 }, // top right
        { row: i + 0, column: j + 1 }, // right
        { row: i - 1, column: j + 1 }, // bottom right
        { row: i + 1, column: j + 0 }, // top
        { row: i - 1, column: j + 0 }, // bottom
        { row: i + 1, column: j - 1 }, // top left
        { row: i + 0, column: j - 1 }, // left
        { row: i - 1, column: j - 1 } // bottom left
    ].filter(
        (key) =>
            key.row >= 0 &&
            key.column >= 0 &&
            key.row < grid.length &&
            key.column < grid.length
    )

    if (grid[i][j].value === 'Bomb') {
        return grid[i][j]
    } else {
        const surrondingBombs = surrondingIndexes
            .map((pos) => grid[pos.row][pos.column])
            .filter((cell) => cell.value === 'Bomb').length
        return { status: 'Covered', value: surrondingBombs }
    }
}

// create of initial grid of zeros
export const createOpeningGrid = (size: number): Grid =>
    Array.from(Array(size), () =>
        Array.from(Array(size), () => ({ status: 'Covered', value: 0 }))
    )
/*
Create the initial grid for a game of minesweeper
*/
export function createGrid(
    size: number,
    initialCellClicked: Position,
    minesWanted: number
): Grid {
    const newGrid = createOpeningGrid(size)

    // convert the inital click position to a single number
    const initPosIndex =
        initialCellClicked.row * size + initialCellClicked.column

    // create a pool of numbers the size of all the cells in the grid. filter out
    // the initial position clicked since you never want the first click to be a bomb.
    const pool = [...Array(size * size).keys()].filter(
        (n) => n !== initPosIndex
    )

    const mineNumbers = shuffle(pool).slice(0, minesWanted)

    // add the bombs to the grid
    mineNumbers.forEach((n) => {
        const row = Math.floor(n / size)
        const column = n % size
        newGrid[row][column] = { status: 'Covered', value: 'Bomb' }
    })

    // update the counts of the cells
    newGrid.forEach((row, i) => {
        row.forEach((_, j) => {
            newGrid[i][j] = mineOrNumber(i, j, newGrid)
        })
    })
    return newGrid
}

const getAdjacents = (position:Position, grid:Grid) => {

}

export const updateGrid = (position: Position, grid: Grid) => {
    grid[position.row][position.column].status = 'Uncovered'
    const adjacents = getAdjacents(position, grid)
}


    
