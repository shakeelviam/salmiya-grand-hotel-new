import {
  Hotel,
  Loader2,
  User,
  Key,
  LogOut,
  Settings,
  Sun,
  Moon,
  Menu,
  Calendar,
  CreditCard,
  DoorOpen,
  Users,
  BarChart,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  hotel: Hotel,
  spinner: Loader2,
  user: User,
  key: Key,
  logout: LogOut,
  settings: Settings,
  sun: Sun,
  moon: Moon,
  menu: Menu,
  calendar: Calendar,
  creditCard: CreditCard,
  doorOpen: DoorOpen,
  users: Users,
  chart: BarChart,
  alert: AlertTriangle,
} as const
