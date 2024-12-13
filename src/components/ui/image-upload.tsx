"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove?: (value: string) => void
  value: string[]
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value = [],
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    onChange(result.info.secure_url)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {Array.isArray(value) && value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove?.(url)}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        disabled={disabled}
        variant="secondary"
        onClick={() => {}}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Upload an Image
      </Button>
    </div>
  )
}