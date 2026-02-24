import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PolicyContainer,
  PolicyContent,
  PolicyHeader,
  IntroText,
  PolicySection,
  SectionContent,
  NumberedList,
  Paragraph,
  SectionDivider,
  BulletList,
} from './policy.styles';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const CONTACT_EMAIL = 'support@saiisai.com';
const SUBJECT_LINE = 'Data Deletion Request';
const MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT_LINE)}`;

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;

  @media ${devicesMax.sm} {
    padding: 24px 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;

  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

const SectionTitlePrimary = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-xl);
  line-height: 1.3;

  &:first-of-type {
    margin-top: 0;
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-lg);
  }
`;

const ContactBox = styled.div`
  background: var(--color-grey-50);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;

  a {
    color: var(--color-primary-600);
    font-weight: var(--font-semibold);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const RequestButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
  margin-top: var(--spacing-md);

  &:hover {
    background: var(--color-primary-600);
    color: var(--color-white-0);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const FooterLinks = styled.footer`
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-grey-200);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);

  a {
    color: var(--color-primary-600);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  span {
    margin: 0 var(--spacing-xs);
  }
`;

const ConfirmationStatement = styled.div`
  background: var(--color-green-50);
  border-left: 4px solid var(--color-green-600);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--color-grey-800);
  line-height: 1.6;
`;

/**
 * Data Deletion Instructions – Saiisai
 * Production-ready page for https://saiisai.com/data-deletion
 */
const DataDeletionPage = () => {
  useDynamicPageTitle({
    title: 'Data Deletion Instructions • Saiisai',
    description:
      'Request deletion of your Saiisai account data. Learn how to submit a data deletion request and what to expect.',
    keywords: 'data deletion, delete account, data removal, Saiisai, privacy',
    defaultTitle: 'Data Deletion Instructions • Saiisai',
    defaultDescription: 'Request deletion of your Saiisai account data.',
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <PolicyContainer>
      <PolicyContent initial="hidden" animate="visible" variants={staggerContainer}>
        <PageWrapper>
          <PolicyHeader>
            <PageTitle>Data Deletion Instructions</PageTitle>
            <IntroText>
              You can request deletion of the data we hold that is associated with your Saiisai
              account. This page explains what we delete, how to request it, and what to expect.
            </IntroText>
          </PolicyHeader>

          <PolicySection variants={staggerItem}>
            <SectionTitlePrimary>Who can request deletion</SectionTitlePrimary>
            <SectionContent>
              <Paragraph>
                This process applies to any Saiisai account holder. You can request deletion of your
                account and associated data by following the steps below. For general account or
                data requests, you can also contact us.
              </Paragraph>
            </SectionContent>
          </PolicySection>

          <PolicySection variants={staggerItem}>
            <SectionTitlePrimary>What data will be deleted</SectionTitlePrimary>
            <SectionContent>
              <Paragraph>When you submit a valid data deletion request, we will delete:</Paragraph>
              <BulletList>
                <li>Profile information (name, email, contact details)</li>
                <li>Account data associated with your account</li>
                <li>Order history and related transaction data, if you request full account deletion</li>
              </BulletList>
              <Paragraph>
                We will remove or anonymize this data in line with our privacy practices and
                applicable law. Some data may be retained where we have a legal obligation or
                legitimate interest (for example, completed transaction records required for tax or
                dispute resolution).
              </Paragraph>
            </SectionContent>
          </PolicySection>

          <PolicySection variants={staggerItem}>
            <SectionTitlePrimary>How to request deletion</SectionTitlePrimary>
            <SectionContent>
              <Paragraph>To request deletion of your data from Saiisai:</Paragraph>
              <NumberedList>
                <li>
                  Send an email to <strong>{CONTACT_EMAIL}</strong> from the email address associated with your Saiisai account.
                </li>
                <li>
                  Use the subject line: <strong>{SUBJECT_LINE}</strong>
                </li>
                <li>
                  In the body of the email, clearly state that you are requesting deletion of your
                  account and associated data. You may include your registered email or phone if it
                  helps us identify your account.
                </li>
                <li>
                  We will confirm receipt and process your request in accordance with our Privacy
                  Policy and this page.
                </li>
              </NumberedList>
              <ContactBox>
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Contact email:</strong>{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </Paragraph>
                <Paragraph style={{ marginTop: 'var(--spacing-sm)' }}>
                  <strong>Subject line:</strong> {SUBJECT_LINE}
                </Paragraph>
                <RequestButton
                  href={MAILTO_URL}
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request Account Deletion
                </RequestButton>
              </ContactBox>
            </SectionContent>
          </PolicySection>

          <SectionDivider />

          <PolicySection variants={staggerItem}>
            <SectionTitlePrimary>Processing timeline</SectionTitlePrimary>
            <SectionContent>
              <Paragraph>
                We aim to complete data deletion requests within <strong>7 working days</strong> of
                receiving a valid request. You will receive a confirmation email once the process
                has been completed. If we need more information to identify your account, we will
                contact you at the email address you provided.
              </Paragraph>
            </SectionContent>
          </PolicySection>

          <PolicySection variants={staggerItem}>
            <SectionTitlePrimary>Confirmation</SectionTitlePrimary>
            <SectionContent>
              <ConfirmationStatement>
                Saiisai is committed to handling your data responsibly and to processing deletion
                requests in a timely manner. For more detail on how we collect, use, and protect
                your information, please see our Privacy Policy and Terms of Service.
              </ConfirmationStatement>
            </SectionContent>
          </PolicySection>

          <FooterLinks>
            <Paragraph style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Saiisai</strong>
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              <Link to={PATHS.PRIVACY}>Privacy Policy</Link>
              <span>·</span>
              <Link to={PATHS.TERMS}>Terms of Service</Link>
            </Paragraph>
          </FooterLinks>
        </PageWrapper>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default DataDeletionPage;
