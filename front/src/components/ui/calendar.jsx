import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function Calendar({ className, classNames, showOutsideDays = true, locale = fr, ...props }) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn('w-fit rounded-md bg-[#1C1C1C] p-3 text-white', className)}
      classNames={{
        months: 'relative flex flex-col gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex h-9 items-center justify-center',
        caption_label: 'text-sm font-bold',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between px-1',
        button_previous:
          'z-10 inline-flex h-7 w-7 items-center justify-center rounded text-white hover:bg-[#333]',
        button_next:
          'z-10 inline-flex h-7 w-7 items-center justify-center rounded text-white hover:bg-[#333]',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'flex h-9 w-9 items-center justify-center text-xs font-normal text-[#888888]',
        week: 'mt-1 flex w-full',
        day: 'h-9 w-9 p-0 text-center text-sm',
        day_button:
          'inline-flex h-9 w-9 items-center justify-center rounded text-white hover:bg-[#333]',
        selected:
          '[&>button]:bg-[#F5A623] [&>button]:font-bold [&>button]:text-[#111111] [&>button]:hover:bg-[#F5A623]',
        today: 'font-bold text-[#F5A623]',
        outside: 'text-[#555]',
        disabled: 'pointer-events-none text-[#444] opacity-40',
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
