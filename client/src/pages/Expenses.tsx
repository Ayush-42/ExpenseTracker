import { useExpenses } from '../context/ExpensesContext';
import { useExpenseDialog } from '../components/DashboardLayout';
import ExpenseList from '../components/ExpenseList';
import './Dashboard.css';

const Expenses = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const { openAddExpense, openEditExpense } = useExpenseDialog();

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <div className="dashboard-expenses-page">
      <div className="dashboard-expenses-header">
        <h2>All Expenses</h2>
        <button className="dashboard-add-btn" onClick={openAddExpense}>
          + Add Expense
        </button>
      </div>
      <ExpenseList
        expenses={expenses}
        onEdit={openEditExpense}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
};

export default Expenses;
