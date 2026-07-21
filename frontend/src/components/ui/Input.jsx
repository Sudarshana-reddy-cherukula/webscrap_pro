import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-all duration-200 outline-none",
        "hover:border-slate-500",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
        "disabled:bg-slate-800 disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30",
        "md:text-sm",
        className
      )}
      {...props} />
  );
}

export { Input }
