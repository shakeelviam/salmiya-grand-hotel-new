export type Permission = {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export type ResourcePermissions = {
  users: Permission
  rooms: Permission
  roomTypes: Permission
  guests: Permission
  reservations: Permission
  menuItems: Permission
  orders: Permission
  payments: Permission
  reports: Permission
}

const adminPermissions: Permission = {
  create: true,
  read: true,
  update: true,
  delete: true,
}

const managerPermissions: Permission = {
  create: true,
  read: true,
  update: true,
  delete: false,
}

const staffPermissions: Permission = {
  create: false,
  read: true,
  update: false,
  delete: false,
}

export const rolePermissions: Record<string, ResourcePermissions> = {
  ADMIN: {
    users: adminPermissions,
    rooms: adminPermissions,
    roomTypes: adminPermissions,
    guests: adminPermissions,
    reservations: adminPermissions,
    menuItems: adminPermissions,
    orders: adminPermissions,
    payments: adminPermissions,
    reports: adminPermissions,
  },
  MANAGER: {
    users: staffPermissions,
    rooms: managerPermissions,
    roomTypes: managerPermissions,
    guests: managerPermissions,
    reservations: managerPermissions,
    menuItems: managerPermissions,
    orders: managerPermissions,
    payments: managerPermissions,
    reports: managerPermissions,
  },
  STAFF: {
    users: staffPermissions,
    rooms: staffPermissions,
    roomTypes: staffPermissions,
    guests: {
      ...staffPermissions,
      create: true,
      update: true,
    },
    reservations: {
      ...staffPermissions,
      create: true,
      update: true,
    },
    menuItems: staffPermissions,
    orders: {
      ...staffPermissions,
      create: true,
      update: true,
    },
    payments: {
      ...staffPermissions,
      create: true,
    },
    reports: staffPermissions,
  },
}

export function hasPermission(
  role: string | undefined,
  resource: keyof ResourcePermissions,
  action: keyof Permission
): boolean {
  if (!role) return false
  return rolePermissions[role]?.[resource]?.[action] ?? false
}

export function getResourcePermissions(
  role: string | undefined,
  resource: keyof ResourcePermissions
): Permission {
  if (!role) {
    return {
      create: false,
      read: false,
      update: false,
      delete: false,
    }
  }
  return rolePermissions[role]?.[resource] ?? staffPermissions
}
