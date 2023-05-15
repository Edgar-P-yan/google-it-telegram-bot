import { encode as _encode } from 'he';

export function encode(text: unknown): string {
  return _encode(text + '', {
    useNamedReferences: false,
  });
}
