'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Icons } from '@/components/ui/icons'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }, [error, toast])

  function getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      Configuration: 'There is a problem with the server configuration.',
      AccessDenied: 'Access denied. You do not have permission to access this resource.',
      Verification: 'The verification failed or the token has expired.',
      Default: 'An authentication error occurred. Please try again.',
    }

    return errorMessages[error] || errorMessages.Default
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem authenticating your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-20 w-full items-center justify-center text-destructive">
            <Icons.alert className="h-10 w-10" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {getErrorMessage(error || 'Default')}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
