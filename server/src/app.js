const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const quotationRoutes = require('./routes/quotation.routes');
const salesOrderRoutes = require('./routes/salesOrder.routes');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/enquiries', enquiryRoutes);
app.use('/quotations', quotationRoutes);
app.use('/sales-orders', salesOrderRoutes);
app.use('/products', productRoutes);
app.use('/inventory', inventoryRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
