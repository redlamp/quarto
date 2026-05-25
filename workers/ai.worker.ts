// Random-move AI worker. Runs off the main thread per the architectural rule
// that AI compute lives client-side in a Web Worker. Heavier bot tiers
// (heuristic, minimax) will swap into this same message protocol.

import { decideRandom } from '@/lib/ai/random';
import type { BotInput, BotMove } from '@/lib/ai/types';

interface RequestMessage {
  id: number;
  input: BotInput;
}

interface ResponseMessage {
  id: number;
  move: BotMove;
}

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { id, input } = event.data;
  const move = decideRandom(input);
  const response: ResponseMessage = { id, move };
  self.postMessage(response);
};

export {};
