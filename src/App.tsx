import { appMachine } from './fsm'
import React, { useContext } from 'react'
import { useMachine } from '@xstate/react'
import { Grid, Cell, createOpeningGrid } from './gamedata'
import {} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const FSMeventContext = React.createContext<any>(undefined)

const CellComp = (props: { cell: Cell; rownum: number; colnum: number }) => {
    const display = props.cell.status === 'Covered' ? '  ' : props.cell.value

    const send = useContext(FSMeventContext)
    const style = { width: 'fill', height: 'fill' }
    return (
        <td>
            <button
                style={style}
                key={props.colnum}
                onClick={(_) =>
                    send({
                        type: 'CLICKCELL',
                        position: {
                            row: props.rownum,
                            column: props.colnum
                        }
                    })
                }
            >
                {display}
            </button>
        </td>
    )
}

const RowComp = (props: { row: Cell[]; rownumber: number }) => (
    <tr>
        {[...props.row].map((cell, colnumber) => (
            <CellComp
                key={colnumber}
                cell={cell}
                rownum={props.rownumber}
                colnum={colnumber}
            />
        ))}
    </tr>
)

const GridComp = (props: { grid: Grid }) => {
    return (
        <table className="table">
            {[...props.grid].map((row, index) => (
                <RowComp key={index} row={row} rownumber={index} />
            ))}
        </table>
    )
}

export default function App() {
    const [current, send] = useMachine(appMachine)
    console.log(current.context)

    const Main = () => {
        if (current.matches('preGame')) {
            return (
                <div className="container">
                    <select
                        value={current.context.size}
                        onChange={(e) =>
                            send({
                                type: 'CHOOSESIZE',
                                size: parseInt(e.target.value, 10)
                            })
                        }
                    >
                        <option value={3}>3 x 3</option>
                        <option value={5}>5 x 5</option>
                        <option value={10}>10 x 10</option>
                    </select>
                    <button onClick={(_) => send({ type: 'STARTGAME' })}>
                        Start Game
                    </button>
                </div>
            )
        } else if (current.matches('inGame.openingGame')) {
            const grid: Grid = createOpeningGrid(current.context.size)
            return (
                <div>
                    <div>{current.context.duration}</div>
                    <GridComp grid={grid} />
                </div>
            )
        } else if (current.matches('inGame.activeGame')) {
            return (
                <div>
                    <div>{current.context.duration}</div>
                    <GridComp grid={current.context.grid} />
                </div>
            )
        } else if (current.matches('endGame.win')) {
            return (
                <div>
                    <div>You won!</div>
                    <GridComp grid={current.context.grid} />
                </div>
            )
        } else if (current.matches('endGame.lose')) {
            return (
                <div>
                    <div>You lost!</div>
                    <GridComp grid={current.context.grid} />
                </div>
            )
        } else {
            return <div></div>
        }
    }
    return (
        <div className="container">
            <FSMeventContext.Provider value={send}>
                <Main />
            </FSMeventContext.Provider>
        </div>
    )
}
