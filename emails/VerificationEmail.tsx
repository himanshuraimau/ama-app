import React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Container,
  Body,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here's your verification code: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Row>
              <Heading as="h2" style={h2}>Hello {username},</Heading>
            </Row>
            <Row>
              <Text style={text}>
                Thank you for registering. Please use the following verification
                code to complete your registration:
              </Text>
            </Row>
            <Row>
              <Text style={code}>{otp}</Text> 
            </Row>
            <Row>
              <Text style={text}>
                If you did not request this code, please ignore this email.
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Roboto, Verdana, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  margin: '24px 0',
};

const code = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  margin: '16px 0',
  padding: '12px',
  textAlign: 'center' as const,
};