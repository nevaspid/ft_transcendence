export interface Vector {
  x: number;
  y: number;
}

export type GamePhase = 'naming' | 'starting' | 'playing' | 'between' | 'gameover';