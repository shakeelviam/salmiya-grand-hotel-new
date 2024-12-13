"use client"

import { PaymentStatusBadge } from "@/components/reservations/payment-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function TestPaymentsPage() {
  // Test data
  const paymentStatuses = [
    {
      status: 'PENDING',
      amount: 150.00,
      dueDate: new Date('2024-02-15'),
      paidAmount: 0,
    },
    {
      status: 'PARTIALLY_PAID',
      amount: 300.00,
      dueDate: new Date('2024-02-20'),
      paidAmount: 100.00,
    },
    {
      status: 'PAID',
      amount: 250.00,
      dueDate: new Date('2024-02-10'),
      paidAmount: 250.00,
    },
    {
      status: 'OVERDUE',
      amount: 180.00,
      dueDate: new Date('2024-01-15'),
      paidAmount: 0,
    },
    {
      status: 'REFUNDED',
      amount: 200.00,
      dueDate: new Date('2024-01-20'),
      paidAmount: 200.00,
    },
    {
      status: 'CANCELLED',
      amount: 120.00,
      dueDate: new Date('2024-01-25'),
      paidAmount: 0,
    }
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Payment Components Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {paymentStatuses.map((payment, index) => (
                <div key={index} className="flex items-center gap-4">
                  <PaymentStatusBadge
                    status={payment.status as any}
                    amount={payment.amount}
                    dueDate={payment.dueDate}
                    paidAmount={payment.paidAmount}
                    currency="KWD"
                  />
                  <span className="text-sm text-muted-foreground">
                    Hover to see details
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simple Status Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <PaymentStatusBadge
                status="PENDING"
                showDetails={false}
              />
              <PaymentStatusBadge
                status="PAID"
                showDetails={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
