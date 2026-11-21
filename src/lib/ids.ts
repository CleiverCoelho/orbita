export function createId(random: () => number = Math.random): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `h-${Date.now().toString(36)}-${Math.floor(random() * 1e9).toString(36)}`;
}
