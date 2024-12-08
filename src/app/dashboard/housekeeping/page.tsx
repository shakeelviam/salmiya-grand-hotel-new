"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HousekeepingTable } from "@/components/tables/housekeeping-table"
import { CreateHousekeepingDialog } from "@/components/dialogs/create-housekeeping-dialog"

export default function HousekeepingPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Housekeeping</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <HousekeepingTable />
        <CreateHousekeepingDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  )
}
