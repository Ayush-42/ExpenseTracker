import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Expense, ExpenseFormData } from '../types/expense';
import { DEFAULT_CATEGORIES } from '../types/expense';
import './ExpenseForm.css';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expense?: Expense | null;
}

const ExpenseForm = ({ isOpen, onClose, onSubmit, expense }: ExpenseFormProps) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: 0,
    category: 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || '',
        date: expense.date.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        amount: 0,
        category: 'other',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setError('');
  }, [expense, isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        amount: 0,
        category: 'other',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setError('');
      setLoading(false);
      // Close form immediately after successful submission
      onClose();
    } catch (err: any) {
      console.error('Error submitting expense:', err);
      setError(err.message || 'Failed to save expense. Please try again.');
      setLoading(false);
      // Don't close on error - let user see the error message and retry
    }
  };

  if (!isOpen) return null;

  return (
    <div className="expense-form-overlay" onClick={onClose}>
      <div className="expense-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="expense-form-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="expense-form-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          {error && <div className="expense-form-error">{error}</div>}

          <div className="expense-form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Grocery Shopping"
              required
              disabled={loading}
            />
          </div>

          <div className="expense-form-row">
            <div className="expense-form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="expense-form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="expense-form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={loading}
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="expense-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="expense-form-actions">
            <button type="button" onClick={onClose} disabled={loading} className="expense-form-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="expense-form-submit">
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;

