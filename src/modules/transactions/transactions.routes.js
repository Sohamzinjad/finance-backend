const express = require('express');
const transactionsController = require('./transactions.controller');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { z } = require('zod');

// Deprecated: this legacy module is intentionally not mounted in src/app.js.
const router = express.Router();

const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE'], { errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }) }),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
  date: z.string().datetime({ message: 'Date must be a valid ISO 8601 datetime' }).optional(),
});

router.use(authenticate);

router.get('/', transactionsController.getAllTransactions);
router.post('/', validate(createTransactionSchema), transactionsController.createTransaction);

module.exports = router;
