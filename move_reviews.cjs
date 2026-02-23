const fs = require('fs');
const filePath = '/Users/mac/Desktop/Saiisai/saiisaiweb/src/features/products/ProductDetail.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The marker for the start of the customer reviews tab
const reviewsTabStart = '          {/* Reviews Section */}';
// The end of the details tabs
const detailsTabsEnd = '        </DetailsTabs>';

const startIndex = content.indexOf(reviewsTabStart);
const endIndex = content.indexOf(detailsTabsEnd, startIndex);

if (startIndex !== -1 && endIndex > startIndex) {
    const reviewsContent = content.substring(startIndex, endIndex);

    // Remove reviews from its original position
    content = content.substring(0, startIndex) + content.substring(endIndex);

    // Find where to insert it: after </ModernProductGrid>
    const gridEndMarker = '      </ModernProductGrid>';
    const insertIndex = content.indexOf(gridEndMarker);
    if (insertIndex !== -1) {
        // Construct the new block wrapped in DetailsTabs
        const newBlock = `
      {/* Product Reviews Tabs */}
      <DetailsTabs>
${reviewsContent.replace(/^        /gm, '      ')}      </DetailsTabs>
`;

        content = content.substring(0, insertIndex + gridEndMarker.length) + newBlock + content.substring(insertIndex + gridEndMarker.length);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully moved Reviews.');
    } else {
        console.log('Could not find </ModernProductGrid>');
    }
} else {
    console.log('Could not find Reviews section.');
}
