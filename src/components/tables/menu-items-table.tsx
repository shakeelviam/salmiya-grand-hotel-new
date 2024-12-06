import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatKWD } from "@/lib/currency"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  isActive: boolean
}

export function MenuItemsTable() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu-items")
        const data = await response.json()
        setMenuItems(data)
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menuItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{formatKWD(item.price)}</TableCell>
            <TableCell>
              <Badge variant="default">
                {item.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.isActive ? "success" : "destructive"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
