const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const verifyUser = require('../middleware/verifyUser');

// Get all expenses for a user
router.get('/', verifyUser, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .exec();
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get a single expense by ID
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create a new expense
router.post('/', verifyUser, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    
    if (!title || amount === undefined || !category || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'amount', 'category', 'date']
      });
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive number' });
    }
    
    const expense = new Expense({
      userId: req.userId,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      description: description ? description.trim() : '',
      date: new Date(date),
    });
    
    const savedExpense = await expense.save();
    console.log('✅ Expense created:', savedExpense._id);
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    res.status(500).json({ 
      error: 'Failed to create expense',
      message: error.message 
    });
  }
});

// Update an expense
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? parseFloat(amount) : expense.amount;
    expense.category = category || expense.category;
    expense.description = description !== undefined ? description : expense.description;
    expense.date = date ? new Date(date) : expense.date;
    expense.updatedAt = Date.now();
    
    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete an expense
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;

