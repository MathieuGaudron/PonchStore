import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function Calendar({ className, classNames, showOutsideDays = true, locale = fr, ...props }) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn('w-fit bg-encre-clair p-4 text-white', className)}
      classNames={{
        months: 'relative flex flex-col gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex h-9 items-center justify-center',
        caption_label: 'font-display text-base capitalize',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between px-1',
        button_previous:
          'z-10 inline-flex h-7 w-7 items-center justify-center text-brume transition-colors hover:text-ambre',
        button_next:
          'z-10 inline-flex h-7 w-7 items-center justify-center text-brume transition-colors hover:text-ambre',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'surtitre flex h-9 w-9 items-center justify-center text-brume',
        week: 'flex w-full',
        day: 'h-9 w-9 p-0 text-center text-sm',
        day_button:
          'inline-flex h-9 w-9 items-center justify-center text-white transition-colors hover:bg-ardoise',
        selected:
          '[&>button]:bg-ambre [&>button]:font-semibold [&>button]:text-encre [&>button]:hover:bg-ambre',
        today: 'text-ambre',
        outside: 'text-ardoise-clair',
        disabled: 'pointer-events-none text-ardoise-clair opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}
