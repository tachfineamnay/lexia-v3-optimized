import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-brand-red focus-visible:ring-brand-red",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-brand-red">{error}</p>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
