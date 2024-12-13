#!/bin/bash

# Update all utils/currency and utils/date imports to just utils
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/lib\/utils\/\(currency\|date\)/@\/lib\/utils/g'
