#!/bin/bash
find src/components/ui -type f -name "*.tsx" -exec sed -i 's/@\/lib\/utils\/styles/@\/lib\/utils/g' {} +
