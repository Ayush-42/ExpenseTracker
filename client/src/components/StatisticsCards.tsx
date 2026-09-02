import { useMemo } from 'react';
import type { Expense } from '../types/expense';
import type { DateRange, DateRangePreset } from '../utils/dateRange';
import { formatCurrency } from '../utils/format';
import { inclusiveDayCount, isAfterDay, isBeforeDay, isSameDay, today } from '../utils/dateRange';
import './StatisticsCards.css';

interface StatisticsCardsProps {
  expenses: Expense[];
  range: DateRange;
  preset: DateRangePreset;
}

const StatisticsCards = ({ expenses, range, preset }: StatisticsCardsProps) => {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const days = Math.max(inclusiveDayCount(range), 1);
    const average = expenses.length > 0 ? total / expenses.length : 0;
    const dailyAverage = total / days;

    const todayTotal = expenses
      .filter((exp) => isSameDay(exp.date, new Date()))
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { total, average, dailyAverage, todayTotal, count: expenses.length, days };
  }, [expenses, range]);

  const periodTitle =
    preset === 'this-month' ? 'This Month' : preset === 'last-month' ? 'Last Month' : 'In Range';

  const includeToday = !isAfterDay(today(), range.end) && !isBeforeDay(today(), range.start);

  const cards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.total),
      icon: '💰',
      color: '#E53E3E',
      subtitle: periodTitle,
    },
    {
      title: includeToday ? 'Today' : 'Daily Average',
      value: formatCurrency(includeToday ? stats.todayTotal : stats.dailyAverage),
      icon: '📊',
      color: '#38A169',
      subtitle: includeToday ? null : `${stats.days} ${stats.days === 1 ? 'day' : 'days'}`,
    },
    {
      title: includeToday ? 'Daily Average' : 'Days',
      value: includeToday ? formatCurrency(stats.dailyAverage) : String(stats.days),
      icon: '📅',
      color: '#3182CE',
      subtitle: includeToday ? `${stats.days} ${stats.days === 1 ? 'day' : 'days'}` : periodTitle,
    },
    {
      title: 'Average',
      value: formatCurrency(stats.average),
      icon: '📈',
      color: '#D69E2E',
      subtitle: `${stats.count} ${stats.count === 1 ? 'expense' : 'expenses'}`,
    },
  ];

  return (
    <div className="statistics-cards">
      {cards.map((card) => (
        <div key={card.title} className="statistics-card">
          <div className="statistics-card-icon" style={{ backgroundColor: `${card.color}20` }}>
            <span style={{ color: card.color }}>{card.icon}</span>
          </div>
          <div className="statistics-card-content">
            <h3 className="statistics-card-title">{card.title}</h3>
            <p className="statistics-card-value">{card.value}</p>
            {card.subtitle && <p className="statistics-card-subtitle">{card.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
