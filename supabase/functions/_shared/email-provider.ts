export async function sendNotificationEmail(
  payload: Record<string, unknown>,
  eventKey: string,
): Promise<{ id: string }> {
  // A direct Resend key (stored in the backend) avoids gateway project-authorization failures.
  const direct = Deno.env.get("RESEND_DIRECT_API_KEY");
  const key = direct ?? Deno.env.get("LOVABLE_API_KEY");
  const connection = direct ?? Deno.env.get("RESEND_API_KEY");
  if (!key || !connection) throw new Error("Email service not configured");
  const response = await fetch(
    direct ? "https://api.resend.com/emails" : "https://connector-gateway.lovable.dev/resend/emails",
    {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: direct
        ? { "Content-Type": "application/json", Authorization: `Bearer ${direct}`, "Idempotency-Key": eventKey }
        : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-Connection-Api-Key": connection,
          "Idempotency-Key": eventKey,
        },
      body: JSON.stringify(payload),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Do not persist credentials or recipient data in retry diagnostics.
    const message = typeof result.message === "string" ? result.message : "Provider rejected email";
    throw new Error(`Email provider [${response.status}]: ${message.replaceAll(key, "[redacted]").replaceAll(connection, "[redacted]")}`);
  }
  if (typeof result.id !== "string") throw new Error("Email provider returned no acceptance ID");
  return { id: result.id };
}