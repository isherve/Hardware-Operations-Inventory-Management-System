import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "destructive" | "secondary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-orange-100 text-orange-800",
        variant === "destructive" && "bg-red-100 text-red-800",
        variant === "secondary" && "bg-slate-100 text-slate-800",
        className
      )}
      {...props}
    />
  );
}
