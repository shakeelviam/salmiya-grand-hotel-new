#!/bin/bash
cd "$(dirname "$0")/.."
npx ts-node scripts/check-no-shows.ts
