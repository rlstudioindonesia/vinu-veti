/** Audio type from the first bytes (Safari only plays a blob when its type is right). */
export function sniffAudioType(b: Uint8Array): string {
  const tag = String.fromCharCode(...b.slice(0, 4));
  if (tag === 'RIFF') return 'audio/wav';
  if (tag === 'OggS') return 'audio/ogg';
  if (String.fromCharCode(...b.slice(4, 8)) === 'ftyp') return 'audio/mp4';
  return 'audio/mpeg';
}
