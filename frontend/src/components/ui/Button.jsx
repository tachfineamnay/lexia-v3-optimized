import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const Button = React.forwardRef(({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-white text-brand-blue border-2 border-brand-blue hover:bg-brand-blue-50 shadow-sm hover:shadow-md",
        ghost: "text-slate-600 hover:text-brand-blue hover:bg-brand-blue-50",
        destructive: "bg-brand-red text-white hover:bg-brand-red-dark shadow-md hover:shadow-lg",
    }

    const sizes = {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-lg px-10 text-base font-semibold",
        icon: "h-10 w-10",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
})
Button.displayName = "Button"

export { Button }
