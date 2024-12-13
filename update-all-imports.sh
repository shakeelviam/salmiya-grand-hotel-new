#!/bin/bash

# Update imports from lib/ to @/lib/
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\(lib\/\)/from "@\/\1/g'

# Update imports from components/ to @/components/
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\(components\/\)/from "@\/\1/g'

# Update imports from config/ to @/config/
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\(config\/\)/from "@\/\1/g'

# Update imports that use utils/styles to use utils directly
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/lib\/utils\/styles/@\/lib\/utils/g'

# Update any remaining non-prefixed imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\.\.\(\/lib\/\)/from "@\1/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\.\.\(\/components\/\)/from "@\1/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from ["'\'']\.\.\(\/config\/\)/from "@\1/g'
