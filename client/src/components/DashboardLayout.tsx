import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExpensesProvider, useExpenses } from '../context/ExpensesContext';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import Sidebar from './Sidebar';
import ExpenseForm from './ExpenseForm';
import { useGreeting } from '../hooks/useGreeting';
import type { Expense, ExpenseFormData } from '../types/expense';
import './DashboardLayout.css';

interface ExpenseDialogContextType {
  openAddExpense: () => void;
  openEditExpense: (expense: Expense) => void;
}

const ExpenseDialogContext = createContext<ExpenseDialogContextType | undefined>(undefined);

export const useExpenseDialog = () => {
  const context = useContext(ExpenseDialogContext);
  if (context === undefined) {
    throw new Error('useExpenseDialog must be used within the dashboard layout');
  }
  return context;
};

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/expenses': 'Expenses',
  '/dashboard/categories': 'Categories',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
};

const DashboardChrome = () => {
  const { currentUser } = useAuth();
  const { displayName } = useProfile();
  const { addExpense, updateExpense, error } = useExpenses();
  const location = useLocation();

  const greetingName = displayName || currentUser?.email?.split('@')[0] || 'User';
  const greeting = useGreeting(greetingName);

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dialog = useMemo<ExpenseDialogContextType>(
    () => ({
      openAddExpense: () => {
        setEditingExpense(null);
        setIsFormOpen(true);
      },
      openEditExpense: (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
      },
    }),
    []
  );

  const handleFormSubmit = async (data: ExpenseFormData) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await addExpense(data);
    }
    setEditingExpense(null);
  };

  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  const isSettings = location.pathname === '/dashboard/settings';

  return (
    <ExpenseDialogContext.Provider value={dialog}>
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <header className="dashboard-header">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="dashboard-header-title">
              <h1>{title}</h1>
              <p className="dashboard-welcome-text">{greeting}</p>
            </div>
            {!isSettings && (
              <button className="dashboard-add-btn" onClick={dialog.openAddExpense}>
                + Add Expense
              </button>
            )}
          </header>

          <main className="dashboard-main">
            {error && <div className="dashboard-banner-error">{error}</div>}
            <Outlet />
          </main>
        </div>

        <ExpenseForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }}
          onSubmit={handleFormSubmit}
          expense={editingExpense}
        />
      </div>
    </ExpenseDialogContext.Provider>
  );
};

const DashboardLayout = () => (
  <ProfileProvider>
    <ExpensesProvider>
      <DashboardChrome />
    </ExpensesProvider>
  </ProfileProvider>
);

export default DashboardLayout;
