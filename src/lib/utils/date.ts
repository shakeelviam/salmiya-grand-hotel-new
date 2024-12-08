import { format } from "date-fns"

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return format(date, "PPP")
}
