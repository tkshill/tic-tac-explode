import './styles.css'
import { appMachine } from './fsm'
import { useMachine } from '@xstate/react'

const InitScreen = () => {
    const [current, send] = useMachine(appMachine)
    console.log(current.context)

    const ButtonRow = (props: { size: number; rownumber: number }) => (
        <div>
            {[...Array(props.size)].map((_, colnumber) => (
                <button
                    onClick={(_) =>
                        send({
                            type: 'POPULATEBOARD',
                            position: {
                                row: props.rownumber,
                                column: colnumber
                            }
                        })
                    }
                >
                    {props.rownumber},{colnumber}
                </button>
            ))}
        </div>
    )

    const Grid = (props: { size: number }) => (
        <div>
            {[...Array(props.size)].map((_, index) => (
                <ButtonRow size={props.size} rownumber={index} />
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
        const size = current.context.size
        return <Grid size={size} />
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
