"use client";

import { FormEvent, useState } from "react";

const CONTACT_TO = "hussein.mufti01@gmail.com";

const nameFieldClass = "contact-field contact-field--name";
const emailFieldClass = "contact-field contact-field--email";
const messageFieldClass = "contact-field contact-field--message min-h-28 resize-y";

const labelClass =
  "block text-[10px] tracking-[0.2em] text-zinc-400 uppercase";

type SubmitStatus = "idle" | "loading" | "success" | "error";

type DeliveryResult = {
  error?: string;
  message?: string;
  success?: string | boolean;
};

function formSubmitSucceeded(success: DeliveryResult["success"]) {
  return success === true || success === "true";
}

async function sendViaFormSubmit(name: string, email: string, message: string) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `Nordlys inquiry from ${name}`,
        _replyto: email,
        _template: "table",
        _url: window.location.href,
      }),
    },
  );

  const raw = await response.text();
  let result: DeliveryResult | null = null;

  try {
    result = JSON.parse(raw) as DeliveryResult;
  } catch {
    throw new Error("Could not send your message. Please try again.");
  }

  const responseText = `${result.message ?? ""} ${result.success ?? ""}`.toLowerCase();

  if (responseText.includes("activation")) {
    throw new Error(
      `Check ${CONTACT_TO} (including spam) for a FormSubmit activation email, click the link, then submit again.`,
    );
  }

  if (!response.ok || !formSubmitSucceeded(result.success)) {
    throw new Error(result.message ?? "Could not send your message.");
  }
}

async function sendViaApi(name: string, email: string, message: string) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  });

  if (response.status === 503) {
    return false;
  }

  const result = (await response.json().catch(() => null)) as DeliveryResult | null;

  if (!response.ok) {
    throw new Error(result?.error ?? "Could not send your message.");
  }

  return true;
}

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      setErrorMessage("Name, email, and message are required.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      let sent = false;

      try {
        sent = await sendViaApi(name, email, message);
      } catch {
        sent = false;
      }

      if (!sent) {
        await sendViaFormSubmit(name, email, message);
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send your message.",
      );
    }
  }

  const buttonLabel =
    status === "loading"
      ? "Sending..."
      : status === "success"
        ? "Message sent"
        : "Send message";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-4">
        <label className={labelClass}>
          Name
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            disabled={status === "loading"}
            className={nameFieldClass}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            required
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="next"
            disabled={status === "loading"}
            className={emailFieldClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Message
        <textarea
          required
          name="message"
          rows={3}
          enterKeyHint="send"
          disabled={status === "loading"}
          className={messageFieldClass}
        />
      </label>
      {status === "error" && errorMessage ? (
        <p className="contact-form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "success" ? (
        <p className="contact-form-success" role="status">
          Thanks — your message was sent.
        </p>
      ) : null}
      <button
        type="submit"
        className="contact-submit-btn"
        disabled={status === "loading"}
      >
        <span className="contact-submit-btn-label">{buttonLabel}</span>
      </button>
    </form>
  );
}
