import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  Settings,
  UserCircle,
  Utensils,
  Bell,
  ClipboardList,
  Building2,
  BarChart3,
  MessageSquare,
  Wallet,
  HelpCircle,
  Coffee,
  UtensilsCrossed,
  BedSingle,
  Key,
  Shield,
  List,
} from "lucide-react"

export const navItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview of hotel operations",
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "Detailed performance metrics",
      },
    ],
  },
  {
    title: "Hotel Management",
    items: [
      {
        title: "Rooms",
        href: "/dashboard/rooms",
        icon: BedDouble,
        description: "Room management and status",
      },
      {
        title: "Room Types",
        href: "/dashboard/room-types",
        icon: BedSingle,
        description: "Manage room categories and types",
      },
      {
        title: "Reservations",
        href: "/dashboard/reservations",
        icon: CalendarDays,
        description: "Booking management",
      },
      {
        title: "Guests",
        href: "/dashboard/guests",
        icon: Users,
        description: "Guest information and history",
      },
    ],
  },
  {
    title: "Food & Beverage",
    items: [
      {
        title: "Restaurant",
        href: "/dashboard/restaurant",
        icon: Utensils,
        description: "Food and beverage management",
      },
      {
        title: "Menu Items",
        href: "/dashboard/menu-items",
        icon: Utensils,
        description: "Manage room service menu items",
      },
      {
        title: "Menu Categories",
        href: "/dashboard/menu-categories",
        icon: List,
        description: "Manage menu categories",
      },
      {
        title: "Kitchen Orders",
        href: "/dashboard/kitchen",
        icon: UtensilsCrossed,
        description: "Manage room service orders",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Users",
        href: "/dashboard/users",
        icon: UserCircle,
        description: "System users and access",
      },
      {
        title: "Roles",
        href: "/dashboard/roles",
        icon: Shield,
        description: "Role management",
      },
      {
        title: "Role Permissions",
        href: "/dashboard/role-permissions",
        icon: Key,
        description: "Role-based permission management",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: Building2,
        description: "Property maintenance tasks",
      },
      {
        title: "Housekeeping",
        href: "/dashboard/housekeeping",
        icon: ClipboardList,
        description: "Room cleaning status",
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        description: "System alerts and messages",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Billing",
        href: "/dashboard/billing",
        icon: Receipt,
        description: "Invoices and payments",
      },
      {
        title: "Expenses",
        href: "/dashboard/expenses",
        icon: Wallet,
        description: "Cost management",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
        description: "Internal communications",
      },
      {
        title: "Help Center",
        href: "/dashboard/help",
        icon: HelpCircle,
        description: "Documentation and guides",
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "System configuration",
      },
    ],
  },
]
