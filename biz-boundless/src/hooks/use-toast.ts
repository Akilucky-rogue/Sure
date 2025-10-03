import { toast } from 'sonner'

export function useToast() {
  return {
    toast: {
      error: (title: string, description?: string) => {
        toast.error(description || title)
      },
      success: (title: string, description?: string) => {
        toast.success(description || title)
      },
    },
  }
}