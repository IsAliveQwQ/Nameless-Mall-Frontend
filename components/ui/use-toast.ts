import { toast } from "sonner"

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

export const useToast = () => {
    return {
        toast: ({ title, description, variant = "default" }: ToastProps) => {
            // 這裡簡單適配 sonner 的 API
            if (variant === "destructive") {
                toast.error(title, { description })
            } else {
                toast.message(title, { description })
            }
        },
        dismiss: (toastId?: string | number) => toast.dismiss(toastId),
    }
}
