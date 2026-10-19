import "server-only";

export async function serverNowMs() {
  return Date.now();
}
