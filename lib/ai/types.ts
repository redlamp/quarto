import type { Piece } from '@/lib/game/pieces';
import type { QuartoState } from '@/lib/game/definition';

export type Stage = 'pick' | 'place';

export type BotMove =
  | { kind: 'pick'; piece: Piece }
  | { kind: 'place'; cell: number }
  | { kind: 'callQuarto' };

export interface BotInput {
  G: QuartoState;
  stage: Stage;
}

export interface Bot {
  name: string;
  label: string;
  decide: (input: BotInput) => BotMove;
}
