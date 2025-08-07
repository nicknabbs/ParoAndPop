#!/bin/bash

echo "Updating company name to Paro & Pop..."

# Update all instances of "Artisan Earrings Co." to "Paro & Pop"
find . -name "*.html" -exec sed -i '' 's/Artisan Earrings Co\./Paro \& Pop/g' {} +

# Remove 30-day returns mentions
echo "Removing 30-day return policy mentions..."

# Remove "30-Day Returns" from trust badges
find . -name "*.html" -exec sed -i '' 's/<span>✅ 30-Day Returns<\/span>//g' {} +

# Remove from product features lists
find . -name "*.html" -exec sed -i '' '/<li>30-day return policy<\/li>/d' {} +
find . -name "*.html" -exec sed -i '' '/<li>30-day satisfaction guarantee<\/li>/d' {} +
find . -name "*.html" -exec sed -i '' '/<li>30-Day Returns<\/li>/d' {} +

# Update any remaining return policy text
find . -name "*.html" -exec sed -i '' 's/We offer hassle-free 30-day returns\. If you'\''re not completely satisfied, return for a full refund\./All sales are final. Please review your order carefully before purchasing./g' {} +
find . -name "*.html" -exec sed -i '' 's/hassle-free 30-day returns/all sales are final/g' {} +
find . -name "*.html" -exec sed -i '' 's/30-day money-back guarantee/satisfaction guaranteed/g' {} +

# Update email addresses
find . -name "*.html" -exec sed -i '' 's/orders@artisanearrings\.com/orders@paroandpop.com/g' {} +
find . -name "*.html" -exec sed -i '' 's/support@artisanearrings\.com/support@paroandpop.com/g' {} +
find . -name "*.html" -exec sed -i '' 's/hello@artisanearrings\.com/hello@paroandpop.com/g' {} +

# Update copyright
find . -name "*.html" -exec sed -i '' 's/© 2025 Artisan Earrings Co\./© 2025 Paro \& Pop/g' {} +

echo "Branding update complete!"

# Count remaining instances to verify
echo "Checking for remaining old company names..."
OLD_COUNT=$(grep -r "Artisan Earrings Co" *.html 2>/dev/null | wc -l)
echo "Remaining 'Artisan Earrings Co': $OLD_COUNT"

echo "Checking for remaining return mentions..."
RETURN_COUNT=$(grep -r "30-Day Returns\|30-day return\|30-day satisfaction" *.html 2>/dev/null | wc -l)
echo "Remaining return mentions: $RETURN_COUNT"