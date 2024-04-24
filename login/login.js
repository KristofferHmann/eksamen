import express from 'express';
import Database from './database.js';
import { config } from './config.js';

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);

router.post('/', async (req, res) => {
  try {
    // Your code to handle login goes here
    const { username, password } = req.body;
    // For example, you might query the database for the user
    const user = await database.read(username);
    // Then compare the provided password with the stored password
    if (user && user.password === password) {
      res.send('Login successful!');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
