import re

with open('/Users/mac/Desktop/Saiisai/saiisaiweb/src/features/products/HomePage.jsx', 'r') as f:
    content = f.read()

import_stmt = """import SaiisaiStories from '../home/SaiisaiStories';

// New Design System Components
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProducts from './components/FeaturedProducts';
import TrendingSellers from './components/TrendingSellers';
import BannerSection from './components/BannerSection';"""

content = content.replace("import SaiisaiStories from '../home/SaiisaiStories';", import_stmt, 1)

new_return = """  return (
    <PageWrapper>
      <HeroSection 
        heroSlides={heroSlides} 
        resolveAdLink={resolveAdLink} 
        formatPromoEndDate={formatPromoEndDate} 
      />

      <BannerSection 
        bannerAds={bannerAds} 
        isLoading={isAdsLoading} 
      />
      
      {/* Features / Trust Section */}
      <TrustSection>
        <Container>
          <TrustGrid>
            <TrustItem>
              <TrustIcon><FaShieldAlt /></TrustIcon>
              <TrustInfo>
                <h3>Secure Payment</h3>
                <p>100% secure payment</p>
              </TrustInfo>
            </TrustItem>
            <TrustItem>
              <TrustIcon><FaTruck /></TrustIcon>
              <TrustInfo>
                <h3>Fast Delivery</h3>
                <p>Within 24-48 hours</p>
              </TrustInfo>
            </TrustItem>
            <TrustItem>
              <TrustIcon><FaHeadset /></TrustIcon>
              <TrustInfo>
                <h3>24/7 Support</h3>
                <p>Dedicated support</p>
              </TrustInfo>
            </TrustItem>
          </TrustGrid>
        </Container>
      </TrustSection>

      <CategoriesSection 
        categories={categories} 
        isLoading={isCategoriesLoading} 
        isError={isCategoriesError} 
      />

      <TrendingSellers 
        sellers={sellers} 
        isLoading={isSellersLoading} 
      />

      <FeaturedProducts 
        products={followedProducts} 
        isLoading={isFollowedProductsLoading} 
        title="From sellers you follow" 
        link={PATHS.FOLLOWED}
        handleProductClick={handleProductClick} 
      />

      <EazShopSection />

      <DealOfTheDaySection
        dealProduct={dealOfTheDay.dealProduct}
        endOfDay={dealOfTheDay.endOfDay}
      />

      <SaiisaiStories />

      <FeaturedProducts 
        products={products} 
        isLoading={isLoading} 
        title="All Products" 
        link={PATHS.PRODUCTS}
        handleProductClick={handleProductClick} 
      />

      <AdPopup
        ad={activePopupAd}
        open={Boolean(activePopupAd)}
        onDismiss={handlePopupDismiss}
      />
    </PageWrapper>
  );"""

# The existing return block spans from '  return (' until '  );\n};' block.
# We'll use regex to isolate and replace the entire return block within the HomePage component
pattern = re.compile(r'  return \(\n    <PageWrapper>.*?\n  \);', re.DOTALL)
content = pattern.sub(new_return, content, count=1)

with open('/Users/mac/Desktop/Saiisai/saiisaiweb/src/features/products/HomePage.jsx', 'w') as f:
    f.write(content)

print("HomePage.jsx updated successfully")
