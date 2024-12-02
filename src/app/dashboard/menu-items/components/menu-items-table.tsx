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
import { getERPNextDocs } from "@/lib/erpnext"

interface MenuItem {
  name: string
  item_name: string
  description: string
  standard_rate: string
  category: string
  is_active: boolean
  image?: string
}

export function MenuItemsTable() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await getERPNextDocs("Item", {
          filters: [["item_group", "=", "Room Service"]],
          fields: ["name", "item_name", "description", "standard_rate", "category", "is_active", "image"],
        })
        setMenuItems(response)
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
          <TableRow key={item.name}>
            <TableCell className="font-medium">{item.item_name}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{formatKWD(parseFloat(item.standard_rate))}</TableCell>
            <TableCell>
              <Badge variant={item.category === "Food" ? "default" : "secondary"}>
                {item.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.is_active ? "success" : "destructive"}>
                {item.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
