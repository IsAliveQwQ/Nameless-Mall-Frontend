import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => {
    return (
        <div className={cn("inline-flex h-8 w-8 min-w-8", className)} {...props}>
            <Image
                src="/logo.png"
                alt="Nameless Mall Logo"
                width={32}
                height={32}
                className="object-contain dark:invert"
                priority
            />
        </div>
    )
}

export const BrandName = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span className={cn("font-serif font-bold tracking-tight", className)} {...props}>
            Nameless Mall
        </span>
    )
}
