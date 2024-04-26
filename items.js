import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);




//Registrer et måltid
router.post('/mealCreator', async (req, res) => {
  try {
      const meal = req.body;
      const rowsAffected = await database.createMeal(meal);
      res.status(201).json({ rowsAffected });
  } catch (err) {
      res.status(500).send('Server error');
  }
});

//Vælg aktiviteter
router.get('/activities', async (req, res) => {
  try {
    
  const activity = req.body;
  const getAllActivities = await database.getAllActivities(activity);
    res.status(200).json({ getAllActivities });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/duration', async (req, res) => {
  try {
      const duration = req.body;
      const rowsAffected = await database.activityDuration(duration);
      res.status(201).json({ rowsAffected });
  } catch (err) {
      res.status(500).send('Server error');
  }
});


//Vælg ingredienser
router.get('/ingredients', async (req, res) => {
    try {
      
    const ingredient = req.body;
    const allIngredients = await database.getIngredient(ingredient);
    res.status(200).json({ allIngredients });
    } catch (err) {
      res.status(500).send('Server error');
    }
  });


//Registrer en bruger
router.post('/register', async (req, res) => {
  try {
      const user = req.body;
      const rowsAffected = await database.registerUser(user); //kalder registerUser metode i database.js
      res.status(201).json({ rowsAffected });
  } catch (err) {
      res.status(500).send('Server error');
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const loginSuccessful = await database.getUserByUsernameAndPassword(username, password);

    if (loginSuccessful) {
      res.send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Hent bruger efter bruger-id
router.get('/users/:user_ID', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const user = await database.getUserById(userId);

    if (user) {
      res.json({
        user_id: user.user_id,
        username: user.username,
      });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


export default router;