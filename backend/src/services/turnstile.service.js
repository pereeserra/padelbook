const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const verifyTurnstileToken = async ({ token, remoteip }) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      success: false,
      message: "Falta configurar TURNSTILE_SECRET_KEY al backend.",
    };
  }

  if (!token || typeof token !== "string") {
    return {
      success: false,
      message: "Falta el token de verificació de seguretat.",
    };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: "La verificació de seguretat no és vàlida o ha caducat.",
        errors: Array.isArray(data["error-codes"]) ? data["error-codes"] : [],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error verificant Turnstile:", error);

    return {
      success: false,
      message: "No s'ha pogut validar la verificació de seguretat.",
    };
  }
};

module.exports = {
  verifyTurnstileToken,
};