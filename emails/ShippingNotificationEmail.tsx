import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

export interface ShippingNotificationEmailProps {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
}

export default function ShippingNotificationEmail({
  orderId,
  trackingNumber,
  carrier,
  trackingUrl,
}: ShippingNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre commande #{orderId.slice(-8)} a été expédiée</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
        <Container style={{ padding: '24px' }}>
          <Heading style={{ color: '#2D5A27' }}>Votre commande est en route !</Heading>
          <Text>
            Votre commande <strong>#{orderId.slice(-8)}</strong> vient d&apos;être expédiée par{' '}
            {carrier}.
          </Text>
          <Text>
            Numéro de suivi : <strong>{trackingNumber}</strong>
          </Text>
          {trackingUrl ? (
            <Text>
              <a href={trackingUrl}>Suivre mon colis</a>
            </Text>
          ) : null}
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            Boutique d&apos;épices de Madagascar
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
