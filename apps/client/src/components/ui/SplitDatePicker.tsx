import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';

interface SplitDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  className?: string;
}

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function SplitDatePicker({
  value,
  onChange,
  className,
}: SplitDatePickerProps) {
  const [day, setDay] = React.useState<string>('');
  const [month, setMonth] = React.useState<string>('');
  const [year, setYear] = React.useState<string>('');

  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(date.getDate().toString());
        setMonth((date.getMonth() + 1).toString());
        setYear(date.getFullYear().toString());
      }
    }
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m, 0).getDate();
  };

  const daysInMonth = React.useMemo(() => {
    if (!month) return 31;
    const m = parseInt(month);
    const y = year ? parseInt(year) : 2024;
    return new Date(y, m, 0).getDate();
  }, [month, year]);

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString(),
  );

  const handleDayChange = (val: string) => {
    setDay(val);
    notifyChange(val, month, year);
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    let newDay = day;
    if (year) {
      const maxDays = getDaysInMonth(parseInt(val), parseInt(year));
      if (day && parseInt(day) > maxDays) {
        newDay = maxDays.toString();
        setDay(newDay);
      }
    }
    notifyChange(newDay, val, year);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    let newDay = day;
    if (month === '2') {
      const maxDays = getDaysInMonth(2, parseInt(val));
      if (day && parseInt(day) > maxDays) {
        newDay = maxDays.toString();
        setDay(newDay);
      }
    }
    notifyChange(day, month, val);
  };

  const notifyChange = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const yearStr = date.getFullYear();
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = date.getDate().toString().padStart(2, '0');
      onChange(`${yearStr}-${monthStr}-${dayStr}`);
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={day} onValueChange={handleDayChange}>
        <SelectTrigger className="w-[80px]" data-testid="day-select">
          <SelectValue placeholder="Día" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="flex-1" data-testid="month-select">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={(i + 1).toString()}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px]" data-testid="year-select">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
