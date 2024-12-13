"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useQuery } from "@tanstack/react-query"

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  status: string
  createdBy: {
    name: string
  }
}

export function ExpensesTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { toast } = useToast()

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await fetch("/api/expenses")
      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }
      return response.json()
    },
  })

  const filteredExpenses = expenses?.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleView = (id: string) => {
    // Implement view logic
  }

  const handleEdit = (id: string) => {
    // Implement edit logic
  }

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}/toggle`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle expense status")
      }

      toast({
        title: "Success",
        description: "Expense status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value)}
        >
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="capitalize">{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{expense.createdBy.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={expense.status === "approved" ? "success" : "secondary"}
                  >
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ActionButtons
                    onView={() => handleView(expense.id)}
                    onEdit={() => handleEdit(expense.id)}
                    onToggle={() => handleToggle(expense.id)}
                    toggleTitle={
                      expense.status === "approved"
                        ? "Mark as Pending"
                        : "Approve Expense"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
