import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

function formatPriceTtc(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} € TTC`;
}

export interface RefundConfirmationEmailProps {
  orderId: string;
  refundedAmountCents: number;
}

export default function RefundConfirmationEmail({
  orderId,
  refundedAmountCents,
}: RefundConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Remboursement de votre commande #{orderId.slice(-8)}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
        <Container style={{ padding: '24px' }}>
          <Heading style={{ color: '#2D5A27' }}>Votre remboursement est confirmé</Heading>
          <Text>
            Votre retour pour la commande <strong>#{orderId.slice(-8)}</strong> a bien été reçu et
            validé.
          </Text>
          <Text>
            Montant remboursé : <strong>{formatPriceTtc(refundedAmountCents)}</strong>
          </Text>
          <Text>
            Le remboursement apparaîtra sur votre moyen de paiement d&apos;origine sous quelques
            jours.
          </Text>
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            Boutique d&apos;épices de Madagascar
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
