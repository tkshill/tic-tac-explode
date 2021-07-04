import './styles.css'
import { appMachine } from './fsm'
import React from 'react'
import { useMachine } from '@xstate/react'
import { Grid, Cell, createOpeningGrid } from './gamedata'

const EventContext = React.createContext<any>('')

const InitScreen = () => {
    const [current, send] = useMachine(appMachine)
    console.log(current.context)

    const CellComp = (props: {
        cell: Cell
        rownum: number
        colnum: number
    }) => {
        const eventName = React.useContext(EventContext)

        const display =
            props.cell.status === 'Covered' ? '  ' : props.cell.value
        return (
            <button
                key={props.colnum}
                onClick={(_) =>
                    send({
                        type: eventName,
                        position: {
                            row: props.rownum,
                            column: props.colnum
                        }
                    })
                }
            >
                {display}
            </button>
        )
    }

    const RowComp = (props: { row: Cell[]; rownumber: number }) => (
        <div>
            {[...props.row].map((cell, colnumber) => (
                <CellComp
                    key={colnumber}
                    cell={cell}
                    rownum={props.rownumber}
                    colnum={colnumber}
                />
            ))}
        </div>
    )

    const GridComp = (props: { grid: Grid }) => (
        <div>
            {[...props.grid].map((row, index) => (
                <RowComp key={index} row={row} rownumber={index} />
            ))}
        </div>
    )

    if (current.matches('preGame')) {
        return (
            <div>
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
            <EventContext.Provider value="POPULATEBOARD">
                <div>{current.context.duration}</div>
                <GridComp grid={grid} />
            </EventContext.Provider>
        )
    } else if (current.matches('inGame.activeGame')) {
        return (
            <EventContext.Provider value="CLICKCELL">
                <div>{current.context.duration}</div>
                <GridComp grid={current.context.grid} />
            </EventContext.Provider>
        )
    } else {
        return <div></div>
    }
}

export default function App() {
    return (
        <div className="App">
            <InitScreen />
        </div>
    )
}
