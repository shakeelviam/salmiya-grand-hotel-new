import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  number: string;
  floor: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
    adultCapacity: number;
    childCapacity: number;
  };
  status: string;
  isActive: boolean;
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return "success";
    case "occupied":
      return "destructive";
    case "maintenance":
      return "warning";
    case "cleaning":
      return "info";
    default:
      return "secondary";
  }
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleActive = async (roomId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update room status");
      }

      toast({
        title: "Success",
        description: `Room ${isActive ? 'deactivated' : 'activated'} successfully`,
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating room status:", error);
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Number</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Adult Capacity</TableHead>
            <TableHead>Child Capacity</TableHead>
            <TableHead>Price Per Night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.number}</TableCell>
              <TableCell>{room.floor}</TableCell>
              <TableCell>{room.roomType.name}</TableCell>
              <TableCell>{room.roomType.adultCapacity}</TableCell>
              <TableCell>{room.roomType.childCapacity}</TableCell>
              <TableCell>{formatCurrency(room.roomType.basePrice)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(room.status)}>
                  {room.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(room.id, room.isActive)}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
