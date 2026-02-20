import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PolicyContainer,
  PolicyContent,
  PolicyHeader,
  PolicyTitle,
  LastUpdated,
  IntroText,
  PolicySection,
  SectionTitle,
  SectionContent,
  BulletList,
  Paragraph,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * VAT & Tax Policy Page
 * Explains how Saiisai handles VAT and tax for the Ghana marketplace.
 */
const VatTaxPolicyPage = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useDynamicPageTitle({
    title: 'VAT & Tax Policy • Saiisai',
    description: 'Learn how Saiisai handles Value Added Tax (VAT) and tax compliance for buyers and sellers in Ghana.',
    keywords: 'VAT policy, tax policy, Ghana GRA, Saiisai tax, Value Added Tax',
    defaultTitle: 'VAT & Tax Policy • Saiisai',
    defaultDescription: 'VAT and tax policy for the Saiisai marketplace in Ghana.',
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PolicyContainer>
      <PolicyContent
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>VAT & Tax Policy</PolicyTitle>
          <LastUpdated>Last Updated: {lastUpdatedDate}</LastUpdated>
          <IntroText>
            Saiisai is an online marketplace platform that connects buyers and independent sellers. Sellers are responsible for setting the prices of their products and for complying with all applicable tax laws, including Value Added Tax (VAT), as required under the laws of the Republic of Ghana. Saiisai does not provide tax advice. Sellers are encouraged to consult their own tax advisors regarding their obligations.
          </IntroText>
        </PolicyHeader>

        <PolicySection variants={staggerItem}>
          <SectionTitle>1. General</SectionTitle>
          <SectionContent>
            <Paragraph>
              Saiisai is an online marketplace platform that connects buyers and independent sellers. Sellers are responsible for setting the prices of their products and for complying with all applicable tax laws, including Value Added Tax (VAT), as required under the laws of the Republic of Ghana.
            </Paragraph>
            <Paragraph>
              Saiisai does not provide tax advice. Sellers are encouraged to consult their own tax advisors regarding their obligations.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Seller VAT Status</SectionTitle>
          <SectionContent>
            <Paragraph>
              During seller onboarding and at any time thereafter, sellers are required to declare whether they are registered for VAT with the Ghana Revenue Authority (GRA).
            </Paragraph>
            <Paragraph>
              Each seller must accurately provide:
            </Paragraph>
            <BulletList>
              <li>Their VAT registration status; and</li>
              <li>A valid VAT registration number if they are VAT registered.</li>
            </BulletList>
            <Paragraph>
              Saiisai reserves the right to request documentation to verify a seller&apos;s VAT status.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>3. VAT-Registered Sellers</SectionTitle>
          <SectionContent>
            <Paragraph>
              If a seller is VAT registered:
            </Paragraph>
            <BulletList>
              <li>The seller confirms that they are legally authorized to charge VAT.</li>
              <li>Product prices entered by the seller are treated as VAT-exclusive base prices.</li>
              <li>Saiisai may calculate and add VAT at the applicable rate to determine the final customer price.</li>
              <li>The seller remains fully responsible for: declaring VAT; filing VAT returns; and remitting VAT to the Ghana Revenue Authority.</li>
              <li>VAT collected on such sales is paid out to the seller as part of their earnings, subject to applicable platform commissions and fees.</li>
              <li>Saiisai does not remit VAT to tax authorities on behalf of VAT-registered sellers.</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Non-VAT-Registered Sellers</SectionTitle>
          <SectionContent>
            <Paragraph>
              If a seller is not VAT registered:
            </Paragraph>
            <BulletList>
              <li>The seller confirms that they are not legally permitted to charge VAT.</li>
              <li>Any product price entered by the seller is treated as the seller&apos;s net price.</li>
              <li>Saiisai may apply VAT to the customer&apos;s final price where required by law.</li>
              <li>In such cases: VAT is withheld by Saiisai; VAT is declared and remitted by Saiisai to the Ghana Revenue Authority; the seller is paid their net price minus applicable platform commissions and fees.</li>
              <li>Non-VAT-registered sellers have no right to receive VAT amounts collected by Saiisai.</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Customer Pricing Display</SectionTitle>
          <SectionContent>
            <Paragraph>
              For simplicity and transparency:
            </Paragraph>
            <BulletList>
              <li>Customers are shown a single final price for products.</li>
              <li>VAT or other taxes may not be itemized separately at checkout.</li>
              <li>Prices displayed may include applicable taxes where required by law.</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Platform Commission VAT</SectionTitle>
          <SectionContent>
            <Paragraph>
              Regardless of a seller&apos;s VAT status:
            </Paragraph>
            <Paragraph>
              Saiisai may charge VAT on its platform commissions, service fees, or other charges where required by law. Such VAT is borne by the seller and deducted from payouts where applicable.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>7. Accuracy & Liability</SectionTitle>
          <SectionContent>
            <Paragraph>
              Sellers are solely responsible for:
            </Paragraph>
            <BulletList>
              <li>Providing accurate VAT information;</li>
              <li>Maintaining up-to-date tax status; and</li>
              <li>Complying with all applicable tax obligations.</li>
            </BulletList>
            <Paragraph>
              Saiisai shall not be liable for any penalties, interest, or tax liabilities arising from incorrect or misleading information provided by sellers.
            </Paragraph>
            <Paragraph>
              Saiisai reserves the right to: adjust payouts; suspend accounts; or take corrective action if VAT information is found to be false, incomplete, or misleading.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>8. Changes to Tax Treatment</SectionTitle>
          <SectionContent>
            <Paragraph>
              Saiisai may update its tax handling processes at any time to reflect changes in law, regulation, or guidance from tax authorities. Continued use of the platform constitutes acceptance of such changes.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <HelpSection variants={staggerItem}>
          <HelpTitle>Contact</HelpTitle>
          <HelpText>
            If you have any questions about this VAT & Tax Policy, please contact us.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaHeadset />
            Contact Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default VatTaxPolicyPage;
