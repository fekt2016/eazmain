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
  NumberedList,
  LetteredList,
  BulletList,
  Paragraph,
  ImportantNotice,
  WarningBox,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Return & Refund Policy Page
 * Professional legal policy page styled like Temu, Amazon, and Shopify
 */
const ReturnRefundPolicyPage = () => {
  // Get today's date for "Last Updated"
  const today = new Date();
  const lastUpdatedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SEO
  useDynamicPageTitle({
    title: 'Return & Refund Policy • Saiisai',
    description: 'Learn about Saiisai\'s return and refund process, timelines, and policies.',
    keywords: 'return policy, refund policy, Saiisai returns, Saiisai refunds, return process',
    defaultTitle: 'Return & Refund Policy • Saiisai',
    defaultDescription: 'Learn about Saiisai\'s return and refund process.',
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        {/* Header */}
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Return & Refund Policy</PolicyTitle>
          <LastUpdated>Last Updated: {lastUpdatedDate}</LastUpdated>
          <IntroText>
            If you are not satisfied with an item purchased on Saiisai, you may be eligible to return it and receive a refund. Please follow the procedure outlined in this Return and Refund Policy.
          </IntroText>
        </PolicyHeader>

        {/* Section 1: How do I make a return? */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>1. How do I make a return?</SectionTitle>
          <SectionContent>
            <NumberedList>
              <li>
                <Paragraph>
                  You can make a return by following these steps:
                </Paragraph>
                <LetteredList>
                  <li>
                    <Paragraph>
                      Go to your Saiisai account (web or app) and request a return. If you ordered as a guest, click "Track Your Order" in your order confirmation email.
                    </Paragraph>
                  </li>
                  <li>
                    <Paragraph>
                      Find the order under "Your Orders" and select "Return/Refund".
                    </Paragraph>
                  </li>
                  <li>
                    <Paragraph>
                      Select the items you want to return and choose the return reason. Depending on the reason, you may need to provide additional information.
                    </Paragraph>
                  </li>
                  <li>
                    <Paragraph>
                      If the item does not need to be physically returned, select your refund method:
                    </Paragraph>
                    <BulletList>
                      <li>Refund to your Saiisai credit balance</li>
                      <li>Refund to your original payment method</li>
                    </BulletList>
                  </li>
                  <li>
                    <Paragraph>
                      If you must return the item, self-ship it through any courier of your choice. You are responsible for return shipping fees. After shipping, upload the tracking information.
                    </Paragraph>
                  </li>
                  <li>
                    <Paragraph>
                      You can track the status of your return/refund through your order details page or via SMS/Email/Push notifications.
                    </Paragraph>
                  </li>
                </LetteredList>
                <ImportantNotice>
                  <Paragraph>
                    <strong>⚠ Important:</strong> Your return package must be postmarked within <strong>14 days</strong> after you submit your return request. Otherwise, the return will be canceled.
                  </Paragraph>
                </ImportantNotice>
              </li>
            </NumberedList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 2: Return Shipping Fee */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Return Shipping Fee</SectionTitle>
          <SectionContent>
            <Paragraph>
              After submitting a return request, <strong>you are responsible for all return shipping costs</strong>, unless specified otherwise.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 3: How long do I have to return an item? */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>3. How long do I have to return an item?</SectionTitle>
          <SectionContent>
            <Paragraph>
              Saiisai allows returns <strong>within 90 days</strong> of purchase, with exceptions.
            </Paragraph>
            <Paragraph>
              <strong>Items that cannot be returned:</strong>
            </Paragraph>
            <BulletList>
              <li>Clothing that has been worn, washed, damaged, or missing tags/hygiene seals</li>
              <li>Grocery or perishable food</li>
              <li>Certain personal care & health items</li>
              <li>Free gifts</li>
              <li>Customized or personalized products</li>
            </BulletList>
            <Paragraph>
              If your item is eligible, ensure:
            </Paragraph>
            <BulletList>
              <li>It is within the 90-day window</li>
              <li>The return package is shipped within 14 days of submitting the return request</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 4: Refunds */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Refunds</SectionTitle>
          <SectionContent>
            <LetteredList>
              <li>
                <Paragraph>
                  <strong>Advanced Refunds</strong>
                </Paragraph>
                <Paragraph>
                  In some cases, Saiisai may issue an advanced refund immediately after you drop off your return package. If the return is not completed or the item fails inspection, Saiisai may charge your original payment method.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refund After Inspection</strong>
                </Paragraph>
                <Paragraph>
                  If return is required, refunds are issued after items pass quality inspection.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Deductions for Used/Damaged Items</strong>
                </Paragraph>
                <Paragraph>
                  If returned items are used, damaged, missing parts, or poorly packaged, the refund may be reduced based on lost value.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refund for Missing Items/Parts</strong>
                </Paragraph>
                <Paragraph>
                  Submit a ticket via "Support Center" → "Missing item/parts".
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refund for Package Marked Delivered but Not Received</strong>
                </Paragraph>
                <Paragraph>
                  Submit a ticket via "Support Center" → "Package shows delivered but not received".
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refund Processing Time</strong>
                </Paragraph>
                <Paragraph>
                  Bank refunds take <strong>5–14 business days</strong> (up to 30 days). Original shipping fees, import taxes, insurance, and delivery-signature fees are <strong>not refundable</strong>, unless the issue is Saiisai's fault.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refund to Saiisai Credits</strong>
                </Paragraph>
                <BulletList>
                  <li>Faster processing</li>
                  <li>No expiration</li>
                  <li>Cannot usually be converted to cash</li>
                  <li>Can only be used for purchases on Saiisai</li>
                </BulletList>
              </li>
            </LetteredList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 5: Refund Timeline */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Refund Timeline</SectionTitle>
          <SectionContent>
            <Paragraph>
              After Saiisai processes the refund, your financial institution may require additional processing time based on the payment provider. The time it takes for the refund to appear in your account depends on your bank or payment method's processing policies.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 6: Important Notices */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Important Notices</SectionTitle>
          <SectionContent>
            <LetteredList>
              <li>
                <Paragraph>
                  The address on your package is <strong>NOT</strong> the return address. Use only the return address provided in the return instructions inside your account.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  Do <strong>NOT</strong> place unintended items inside your return package. Saiisai cannot guarantee recovery or compensation for misplaced items.
                </Paragraph>
              </li>
            </LetteredList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 7: Need Help? */}
        <HelpSection variants={staggerItem}>
          <HelpTitle>7. Need Help?</HelpTitle>
          <HelpText>
            Contact our Customer Support team at any time if you have questions about returns or refunds.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaHeadset />
            Visit Support Center
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default ReturnRefundPolicyPage;

