import { Position, Grid, createGrid, updateGrid } from './gamedata'
import { createMachine, assign, interpret } from 'xstate'

type AppContext = PreGame | OpeningGame | ActiveGame | EndGame

type PreGame = GameSize
type GameSize = { size: number }
type Timer = { duration: number }
type OpeningGame = Timer & GameSize
type GameBoard = { grid: Grid }
type ActiveGame = Timer & GameBoard
type GameResult = { result: 'Win' } | { result: 'Draw' }
type EndGame = GameResult & GameBoard

type AppEvent =
    | { type: 'CHOOSESIZE'; size: number }
    | { type: 'STARTGAME' }
    | { type: 'POPULATEBOARD'; position: Position }
    | { type: 'CLICKCELL'; position: Position }

type AppState =
    | { value: 'preGame'; context: PreGame }
    | { value: 'openingGame'; context: OpeningGame }
    | { value: 'activeGame'; context: ActiveGame }
    | { value: 'endGame'; context: EndGame }

export const appMachine = createMachine<AppContext, AppEvent, AppState>({
    initial: 'preGame',
    context: { size: 3 },
    strict: true,
    states: {
        preGame: {
            on: {
                CHOOSESIZE: {
                    actions: assign((_, event) => ({ size: event.size }))
                },
                STARTGAME: {
                    target: 'openingGame'
                }
            }
        },
        openingGame: {
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
        activeGame: {
            on: {
                CLICKCELL: {
                    actions: assign((context, event) =>
                        'grid' in context
                            ? { grid: updateGrid(event.position, context.grid) }
                            : context
                    )
                }
            }
        },
        endGame: {}
    }
})
