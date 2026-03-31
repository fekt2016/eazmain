import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PolicyContainer,
  PolicyContent,
  PolicyHeader,
  PolicyTitle,
  IntroText,
  PolicySection,
  SectionTitle,
  SectionContent,
  Paragraph,
} from '../policies/policy.styles';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-lg) 0;
  font-size: var(--font-size-sm);

  th, td {
    border: 1px solid var(--color-grey-200);
    padding: var(--spacing-sm) var(--spacing-md);
    text-align: left;
  }

  th {
    background: var(--color-grey-100);
    font-weight: 600;
    color: var(--color-grey-800);
  }

  tr:nth-child(even) {
    background: var(--color-grey-50);
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-xs);
    th, td {
      padding: var(--spacing-xs) var(--spacing-sm);
    }
  }
`;

/**
 * Size Guide Page
 * Reference guide for clothing and shoe sizes on Saiisai
 */
const SizeGuidePage = () => {
  useDynamicPageTitle({
    title: 'Size Guide • Saiisai',
    description: 'Find your perfect fit. Clothing and shoe size charts for Saiisai.',
    keywords: 'size guide, clothing sizes, shoe sizes, fit guide, Saiisai',
    defaultTitle: 'Size Guide • Saiisai',
    defaultDescription: 'Find your perfect fit. Clothing and shoe size charts for Saiisai.',
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PolicyContainer>
      <PolicyContent initial="hidden" animate="visible" variants={staggerContainer}>
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Size Guide</PolicyTitle>
          <IntroText>
            Use this guide to find your correct size when shopping on Saiisai. Sizes may vary slightly by seller or brand. When in doubt, refer to the product page for seller-specific measurements.
          </IntroText>
        </PolicyHeader>

        <PolicySection variants={staggerItem}>
          <SectionTitle>Women&apos;s Clothing (General)</SectionTitle>
          <SectionContent>
            <Paragraph>Approximate UK/Africa sizing. Measure bust, waist, and hips in cm for best fit.</Paragraph>
            <Table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>82-86</td><td>64-68</td><td>88-92</td></tr>
                <tr><td>M</td><td>86-90</td><td>68-72</td><td>92-96</td></tr>
                <tr><td>L</td><td>90-94</td><td>72-76</td><td>96-100</td></tr>
                <tr><td>XL</td><td>94-98</td><td>76-80</td><td>100-104</td></tr>
                <tr><td>XXL</td><td>98-102</td><td>80-84</td><td>104-108</td></tr>
              </tbody>
            </Table>
          </SectionContent>
        </PolicySection>

        <PolicySection variants={staggerItem}>
          <SectionTitle>Men&apos;s Clothing (General)</SectionTitle>
          <SectionContent>
            <Paragraph>Approximate UK/Africa sizing. Chest and waist in cm.</Paragraph>
            <Table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Length (Shirt)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>86-91</td><td>71-76</td><td>70-72</td></tr>
                <tr><td>M</td><td>91-96</td><td>76-81</td><td>72-74</td></tr>
                <tr><td>L</td><td>96-101</td><td>81-86</td><td>74-76</td></tr>
                <tr><td>XL</td><td>101-106</td><td>86-91</td><td>76-78</td></tr>
                <tr><td>XXL</td><td>106-112</td><td>91-97</td><td>78-80</td></tr>
              </tbody>
            </Table>
          </SectionContent>
        </PolicySection>

        <PolicySection variants={staggerItem}>
          <SectionTitle>Women&apos;s Shoes</SectionTitle>
          <SectionContent>
            <Paragraph>UK/EU shoe conversion.</Paragraph>
            <Table>
              <thead>
                <tr>
                  <th>UK</th>
                  <th>EU</th>
                  <th>Foot length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>3</td><td>36</td><td>22.5</td></tr>
                <tr><td>4</td><td>37</td><td>23</td></tr>
                <tr><td>5</td><td>38</td><td>23.5</td></tr>
                <tr><td>6</td><td>39</td><td>24</td></tr>
                <tr><td>7</td><td>40</td><td>24.5</td></tr>
                <tr><td>8</td><td>41</td><td>25</td></tr>
              </tbody>
            </Table>
          </SectionContent>
        </PolicySection>

        <PolicySection variants={staggerItem}>
          <SectionTitle>Men&apos;s Shoes</SectionTitle>
          <SectionContent>
            <Paragraph>UK/EU shoe conversion.</Paragraph>
            <Table>
              <thead>
                <tr>
                  <th>UK</th>
                  <th>EU</th>
                  <th>Foot length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>7</td><td>41</td><td>25</td></tr>
                <tr><td>8</td><td>42</td><td>25.5</td></tr>
                <tr><td>9</td><td>43</td><td>26.5</td></tr>
                <tr><td>10</td><td>44</td><td>27</td></tr>
                <tr><td>11</td><td>45</td><td>28</td></tr>
                <tr><td>12</td><td>46</td><td>28.5</td></tr>
              </tbody>
            </Table>
          </SectionContent>
        </PolicySection>

        <PolicySection variants={staggerItem}>
          <SectionTitle>Tips</SectionTitle>
          <SectionContent>
            <Paragraph>
              • Always check the product description for seller-specific sizing notes.<br />
              • When between sizes, consider sizing up for comfort.<br />
              • For returns due to wrong size, see our <Link to={PATHS.REFUND_POLICY}>Return & Refund Policy</Link>.
            </Paragraph>
          </SectionContent>
        </PolicySection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default SizeGuidePage;
