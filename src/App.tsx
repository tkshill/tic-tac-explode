import './styles.css'

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
