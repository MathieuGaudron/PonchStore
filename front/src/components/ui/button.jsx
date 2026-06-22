import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#F5A623] text-[#111111] hover:bg-[#e0961a]',
        outline: 'border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-[#111111]',
        danger: 'bg-[#CC3333] text-white hover:bg-[#b32d2d]',
        ghost: 'text-[#222222] hover:bg-[#F2F2F2]',
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
