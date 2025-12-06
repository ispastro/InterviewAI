'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'default' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = cn(
            'inline-flex items-center justify-center font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'font-[Lexend]'
        );

        const variants = {
            default: cn(
                'bg-[#2563EB] text-white',
                'hover:bg-[#1D4ED8]',
                'focus-visible:ring-[#2563EB]',
                'shadow-sm'
            ),
            secondary: cn(
                'bg-[#F1F5F9] text-[#0F172A]',
                'hover:bg-[#E2E8F0]',
                'focus-visible:ring-[#94A3B8]',
                'border border-[#E5E7EB]'
            ),
            destructive: cn(
                'bg-[#EF4444] text-white',
                'hover:bg-[#DC2626]',
                'focus-visible:ring-[#EF4444]',
                'shadow-sm'
            ),
            outline: cn(
                'bg-transparent text-[#0F172A]',
                'border border-[#E5E7EB]',
                'hover:bg-[#F8FAFC]',
                'focus-visible:ring-[#94A3B8]'
            ),
            ghost: cn(
                'bg-transparent text-[#475569]',
                'hover:bg-[#F1F5F9] hover:text-[#0F172A]',
                'focus-visible:ring-[#94A3B8]'
            ),
            link: cn(
                'bg-transparent text-[#2563EB] underline-offset-4',
                'hover:underline',
                'focus-visible:ring-[#2563EB]'
            ),
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm rounded-[12px]',
            default: 'h-10 px-4 py-2 text-sm rounded-[12px]',
            lg: 'h-11 px-8 text-base rounded-[12px]',
            icon: 'h-10 w-10 rounded-[12px]',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
