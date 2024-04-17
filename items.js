import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);

router.get('/', async (_, res) => {
  try {
    // Return a list of items
    const items = await database.readAll();
    console.log(`items: ${JSON.stringify(items)}`);
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Create a todo
    const item = req.body;
    console.log(`item: ${JSON.stringify(item)}`);
    const rowsAffected = await database.create(item);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Get the todo with the specified ID
    const itemId = req.params.id;
    console.log(`itemId: ${itemId}`);
    if (itemId) {
      const result = await database.read(itemId);
      console.log(`items: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update the todo with the specified ID
    const itemId = req.params.id;
    console.log(`itemId: ${itemId}`);
    const item = req.body;

    if (itemId && item) {
      delete item.id;
      console.log(`todo: ${JSON.stringify(item)}`);
      const rowsAffected = await database.update(itemId, item);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete the todo with the specified ID
    const itemId = req.params.id;
    console.log(`itemId: ${itemId}`);

    if (!itemId) {
      res.status(404);
    } else {
      const rowsAffected = await database.delete(itemId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;