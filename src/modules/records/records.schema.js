const { z } = require('zod');

const recordFields = {
  amount: z.coerce.number().positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  date: z.coerce.date({
    invalid_type_error: 'Date must be a valid date',
    required_error: 'Date is required',
  }),
  notes: z.string().optional(),
};

const createRecordSchema = z.object(recordFields);

const updateRecordSchema = z
  .object({
    amount: recordFields.amount.optional(),
    type: recordFields.type.optional(),
    category: recordFields.category.optional(),
    date: recordFields.date.optional(),
    notes: recordFields.notes,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

module.exports = {
  createRecordSchema,
  updateRecordSchema,
};
