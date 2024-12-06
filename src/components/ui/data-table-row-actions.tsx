import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { MenuCategoryForm } from "@/components/forms/menu-category-form"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DialogTrigger asChild>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              try {
                const response = await fetch(`/api/menu-categories/${row.original.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    isActive: !row.original.isActive,
                  }),
                })
                if (!response.ok) throw new Error("Failed to update status")
                // Refresh the page to show updated data
                window.location.reload()
              } catch (error) {
                console.error("Error updating status:", error)
              }
            }}
          >
            {row.original.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category
            </DialogDescription>
          </DialogHeader>
          <MenuCategoryForm setOpen={setOpen} category={row.original} />
        </DialogContent>
      </Dialog>
    </>
  )
}
