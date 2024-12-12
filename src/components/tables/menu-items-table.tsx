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
import { useToast } from "@/components/ui/use-toast"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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
  const router = useRouter()
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu-items")
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      setLoadingItem(id)
      const response = await fetch(`/api/menu-items/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update menu item status')
      }

      toast({
        title: "Success",
        description: `Menu item ${isActive ? 'disabled' : 'enabled'} successfully`,
      })

      fetchMenuItems()
    } catch (error) {
      console.error('Error updating menu item status:', error)
      toast({
        title: "Error",
        description: "Failed to update menu item status",
        variant: "destructive"
      })
    } finally {
      setLoadingItem(null)
    }
  }

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
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="text-right">
              {loadingItem === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <ActionButtons
                  onView={() => router.push(`/dashboard/menu-items/${item.id}`)}
                  onEdit={() => router.push(`/dashboard/menu-items/${item.id}/edit`)}
                  onToggle={() => handleToggleStatus(item.id, item.isActive)}
                  isActive={item.isActive}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
