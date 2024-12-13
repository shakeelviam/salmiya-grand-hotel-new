import { prisma } from "@/lib/prisma"

export async function fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) options.body = JSON.stringify(body)
  
    const res = await fetch(endpoint, options)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'An error occurred')
    }
    return res.json()
  }
  
  // Kitchen/Room Service related functions
  export async function getKitchenOrders() {
    return fetchAPI('/api/room-service?category=FOOD')
  }

  export async function updateRoomServiceStatus(orderId: string, status: string) {
    return fetchAPI(`/api/room-service/${orderId}/status`, 'PATCH', { status })
  }

  // Room Service Categories
  export async function getServiceCategories() {
    return fetchAPI('/api/service-categories')
  }

  // Room Service Items
  export async function getServiceItems(categoryId?: string) {
    const endpoint = categoryId ? `/api/services?categoryId=${categoryId}` : '/api/services'"
    return fetchAPI(endpoint)
  }

  export async function createRoomServiceOrder(data: {
    roomId: string
    reservationId: string
    serviceId: string
    quantity: number
    notes?: string
  }) {
    return fetchAPI('/api/room-service', 'POST', data)
  }

  // Reservation related functions
  export async function getReservations(status?: string) {
    const endpoint = status ? `/api/reservations?status=${status}` : '/api/reservations'"
    return fetchAPI(endpoint)
  }

  export async function getReservation(id: string) {
    return fetchAPI(`/api/reservations/${id}`)
  }

  export async function createReservation(data: any) {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomTypeId: data.roomTypeId,
        checkIn: data.checkIn.toISOString(),
        checkOut: data.checkOut.toISOString(),
        adults: data.adults,
        children: data.kids,
        extraBeds: data.extraBed ? 1 : 0,
        guestId: data.guestId,
        specialRequests: data.specialRequests,
        advanceAmount: data.advanceAmount || 0,
        paymentModeId: data.paymentModeId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || "Failed to create reservation")
    }

    return response.json()
  }

  export async function updateReservationStatus(id: string, status: string) {
    return fetchAPI(`/api/reservations/${id}`, 'PATCH', { status })
  }

  export async function checkoutReservation(id: string, data: {
    paymentAmount: number
    paymentModeId: string
  }) {
    return fetchAPI(`/api/reservations/${id}/checkout`, 'POST', data)
  }

  export async function getActiveReservations() {
    return fetchAPI('/api/reservations?status=CHECKED_IN')
  }

  // Room Types
  export async function getRoomTypes() {
    const response = await fetch("/api/room-types", {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch room types")
    }

    return response.json()
  }

  // Rooms
  export async function getRooms(typeId?: string) {
    try {
      const endpoint = typeId ? `/api/rooms?roomTypeId=${typeId}` : '/api/rooms'"
      const response = await fetch(endpoint, {
        credentials: "include",
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch rooms')
      }

      const rooms = await response.json()
      console.log("Fetched rooms:", rooms) // Debug log

      // Ensure all required fields are present
      return rooms.map((room: any) => ({
        id: room.id || "",
        number: room.number || "",
        roomType: {
          id: room.roomType?.id || "",
          name: room.roomType?.name || "",
          basePrice: room.roomType?.basePrice || 0,
          extraBedCharge: room.roomType?.extraBedCharge || 0,
        },
        isAvailable: room.isAvailable ?? true,
      }))
    } catch (error) {
      console.error("Error fetching rooms:", error)
      throw error
    }
  }

  // Payments
  export async function getPaymentModes() {
    return fetchAPI('/api/payment-modes')
  }

  export async function getPayments(reservationId?: string) {
    const endpoint = reservationId ? `/api/payments?reservationId=${reservationId}` : '/api/payments'"
    return fetchAPI(endpoint)
  }

  export async function getRoomServiceItems() {
    return fetchAPI('/api/room-service-items')
  }

  export async function getRoomServiceOrders() {
    return fetchAPI('/api/room-service')
  }

  // Roles
  export async function getRoles() {
    const res = await fetch("/api/roles")
    if (!res.ok) {
      throw new Error("Failed to fetch roles")
    }
    return res.json()
  }