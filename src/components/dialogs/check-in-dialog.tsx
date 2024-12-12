"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Room {
  id: string;
  number: string;
  floor: string;
  status: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
  };
}

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  roomTypeId: string;
  onSuccess: () => void;
}

export function CheckInDialog({
  open,
  onClose,
  reservationId,
  roomTypeId,
  onSuccess,
}: CheckInDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableRooms();
    } else {
      setSelectedRoomId("");
      setRooms([]);
    }
  }, [open]);

  const fetchAvailableRooms = async () => {
    try {
      setFetchingRooms(true);
      const response = await fetch(`/api/rooms/available?roomTypeId=${roomTypeId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch available rooms");
      }

      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch available rooms",
        variant: "destructive",
      });
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedRoomId) {
      toast({
        title: "Error",
        description: "Please select a room",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/${reservationId}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to check in");
      }

      toast({
        title: "Success",
        description: data.message || "Check-in successful",
      });

      // Close dialog and refresh data
      onSuccess();
      onClose();
      
      // Force a page refresh to update all states
      window.location.reload();
    } catch (error) {
      console.error("Error during check-in:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Room</label>
            <Select
              disabled={loading || fetchingRooms}
              value={selectedRoomId}
              onValueChange={setSelectedRoomId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {fetchingRooms ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading rooms...
                  </SelectItem>
                ) : rooms.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No rooms available
                  </SelectItem>
                ) : (
                  rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.number} - {room.roomType.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={loading || !selectedRoomId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
