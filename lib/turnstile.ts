import "server-only";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token?: string | null,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If secret key is not configured, warn and allow to avoid breaking local dev if omitted
  if (!secretKey) {
    console.warn(
      "[Turnstile] Warning: TURNSTILE_SECRET_KEY is not set. Verification bypassed."
    );
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Security verification token is required. Please complete the captcha.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!res.ok) {
      return {
        success: false,
        error: "Unable to verify security challenge. Please try again.",
      };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      const errorDetail = data["error-codes"]?.join(", ") ?? "Verification failed";
      console.warn(`[Turnstile] Verification failed: ${errorDetail}`);
      return {
        success: false,
        error: "Security check failed. Please refresh and try again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[Turnstile] Error contacting Cloudflare verify endpoint:", err);
    return {
      success: false,
      error: "Security challenge service error. Please try again later.",
    };
  }
}
