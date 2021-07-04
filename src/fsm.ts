import {
    Position,
    Grid,
    createGrid,
    updateGrid,
    isBomb,
    isWin
} from './gamedata'
import { createMachine, assign } from 'xstate'

type AppContext = PreGame | OpeningGame | ActiveGame | EndGame

type PreGame = GameSize
type OpeningGame = Timer & GameSize
type ActiveGame = Timer & GameBoard
type EndGame = GameBoard

type GameSize = { size: number }
type Timer = { duration: number }
type GameBoard = { grid: Grid }

const didTheyClickABomb = (context: any, event: any) =>
    'grid' in context && 'position' in event
        ? isBomb(event.position, context.grid)
        : false

const areAllNonBombsRevealed = (context: any, event: any) =>
    'grid' in context && 'position' in event ? isWin(context.grid) : false

type AppEvent =
    | { type: 'CHOOSESIZE'; size: number }
    | { type: 'STARTGAME' }
    | { type: 'POPULATEBOARD'; position: Position }
    | { type: 'CLICKCELL'; position: Position }
    | { type: 'TICK' }

type AppState =
    | { value: 'preGame'; context: PreGame }
    | { value: 'inGame.openingGame'; context: OpeningGame }
    | { value: 'inGame.activeGame'; context: ActiveGame }
    | { value: 'endGame.win'; context: EndGame }
    | { value: 'endGame.lose'; context: EndGame }

export const appMachine = createMachine<AppContext, AppEvent, AppState>(
    {
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
                        target: 'inGame.openingGame',
                        actions: assign((context, _) => ({
                            ...context,
                            duration: 0
                        }))
                    }
                }
            },
            inGame: {
                initial: 'openingGame',
                invoke: {
                    src: (_) => (callback) => {
                        const interval = setInterval(() => {
                            callback('TICK')
                        }, 3000)
                        return () => {
                            clearInterval(interval)
                        }
                    }
                },
                states: {
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
                    activeGame: {}
                },
                on: {
                    TICK: {
                        actions: assign((context, _) => {
                            if ('duration' in context) {
                                return {
                                    ...context,
                                    duration: context.duration + 1
                                }
                            } else {
                                return context
                            }
                        })
                    },
                    CLICKCELL: [
                        {
                            cond: didTheyClickABomb,
                            target: 'endGame.lose',
                            actions: ['updateGame']
                        },
                        {
                            cond: areAllNonBombsRevealed,
                            target: 'endGame.win',
                            actions: ['updateGame']
                        },
                        {
                            actions: ['updateGame']
                        }
                    ]
                }
            },
            endGame: {
                states: {
                    win: {},
                    lose: {}
                }
            }
        }
    },
    {
        actions: {
            updateGame: (context: any, event: any) =>
                'grid' in context && 'position' in event
                    ? {
                          grid: updateGrid(event.position, context.grid)
                      }
                    : context
        },

        guards: {
            didTheyClickABomb,
            areAllNonBombsRevealed
        }
    }
)
