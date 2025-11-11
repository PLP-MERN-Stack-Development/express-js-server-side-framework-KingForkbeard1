const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = 3000;

let products = [];

// Middleware functions
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || typeof name !== 'string' ||
      !description || typeof description !== 'string' ||
      typeof price !== 'number' ||
      !category || typeof category !== 'string' ||
      typeof inStock !== 'boolean') {
    return res.status(400).json({ message: 'Invalid product data' });
  }
  next();
};

app.use(bodyParser.json());
app.use(logger);

app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET /api/products: List all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id: Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products: Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id: Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products[productIndex] = { ...products[productIndex], name, description, price, category, inStock };
  res.json(products[productIndex]);
});

// DELETE /api/products/:id: Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(productIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});