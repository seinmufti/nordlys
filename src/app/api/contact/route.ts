import { NextResponse } from "next/server";

const DEFAULT_CONTACT_TO = "hussein.mufti01@gmail.com";
const DEFAULT_FROM = "Nordlys Contact <onboarding@resend.dev>";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 1000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > RATE_MAX;
}

async function sendViaResend(
  apiKey: string,
  to: string,
  name: string,
  email: string,
  message: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? DEFAULT_FROM,
      to: [to],
      reply_to: email,
      subject: `Nordlys inquiry from ${name}`,
      text: `${message}\n\n— ${name} (${email})`,
    }),
  });

  if (!response.ok) {
    console.error("Resend API error:", response.status, await response.text());
  }
  return response.ok;
}

async function sendViaFormSubmit(
  to: string,
  name: string,
  email: string,
  message: string,
) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `Nordlys inquiry from ${name}`,
        _replyto: email,
        _template: "table",
        _captcha: "false",
      }),
    },
  );

  const result = (await response.json().catch(() => null)) as {
    success?: string | boolean;
    message?: string;
  } | null;

  if (!response.ok || !(result?.success === true || result?.success === "true")) {
    console.error("FormSubmit error:", response.status, result?.message);
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success to bots.
  if (String(payload.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "Your message is too long." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const to = process.env.CONTACT_TO ?? DEFAULT_CONTACT_TO;
  const apiKey = process.env.RESEND_API_KEY;

  const sent = apiKey
    ? await sendViaResend(apiKey, to, name, email, message)
    : await sendViaFormSubmit(to, name, email, message);

  if (!sent) {
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
