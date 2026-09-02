import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { expenseAPI } from '../services/api';
import type { Expense, ExpenseFormData } from '../types/expense';

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addExpense: (data: ExpenseFormData) => Promise<string>;
  updateExpense: (id: string, data: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};

export const ExpensesProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid ?? null;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await expenseAPI.getAll(userId);
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to load expenses');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await expenseAPI.getAll(userId);
        if (!isMounted) return;
        setExpenses(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching expenses:', err);
        if (isMounted) setError(err.message || 'Failed to load expenses');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    const handleFocus = () => {
      if (isMounted) load();
    };

    const interval = setInterval(() => {
      if (document.hasFocus() && isMounted) load();
    }, 30000);

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const addExpense = useCallback(
    async (data: ExpenseFormData) => {
      if (!userId) throw new Error('User not authenticated');
      const created = await expenseAPI.create(userId, data);
      setExpenses((prev) => [created, ...prev]);
      setError(null);
      return created.id;
    },
    [userId]
  );

  const updateExpense = useCallback(
    async (id: string, data: ExpenseFormData) => {
      if (!userId) throw new Error('User not authenticated');
      const updated = await expenseAPI.update(userId, id, data);
      setExpenses((prev) => prev.map((exp) => (exp.id === id ? updated : exp)));
      setError(null);
    },
    [userId]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      await expenseAPI.delete(userId, id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    },
    [userId]
  );

  const value = useMemo(
    () => ({ expenses, loading, error, refresh, addExpense, updateExpense, deleteExpense }),
    [expenses, loading, error, refresh, addExpense, updateExpense, deleteExpense]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
};
