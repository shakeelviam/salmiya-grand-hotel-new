"use client"

import { ReservationForm } from "@/components/forms/reservation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NewReservationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/reservations");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Reservation</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a new reservation</CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
