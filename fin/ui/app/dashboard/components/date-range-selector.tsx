"use client"

import * as React from "react"
import { Button } from "@/fin/ui/components/ui/button"
import { Calendar } from "@/fin/ui/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/fin/ui/components/ui/popover"
import { endOfMonth, format, startOfMonth, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangeSelectorProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

const PRESET_RANGES = [
  {
    label: "Últimos 7 dias",
    range: { from: subDays(new Date(), 6), to: new Date() },
  },
  {
    label: "Últimos 30 dias",
    range: { from: subDays(new Date(), 29), to: new Date() },
  },
  {
    label: "Últimos 90 dias",
    range: { from: subDays(new Date(), 89), to: new Date() },
  },
  {
    label: "Este mês",
    range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  },
]

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalRange, setInternalRange] = React.useState<DateRange>(dateRange)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    setInternalRange(dateRange)
    // Check if current range matches any preset
    const matchingPreset = PRESET_RANGES.find((preset) => {
      if (
        !dateRange.from ||
        !dateRange.to ||
        !preset.range.from ||
        !preset.range.to
      ) {
        return false
      }
      return (
        dateRange.from.getTime() === preset.range.from.getTime() &&
        dateRange.to.getTime() === preset.range.to.getTime()
      )
    })
    setSelectedPreset(matchingPreset?.label || null)
  }, [dateRange])

  const handlePresetSelect = (presetRange: DateRange, presetLabel: string) => {
    setInternalRange(presetRange)
    onDateRangeChange(presetRange)
    setSelectedPreset(presetLabel)
    setIsOpen(false)
  }

  const handleDayClick = (day: Date) => {
    if (!internalRange.from || (internalRange.from && internalRange.to)) {
      // First click or reset - set start date
      const newRange = { from: day, to: undefined }
      setInternalRange(newRange)
      onDateRangeChange(newRange)
      setSelectedPreset(null) // Clear preset selection when manually selecting dates
    } else {
      // Second click - set end date and close
      const newRange = { from: internalRange.from, to: day }
      setInternalRange(newRange)
      onDateRangeChange(newRange)
      setSelectedPreset(null) // Clear preset selection when manually selecting dates
      setIsOpen(false)
    }
  }

  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Selecionar período"
    }

    if (dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
    }

    return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-8 w-[200px] justify-start text-left text-xs font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3">
            {/* Preset buttons */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    selectedPreset === preset.label ? "default" : "outline"
                  }
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handlePresetSelect(preset.range, preset.label)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={internalRange}
              onDayClick={handleDayClick}
              numberOfMonths={2}
              locale={ptBR}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
