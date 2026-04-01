const express = require('express');
const recordsController = require('./records.controller');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { z } = require('zod');

const router = express.Router();

const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1),
    description: z.string().optional(),
    date: z.string().datetime().optional()
  })
});

router.use(authenticate);

router.get('/', recordsController.getAllRecords);
router.post('/', validate(createRecordSchema), recordsController.createRecord);

module.exports = router;
