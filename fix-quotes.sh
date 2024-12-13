#!/bin/bash

# Fix single quotes in imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/from '@/from \"@/g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/'$/'\"/"

# Fix 'use client' directive
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/'use client'/\"use client\"/"

# Fix other common imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/from 'next\//from \"next\//g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/from 'react'/from \"react\"/g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/from 'next-auth/from \"next-auth/g"
