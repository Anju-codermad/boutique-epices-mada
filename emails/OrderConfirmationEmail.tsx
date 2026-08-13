import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

function formatPriceTtc(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} € TTC`;
}

export interface OrderConfirmationEmailProps {
  orderId: string;
  items: { name: string; weightGrams: number; quantity: number; unitPriceTtcCents: number }[];
  subtotalTtcCents: number;
  shippingCents: number;
  discountCents: number;
  totalTtcCents: number;
}

export default function OrderConfirmationEmail({
  orderId,
  items,
  subtotalTtcCents,
  shippingCents,
  discountCents,
  totalTtcCents,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre commande #{orderId.slice(-8)}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
        <Container style={{ padding: '24px' }}>
          <Heading style={{ color: '#2D5A27' }}>Merci pour votre commande !</Heading>
          <Text>
            Votre commande <strong>#{orderId.slice(-8)}</strong> a bien été confirmée. Voici le
            récapitulatif :
          </Text>

          <Section>
            {items.map((item) => (
              <Text key={item.name + item.weightGrams}>
                {item.quantity} × {item.name} ({item.weightGrams} g) —{' '}
                {formatPriceTtc(item.unitPriceTtcCents * item.quantity)}
              </Text>
            ))}
          </Section>

          <Hr />

          <Text>Sous-total : {formatPriceTtc(subtotalTtcCents)}</Text>
          {discountCents > 0 ? <Text>Remise : -{formatPriceTtc(discountCents)}</Text> : null}
          <Text>Livraison : {shippingCents === 0 ? 'Offerte' : formatPriceTtc(shippingCents)}</Text>
          <Text style={{ fontWeight: 'bold' }}>Total TTC : {formatPriceTtc(totalTtcCents)}</Text>

          <Hr />

          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            Boutique d&apos;épices de Madagascar — vous recevrez un email dès l&apos;expédition de
            votre commande.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
