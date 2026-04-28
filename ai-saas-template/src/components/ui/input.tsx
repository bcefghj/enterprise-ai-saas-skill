"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isFloating = focused || hasValue;

    if (!label) {
      return (
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <input
          type={type}
          id={inputId}
          className={cn(
            "peer flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 pt-4 pb-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
            className
          )}
          ref={ref}
          placeholder={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 transition-all duration-200",
            isFloating
              ? "top-1 text-xs text-blue-500 dark:text-blue-400"
              : "top-3.5 text-sm text-gray-400 dark:text-gray-500"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
