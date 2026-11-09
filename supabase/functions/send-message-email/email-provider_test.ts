import { assertEquals, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sendNotificationEmail } from "../_shared/email-provider.ts";

Deno.test("Provider rejection is not reported as sent", async () => {
  const originalFetch = globalThis.fetch;
  const key = Deno.env.get("LOVABLE_API_KEY");
  const connection = Deno.env.get("RESEND_API_KEY");
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  Deno.env.set("RESEND_API_KEY", "test-connection");
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "Project is not authorized to use this credential" }), { status: 403 });
  try {
    await assertRejects(() => sendNotificationEmail({ subject: "Test" }, "message/test"), Error, "[403]");
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) Deno.env.delete("LOVABLE_API_KEY"); else Deno.env.set("LOVABLE_API_KEY", key);
    if (connection === undefined) Deno.env.delete("RESEND_API_KEY"); else Deno.env.set("RESEND_API_KEY", connection);
  }
});

Deno.test("Provider acceptance uses the event idempotency key", async () => {
  const originalFetch = globalThis.fetch;
  const key = Deno.env.get("LOVABLE_API_KEY");
  const connection = Deno.env.get("RESEND_API_KEY");
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  Deno.env.set("RESEND_API_KEY", "test-connection");
  let eventKey: string | null = null;
  globalThis.fetch = async (_url, options) => {
    eventKey = new Headers(options?.headers).get("Idempotency-Key");
    return new Response(JSON.stringify({ id: "accepted-id" }), { status: 200 });
  };
  try {
    assertEquals(await sendNotificationEmail({ subject: "Test" }, "message/test"), { id: "accepted-id" });
    assertEquals(eventKey, "message/test");
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) Deno.env.delete("LOVABLE_API_KEY"); else Deno.env.set("LOVABLE_API_KEY", key);
    if (connection === undefined) Deno.env.delete("RESEND_API_KEY"); else Deno.env.set("RESEND_API_KEY", connection);
  }
});

Deno.test('Provider success without acceptance ID is rejected', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 200 });
  try { await assertRejects(() => sendNotificationEmail({}, 'test/missing-id'), Error, 'no acceptance ID'); }
  finally { globalThis.fetch = original; }
});