/** Query parameter that carries a room code on a shareable `/play/<gameId>` link. */
export const JOIN_ROOM_PARAM = 'room';

const ROOM_CODE_PATTERN = /^\d{6}$/;

/**
 * Builds the link a host shares so a friend lands straight in their room,
 * e.g. `https://playdeck.app/play/chess?room=482913`.
 */
export function buildJoinLink(gameId: string, roomCode: string, origin: string): string {
  const url = new URL(`/play/${encodeURIComponent(gameId)}`, origin);
  url.searchParams.set(JOIN_ROOM_PARAM, roomCode.trim());
  return url.toString();
}

/** Returns the room code from a link's query value, or null when it is not a valid code. */
export function parseJoinCode(value: string | null | undefined): string | null {
  const code = value?.trim() ?? '';
  return ROOM_CODE_PATTERN.test(code) ? code : null;
}
