'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // event.currentTarget devient null après un await (React réinitialise les
    // SyntheticEvent une fois le gestionnaire synchronement terminé) : on le
    // capture donc avant tout appel asynchrone.
    const form = event.currentTarget;
    setStatus('loading');
    setMessage(null);

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      website: formData.get('website'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Une erreur est survenue.');
        return;
      }

      setStatus('success');
      setMessage('Votre message a bien été envoyé, nous vous répondrons rapidement.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Une erreur est survenue.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {/* Honeypot : champ masqué visuellement, ignoré des utilisateurs, hors du flux de tabulation */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Nom
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          Sujet
        </label>
        <input
          id="subject"
          name="subject"
          required
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" disabled={status === 'loading'}>
        Envoyer le message
      </Button>

      {message ? (
        <p className={`text-sm ${status === 'error' ? 'text-destructive' : 'text-forest'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
