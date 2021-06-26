import { Position, Grid, createGrid, updateGrid } from './gamedata'
import { createMachine, assign, interpret } from 'xstate'

type AppContext = Initial | ActiveGame | GameEnd
type Initial = { size: number }
type ActiveGame = { grid: Grid }
type GameEnd = { result: 'Win'; grid: Grid } | { result: 'Loss'; grid: Grid }

type AppEvent =
    | { type: 'CHOOSESIZE'; size: number }
    | { type: 'STARTGAME' }
    | { type: 'POPULATEBOARD'; position: Position }
    | { type: 'CLICKCELL'; position: Position }

type AppState =
    | { value: 'init' | 'preGame'; context: Initial }
    | { value: 'activeGame'; context: ActiveGame }
    | { value: 'gameEnd'; context: GameEnd }

export const appMachine = createMachine<AppContext, AppEvent, AppState>({
    initial: 'init',
    context: { size: 3 },
    strict: true,
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
        gameEnd: {}
    }
})
