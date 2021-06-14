import './styles.css'
import { shuffle } from './helpers'
import { createMachine, assign } from 'xstate'

type Position = { row: number; column: number }
type CellValue = 'Bomb' | number
type Cell =
    | { status: 'Covered'; value: CellValue }
    | { status: 'Uncovered'; value: CellValue }

type Grid = Cell[][]

type AppContext = Initial | ActiveGame | GameEnd
type Initial = { size: number }
type ActiveGame = { grid: Grid }
type GameEnd = { result: 'Win'; grid: Grid } | { result: 'Loss'; grid: Grid }

type AppEvent =
    | { type: 'CHOOSESIZE'; size: number }
    | { type: 'STARTGAME'; size: number }
    | { type: 'POPULATEBOARD'; position: Position }
    | { type: 'CLICKCELL'; position: Position }

type AppState =
    | { value: 'init' | 'preGame'; context: Initial }
    | { value: 'activeGame'; context: ActiveGame }
    | { value: 'gameEnd'; context: GameEnd }

const appMachine = createMachine<AppContext, AppEvent, AppState>({
    initial: 'init',
    context: { size: 3 },
    states: {
        init: {
            on: {
                CHOOSESIZE: {
                    actions: assign((_, event) => ({ size: event.size }))
                },
                STARTGAME: {
                    target: 'preGame'
                }
            }
        },
        preGame: {
            on: {
                POPULATEBOARD: {
                    target: 'activeGame',
                    actions: assign((context, event) =>
                        'size' in context
                            ? {
                                  grid: createGrid(
                                      context.size,
                                      event.position,
                                      context.size
                                  )
                              }
                            : context
                    )
                }
            }
        },
        activeGame: {},
        gameEnd: {}
    }
})
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
        { row: i, column: j + 1 }, // right
        { row: i - 1, column: j + 1 }, // bottom right
        { row: i + 1, column: j }, // top
        { row: i - 1, column: j }, // bottom
        { row: i + 1, column: j - 1 }, // top left
        { row: i, column: j - 1 }, // left
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

/*
Create the initial grid for a game of minesweeper
*/
function createGrid(
    size: number,
    initialCellClicked: Position,
    minesWanted: number
): Grid {
    // create of initial grid of zeros
    const newGrid: Grid = Array.from(Array(size), () =>
        Array.from(Array(size), () => ({ status: 'Covered', value: 0 }))
    )
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

const InitScreen = () => (
    <div>
        <select name="size" id="">
            <option value={3}>3 x 3</option>
            <option value={5}>5 x 5</option>
            <option value={10}>10 x 10</option>
        </select>
        <button>Start Game</button>
    </div>
)

export default function App() {
    //console.log(createGrid(5, { row: 2, column: 3 }, 5))
    return (
        <div className="App">
            <InitScreen />
        </div>
    )
}
