"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus } from "lucide-react"
import { MaintenanceTable } from "@/components/tables/maintenance-table"
import { CreateMaintenanceDialog } from "@/components/dialogs/create-maintenance-dialog"

export default function MaintenancePage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTable />
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateMaintenanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  )
}
