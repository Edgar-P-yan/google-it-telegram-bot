import { encode as _encode } from 'he';

export function encode(text: any): string {
  return _encode(text + '', {
    useNamedReferences: false,
  });
}
