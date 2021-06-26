import './styles.css'
import { appMachine } from './fsm'
import { useMachine } from '@xstate/react'

const InitScreen = () => {
    const [current, send] = useMachine(appMachine)
    console.log(current.value)

    if (current.matches('init')) {
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
    } else if (current.matches('preGame')) {
        const grid = Array.from(
            Array(current.context.size),
            () => new Array(current.context.size)
        )
        return (
            <div>
                <ul>
                    {grid.map((subgrid, i) => (
                        <ul key={i}>
                            {subgrid.map((_, j) => (
                                <li key={j}>test</li>
                            ))}
                        </ul>
                    ))}
                </ul>
            </div>
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
