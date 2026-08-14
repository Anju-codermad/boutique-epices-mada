import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sendContactEmail } from '@/lib/emails';
import { checkContactRateLimit, clientIdentifier } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(5000),
  // Honeypot : champ invisible pour les humains, rempli uniquement par les bots.
  // Ne doit jamais faire échouer la validation (sinon la détection est révélée
  // par un 400) : accepte n'importe quelle chaîne, vérifiée séparément ci-dessous.
  website: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  const allowed = await checkContactRateLimit(clientIdentifier(request));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de messages envoyés, réessayez plus tard.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Formulaire invalide', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot rempli : on répond succès sans rien envoyer, pour ne pas révéler la détection.
  if (parsed.data.website) {
    return NextResponse.json({ message: 'Message envoyé.' });
  }

  await sendContactEmail(parsed.data);

  return NextResponse.json({ message: 'Message envoyé.' });
}
