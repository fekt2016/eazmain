const fs = require('fs');
const path = require('path');

// Import path mappings for EazMain
const importMappings = [
  // Components
  { from: /from ['"]\.\.\/components\/([^'"]+)['"]/g, to: (match, comp) => {
    return `from '../shared/components/${comp}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: (match, comp) => {
    return `from '../../shared/components/${comp}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: (match, comp) => {
    return `from '../../../shared/components/${comp}'`;
  }},
  // Hooks
  { from: /from ['"]\.\.\/hooks\/([^'"]+)['"]/g, to: (match, hook) => {
    return `from '../shared/hooks/${hook}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, to: (match, hook) => {
    return `from '../../shared/hooks/${hook}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, to: (match, hook) => {
    return `from '../../../shared/hooks/${hook}'`;
  }},
  // Services
  { from: /from ['"]\.\.\/service\/([^'"]+)['"]/g, to: (match, service) => {
    return `from '../shared/services/${service}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/service\/([^'"]+)['"]/g, to: (match, service) => {
    return `from '../../shared/services/${service}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/service\/([^'"]+)['"]/g, to: (match, service) => {
    return `from '../../../shared/services/${service}'`;
  }},
  // Utils
  { from: /from ['"]\.\.\/utils\/([^'"]+)['"]/g, to: (match, util) => {
    return `from '../shared/utils/${util}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, to: (match, util) => {
    return `from '../../shared/utils/${util}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/utils\/([^'"]+)['"]/g, to: (match, util) => {
    return `from '../../../shared/utils/${util}'`;
  }},
  // Styles
  { from: /from ['"]\.\.\/styles\/([^'"]+)['"]/g, to: (match, style) => {
    return `from '../shared/styles/${style}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/styles\/([^'"]+)['"]/g, to: (match, style) => {
    return `from '../../shared/styles/${style}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/styles\/([^'"]+)['"]/g, to: (match, style) => {
    return `from '../../../shared/styles/${style}'`;
  }},
  // Layout
  { from: /from ['"]\.\.\/layout\/([^'"]+)['"]/g, to: (match, layout) => {
    return `from '../shared/layout/${layout}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/layout\/([^'"]+)['"]/g, to: (match, layout) => {
    return `from '../../shared/layout/${layout}'`;
  }},
  { from: /from ['"]\.\.\/\.\.\/\.\.\/layout\/([^'"]+)['"]/g, to: (match, layout) => {
    return `from '../../../shared/layout/${layout}'`;
  }},
  // Pages (now in features)
  { from: /from ['"]\.\.\/pages\/([^'"]+)['"]/g, to: (match, page) => {
    // Determine feature based on page name
    const pageMap = {
      'HomePage': 'products/HomePage',
      'ProductDetail': 'products/ProductDetail',
      'CategoryPage': 'categories/CategoryPage',
      'CartPage': 'cart/CartPage',
      'WishlistPage': 'wishlist/WishlistPage',
      'OrderList': 'orders/OrderList',
      'OrderDetail': 'orders/OrderDetail',
      'CheckoutPage': 'orders/CheckoutPage',
      'OrderConfirmationPage': 'orders/OrderConfirmationPage',
      'SearchResult': 'search/SearchResult',
      'profilePage': 'profile/profilePage',
      'AddressPage': 'profile/AddressPage',
      'PaymentMethodPage': 'profile/PaymentMethodPage',
      'NotificationPage': 'profile/NotificationPage',
      'ReviewPage': 'products/ReviewPage',
      'SellerPage': 'products/SellerPage',
      'CouponPage': 'products/CouponPage',
      'Creditbalance': 'profile/Creditbalance',
      'FollowPage': 'profile/FollowPage',
      'PermissionPage': 'profile/PermissionPage',
      'BrowserhistoryPage': 'profile/BrowserhistoryPage',
    };
    const newPath = pageMap[page] || page;
    return `from '../features/${newPath}'`;
  }},
  // Auth
  { from: /from ['"]\.\.\/auth\/([^'"]+)['"]/g, to: (match, auth) => {
    return `from '../features/auth/${auth}'`;
  }},
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  importMappings.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      updateFile(filePath);
    }
  });
}

// Update all files in src directory
walkDir(path.join(__dirname, 'src'));
console.log('Import updates complete!');

