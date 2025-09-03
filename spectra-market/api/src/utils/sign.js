import { nanoid } from 'nanoid';

export function makeNonce() {
  return nanoid(24);
}