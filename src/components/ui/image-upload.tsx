'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image')) {
      return toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      })
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      })
    }
  }

  if (!isMounted) return null

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => document.getElementById('imageUpload')?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Upload Image
      </Button>
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled}
      />
      {value && (
        <div className="relative w-20 h-20">
          <Image
            src={value}
            alt="Upload"
            fill
            className="object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}