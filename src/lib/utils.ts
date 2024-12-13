import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)
}

export function parseCurrency(value: string): number {
  // Remove currency symbol and any non-digit characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '')
  // Convert to number, default to 0 if invalid
  const number = parseFloat(cleanValue)
  return isNaN(number) ? 0 : number
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date)
}

export function calculateNights(checkIn: Date, checkOut: Date) {
  return differenceInDays(checkOut, checkIn)
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-yellow-500 bg-yellow-100"
    case "confirmed":
      return "text-green-500 bg-green-100"
    case "cancelled":
      return "text-red-500 bg-red-100"
    case "completed":
      return "text-blue-500 bg-blue-100"
    default:
      return "text-gray-500 bg-gray-100"
  }
}
