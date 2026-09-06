"use client";

import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "hussein.mufti01@gmail.com";

const fieldClass =
  "mt-2 w-full min-h-12 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-white/20 focus:ring-2 focus:ring-aurora-cyan/40";

const labelClass =
  "block text-[10px] tracking-[0.2em] text-zinc-400 uppercase sm:text-[11px]";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Nordlys inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <label className={labelClass}>
          Name
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            className={fieldClass}
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
            className={fieldClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Message
        <textarea
          required
          name="message"
          rows={4}
          enterKeyHint="send"
          className={`${fieldClass} resize-y sm:min-h-36`}
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-linear-to-r from-aurora-green via-aurora-blue to-aurora-purple px-5 text-sm font-medium text-black transition active:brightness-125 sm:w-auto sm:hover:brightness-110"
      >
        {sent ? "Opening your email app" : "Send message"}
      </button>
    </form>
  );
}
