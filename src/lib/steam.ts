
export function id3ToId64(id3: string): bigint {
  const match = id3.match(/\[U:\d+:(\d+)\]/);
  if (!match) {
    throw new Error(`Invalid SteamID3 format: ${id3}`);
  }

  const accountId = BigInt(match[1]);
  const base = BigInt("76561197960265728");

  return (base + accountId);
}
