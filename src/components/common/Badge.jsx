import { cn } from "../../lib/utils";

const variants = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  primary:
    "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  success:
    "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  planned:
    "bg-planned-100 text-planned-700 dark:bg-planned-900 dark:text-planned-300",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-sm",
};

function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
