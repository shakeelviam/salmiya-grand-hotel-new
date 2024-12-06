"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Price must be a valid number"
  ),
  category: z.string({
    required_error: "Please select a category",
  }),
  isActive: z.boolean().default(true),
  image: z.any().optional(),
})

type Category = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  isActive: boolean
}

type Props = {
  setOpen: (open: boolean) => void
  categories: Category[]
  item?: MenuItem
  onSuccess?: () => void
}

export function MenuItemForm({ setOpen, categories, item, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageUrl || null
  )
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price.toFixed(3) || "0.000",
      category: item?.categoryId || categories[0]?.id || "",
      isActive: item?.isActive ?? true,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue("image", e.target.files)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    form.setValue("image", undefined)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      // First upload image if exists
      let imageUrl = item?.imageUrl
      if (values.image && values.image[0]) {
        const formData = new FormData()
        formData.append("file", values.image[0])
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        })
        
        if (!uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          throw new Error(uploadResult.error || "Failed to upload image")
        }
        
        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.file_url
      }

      // Create or update menu item
      const url = item ? `/api/menu-items/${item.id}` : "/api/menu-items"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: values.name,
          description: values.description || null,
          price: parseFloat(values.price),
          category: values.category,
          imageUrl: imageUrl,
          isActive: values.isActive ?? true,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to manage menu items")
        }
        if (response.status === 400 && result.details) {
          const validationErrors = result.details.map((err: any) => err.message).join(", ")
          throw new Error(`Validation error: ${validationErrors}`)
        }
        throw new Error(result.error || `Failed to ${item ? "update" : "create"} menu item`)
      }

      toast({
        title: "Success",
        description: result.message || `${values.name} has been ${item ? "updated" : "created"} successfully.`,
      })

      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter item description" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.001" 
                    min="0" 
                    placeholder="0.000" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-[120px]"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      {...field}
                    />
                    {imagePreview && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : item ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
