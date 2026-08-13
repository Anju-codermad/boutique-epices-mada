'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Une erreur est survenue.');
        return;
      }

      setStatus('success');
      setMessage(data.message ?? 'Inscription réussie.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Une erreur est survenue.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.com"
          aria-label="Adresse email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" size="sm" disabled={status === 'loading'}>
          S&apos;inscrire
        </Button>
      </div>
      {message ? (
        <p className={`text-sm ${status === 'error' ? 'text-destructive' : 'text-forest'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
