console.log("[SERVICE] billing-http.ts loaded");

export function getBillingLimitHttpResponse(error: unknown) {
  const value = error as {
    name?: string;
    message?: string;
    code?: string;
    status?: number;
  };

  const isBillingLimitError =
    value.name === "BillingLimitError" ||
    value.code === "BOT_LIMIT_REACHED" ||
    value.code === "ACTIVE_BOT_LIMIT_REACHED" ||
    value.code === "BILLING_LIMIT_REACHED";

  if (!isBillingLimitError) {
    return null;
  }

  return {
    status: value.status ?? 403,
    body: {
      error:
        value.message ||
        "Your current plan limit has been reached.",
      code: value.code ?? "BILLING_LIMIT_REACHED",
    },
  };
}