#!/bin/bash

# Fix double "use client"" directive
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Check if file starts with "use client"" and fix it
  if grep -q '^"use client""' "$file"; then
    sed -i '1s/"use client""/"use client"/' "$file"
  fi
done

# Fix other quote issues
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Fix single quotes in imports
  sed -i 's/from '\''/@/from "@/g' "$file"
  sed -i 's/from '\''next/from "next/g' "$file"
  sed -i 's/from '\''react'\''/from "react"/g' "$file"
  sed -i 's/from '\''next-auth/from "next-auth/g' "$file"
  
  # Fix unterminated quotes in imports
  sed -i 's/from "@\/[^"]*'\''/&"/g' "$file"
  
  # Standardize quotes in JSX attributes
  sed -i 's/className='\''/className="/g' "$file"
  sed -i 's/type='\''/type="/g' "$file"
  sed -i 's/placeholder='\''/placeholder="/g' "$file"
  
  # Fix any remaining unterminated quotes
  sed -i 's/"[^"]*'\''/&"/g' "$file"
done
