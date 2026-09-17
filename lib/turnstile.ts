import "server-only";

export async function verifyTurnstileToken(
  _token?: string | null,
  _ip?: string
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
