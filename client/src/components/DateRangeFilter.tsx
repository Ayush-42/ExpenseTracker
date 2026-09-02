import { useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange, DateRangePreset } from '../utils/dateRange';
import {
  addMonths,
  clampToToday,
  formatRangeLabel,
  getMonthGrid,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  monthTitle,
  startOfDay,
  startOfMonth,
  today,
  weekdayLabels,
} from '../utils/dateRange';
import './DateRangeFilter.css';

interface DateRangeFilterProps {
  preset: DateRangePreset;
  range: DateRange;
  onChange: (preset: DateRangePreset, customRange?: DateRange) => void;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'custom', label: 'Custom' },
];

const DateRangeFilter = ({ preset, range, onChange }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(range.start));
  const [draftStart, setDraftStart] = useState<Date | null>(range.start);
  const [draftEnd, setDraftEnd] = useState<Date | null>(range.end);
  const [pickingEnd, setPickingEnd] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const latest = today();
  const currentMonthStart = startOfMonth(latest);

  useEffect(() => {
    if (!open) return;

    setVisibleMonth(startOfMonth(range.start));
    setDraftStart(startOfDay(range.start));
    setDraftEnd(startOfDay(range.end));
    setPickingEnd(false);

    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, range.end, range.start]);

  const cells = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);
  const canGoNext = startOfMonth(visibleMonth).getTime() < currentMonthStart.getTime();

  const handlePreset = (next: DateRangePreset) => {
    if (next === 'this-month') {
      setOpen(false);
      onChange('this-month');
      return;
    }
    if (next === 'last-month') {
      setOpen(false);
      onChange('last-month');
      return;
    }
    setOpen(true);
    onChange('custom', range);
  };

  const commitRange = (start: Date, end: Date) => {
    const safeStart = startOfDay(start);
    const safeEnd = clampToToday(end);
    const ordered = isAfterDay(safeStart, safeEnd)
      ? { start: startOfDay(safeEnd), end: safeEnd }
      : { start: safeStart, end: safeEnd };
    onChange('custom', ordered);
  };

  const handleDayClick = (day: Date) => {
    if (isAfterDay(day, latest)) return;

    if (!draftStart || (draftStart && draftEnd && !pickingEnd)) {
      setDraftStart(day);
      setDraftEnd(null);
      setPickingEnd(true);
      return;
    }

    setDraftEnd(day);
    setPickingEnd(false);
    commitRange(draftStart, day);
    setOpen(false);
  };

  const isInDraftRange = (day: Date) => {
    if (!draftStart) return false;
    const end = draftEnd ?? (pickingEnd ? draftStart : null);
    if (!end) return isSameDay(day, draftStart);
    const from = isBeforeDay(draftStart, end) ? draftStart : end;
    const to = isBeforeDay(draftStart, end) ? end : draftStart;
    return !isBeforeDay(day, from) && !isAfterDay(day, to);
  };

  const hoverHint = pickingEnd ? 'Select an end date' : 'Select a start date';

  return (
    <div className="date-range-filter" ref={rootRef}>
      <div className="date-range-filter-presets" role="tablist" aria-label="Date range">
        {PRESETS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={preset === option.id}
            className={`date-range-filter-preset ${preset === option.id ? 'active' : ''}`}
            onClick={() => handlePreset(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`date-range-filter-summary ${open ? 'open' : ''}`}
        onClick={() => {
          setOpen((value) => !value);
          if (preset !== 'custom') onChange('custom', range);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="date-range-filter-calendar-icon" aria-hidden="true">📅</span>
        <span>{formatRangeLabel(range)}</span>
      </button>

      {open && (
        <div className="date-range-filter-popover" role="dialog" aria-label="Choose a date range">
          <div className="date-range-filter-popover-head">
            <p>{hoverHint}. Future dates are disabled.</p>
          </div>

          <div className="date-range-filter-month-nav">
            <button
              type="button"
              className="date-range-filter-nav-btn"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <h3>{monthTitle(visibleMonth)}</h3>
            <button
              type="button"
              className="date-range-filter-nav-btn"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              disabled={!canGoNext}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="date-range-filter-weekdays">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="date-range-filter-grid">
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="date-range-filter-day empty" />;
              }

              const disabled = isAfterDay(day, latest);
              const selectedStart = draftStart ? isSameDay(day, draftStart) : false;
              const selectedEnd = draftEnd ? isSameDay(day, draftEnd) : false;
              const inRange = isInDraftRange(day);
              const isToday = isSameDay(day, latest);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  className={[
                    'date-range-filter-day',
                    disabled ? 'disabled' : '',
                    inRange ? 'in-range' : '',
                    selectedStart || selectedEnd ? 'selected' : '',
                    isToday ? 'today' : '',
                  ].join(' ')}
                  onClick={() => handleDayClick(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-range-filter-shortcuts">
            <button
              type="button"
              onClick={() => {
                onChange('this-month');
                setOpen(false);
              }}
            >
              Jump to this month
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('last-month');
                setOpen(false);
              }}
            >
              Jump to last month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
