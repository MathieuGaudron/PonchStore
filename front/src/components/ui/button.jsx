import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/*
 * Aucun arrondi : la charte tient sur des rectangles nets et des filets. Le
 * poids est en 500/600 plutôt qu'en gras, la personnalité vient de la serif de
 * titrage, pas de l'épaisseur des boutons.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-encre text-white hover:bg-graphite',
        accent: 'bg-ambre text-encre hover:bg-ambre-fonce',
        outline: 'border border-encre text-encre hover:bg-encre hover:text-white',
        danger: 'bg-cinabre text-white hover:bg-cinabre-fonce',
        ghost: 'text-graphite hover:bg-papier-fonce',
        lien: 'text-graphite underline decoration-trait-fonce underline-offset-4 hover:decoration-encre',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-9 px-3.5 text-xs',
        icon: 'h-9 w-9',
        libre: '',
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
