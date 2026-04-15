export type UUIDVersion = "v4" | "v7";

export function genV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function genV7(): string {
  const now = Date.now();
  const msHex = now.toString(16).padStart(12, "0");

  const randA = (Math.random() * 0xfff) | 0;
  const randAHex = randA.toString(16).padStart(3, "0");

  const randB1 = ((Math.random() * 0x3f) | 0x80).toString(16);
  const randB2 = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

  return [
    msHex.slice(0, 8),
    msHex.slice(8, 12),
    "7" + randAHex,
    randB1 + randB2.slice(0, 3),
    randB2.slice(3),
  ].join("-");
}

export function genUUID(version: UUIDVersion): string {
  return version === "v7" ? genV7() : genV4();
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour12: false });
}
