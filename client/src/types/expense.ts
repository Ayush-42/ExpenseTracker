export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#FFA07A' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#9B59B6' },
  { id: 'health', name: 'Health & Fitness', icon: '💊', color: '#E74C3C' },
  { id: 'education', name: 'Education', icon: '📚', color: '#3498DB' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#1ABC9C' },
  { id: 'other', name: 'Other', icon: '📦', color: '#95A5A6' },
];

