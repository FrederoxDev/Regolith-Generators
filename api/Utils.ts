/**
 * Generates a simple random ID, useful for unimportant identifiers
 * @returns A simple 16 character long string made up of random characters between a-z
 */
export function randomId(length: number = 16): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }

  return result;
}

export function sanitiseIdentifierForFilename(identifier: string): string {
    return identifier.split(":").pop()!.replace(/[^a-z0-9_]/g, "_");
}

export function randomIdFromIdentifier(identifier: string): string {
    const sanitised = sanitiseIdentifierForFilename(identifier);
    return `${sanitised}_${randomId(8)}`;
}