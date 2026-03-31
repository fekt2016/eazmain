import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { PATHS } from '../../../routes/routePaths';
import {
  Overlay,
  Banner,
  BannerContent,
  BannerText,
  BannerTitle,
  BannerDescription,
  BannerActions,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  CustomizePanel,
  CustomizeRow,
  CustomizeLabel,
  CustomizeCheckbox,
} from './CookieConsentBanner.styles';

/**
 * Cookie consent banner displayed on first visit until user makes a choice.
 * Uses useCookieConsent for Accept All, Essential Only, and Customize.
 */
const CookieConsentBanner = () => {
  const {
    consent,
    shouldShowBanner,
    acceptAll,
    acceptEssential,
    savePreferences,
  } = useCookieConsent();

  const [showCustomize, setShowCustomize] = useState(false);
  const [customPrefs, setCustomPrefs] = useState({
    analytics: consent.analytics,
    marketing: consent.marketing,
    preferences: consent.preferences,
    performance: consent.performance,
  });

  const handleSaveCustom = () => {
    savePreferences(customPrefs);
    setShowCustomize(false);
  };

  const toggleCustom = (key) => {
    setCustomPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!shouldShowBanner) return null;

  return (
    <Overlay role="dialog" aria-labelledby="cookie-banner-title">
      <Banner>
        <BannerContent>
          <BannerText>
            <BannerTitle id="cookie-banner-title">We use cookies</BannerTitle>
            <BannerDescription>
              Saiisai uses cookies to provide essential services, remember your preferences,
              and improve your experience. You can accept all, use only essential cookies, or
              customize your choices.{' '}
              <Link to={PATHS.COOKIE_POLICY}>Learn more</Link>
            </BannerDescription>
          </BannerText>

          {!showCustomize ? (
            <BannerActions>
              <PrimaryButton type="button" onClick={acceptAll}>
                Accept All
              </PrimaryButton>
              <SecondaryButton type="button" onClick={acceptEssential}>
                Essential Only
              </SecondaryButton>
              <TertiaryButton
                type="button"
                onClick={() => setShowCustomize(true)}
              >
                Customize
              </TertiaryButton>
            </BannerActions>
          ) : (
            <CustomizePanel>
              <CustomizeRow>
                <CustomizeLabel htmlFor="cookie-analytics">
                  <CustomizeCheckbox
                    id="cookie-analytics"
                    type="checkbox"
                    checked={customPrefs.analytics}
                    onChange={() => toggleCustom('analytics')}
                  />
                  Analytics
                </CustomizeLabel>
                <small>Understand how you use our site</small>
              </CustomizeRow>
              <CustomizeRow>
                <CustomizeLabel htmlFor="cookie-marketing">
                  <CustomizeCheckbox
                    id="cookie-marketing"
                    type="checkbox"
                    checked={customPrefs.marketing}
                    onChange={() => toggleCustom('marketing')}
                  />
                  Marketing
                </CustomizeLabel>
                <small>Relevant ads and measurement</small>
              </CustomizeRow>
              <CustomizeRow>
                <CustomizeLabel htmlFor="cookie-preferences">
                  <CustomizeCheckbox
                    id="cookie-preferences"
                    type="checkbox"
                    checked={customPrefs.preferences}
                    onChange={() => toggleCustom('preferences')}
                  />
                  Preferences
                </CustomizeLabel>
                <small>Remember settings and choices</small>
              </CustomizeRow>
              <CustomizeRow>
                <CustomizeLabel htmlFor="cookie-performance">
                  <CustomizeCheckbox
                    id="cookie-performance"
                    type="checkbox"
                    checked={customPrefs.performance}
                    onChange={() => toggleCustom('performance')}
                  />
                  Performance
                </CustomizeLabel>
                <small>Improve site speed and experience</small>
              </CustomizeRow>
              <BannerActions>
                <PrimaryButton type="button" onClick={handleSaveCustom}>
                  Save preferences
                </PrimaryButton>
                <TertiaryButton
                  type="button"
                  onClick={() => setShowCustomize(false)}
                >
                  Back
                </TertiaryButton>
              </BannerActions>
            </CustomizePanel>
          )}
        </BannerContent>
      </Banner>
    </Overlay>
  );
};

export default CookieConsentBanner;
