"use client";

import { FormEvent, useEffect, useState } from "react";

const nameFieldClass = "contact-field contact-field--name";
const emailFieldClass = "contact-field contact-field--email";
const messageFieldClass = "contact-field contact-field--message min-h-28 resize-y";

const labelClass =
  "block text-[10px] tracking-[0.2em] text-zinc-400 uppercase";

type SubmitStatus = "idle" | "loading" | "success" | "error";

async function sendMessage(
  name: string,
  email: string,
  message: string,
  website: string,
) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message, website }),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(result?.error ?? "Could not send your message.");
  }
}

export function ContactForm() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="contact-form-placeholder" aria-hidden="true" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const website = String(data.get("website") ?? "");

    if (!name || !email || !message) {
      setStatus("error");
      setErrorMessage("Name, email, and message are required.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await sendMessage(name, email, message, website);

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
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
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
          maxLength={5000}
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
