"use client"

import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Ban,
  RefreshCcw
} from "lucide-react"

export type PaymentStatus = 
  | 'PENDING'"
  | 'PARTIALLY_PAID'"
  | 'PAID'"
  | 'OVERDUE'"
  | 'REFUNDED'"
  | 'CANCELLED'"

interface PaymentStatusConfig {
  label: string
  icon: JSX.Element
  color: string
  description: string
}

const statusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Payment has not been received yet'"
  },
  PARTIALLY_PAID: {
    label: 'Partially Paid',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Deposit or partial payment received'"
  },
  PAID: {
    label: 'Paid',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Full payment has been completed'"
  },
  OVERDUE: {
    label: 'Overdue',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Payment is past the due date'"
  },
  REFUNDED: {
    label: 'Refunded',
    icon: <RefreshCcw className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Payment has been refunded'"
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <Ban className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Payment has been cancelled'"
  }
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  amount?: number
  dueDate?: Date
  paidAmount?: number
  currency?: string
  showDetails?: boolean
}

export function PaymentStatusBadge({
  status,
  amount = 0,
  dueDate,
  paidAmount = 0,
  currency = 'KWD',
  showDetails = true
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status]
  const remainingAmount = amount - paidAmount
  const isOverdue = dueDate && new Date() > new Date(dueDate)
  const displayStatus = isOverdue && status === 'PENDING' ? 'OVERDUE' : status

  const renderPaymentDetails = () => (
    <div className="space-y-1.5 text-sm">
      <div className="font-semibold">Payment Details</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-muted-foreground">Total Amount:</span>
        <span className="font-medium">{formatCurrency(amount, currency)}</span>
        
        {paidAmount > 0 && (
          <>
            <span className="text-muted-foreground">Paid Amount:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(paidAmount, currency)}
            </span>
            
            <span className="text-muted-foreground">Remaining:</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(remainingAmount, currency)}
            </span>
          </>
        )}
        
        {dueDate && (
          <>
            <span className="text-muted-foreground">Due Date:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {new Date(dueDate).toLocaleDateString()}
            </span>
          </>
        )}
      </div>
    </div>
  )

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline"
              className={`${config.color} flex items-center gap-1.5`}
            >
              {config.icon}
              <span>{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge 
          variant="outline"
          className={`${config.color} flex items-center gap-1.5 cursor-help`}
        >
          {config.icon}
          <span>{config.label}</span>
          {amount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-white/20">
              {formatCurrency(amount, currency)}
            </span>
          )}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        {renderPaymentDetails()}
      </HoverCardContent>
    </HoverCard>
  )
}
