import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);

//Registrer en bruger
router.post('/register', async (req, res) => {
  try {
      const user = req.body;
      const rowsAffected = await database.registerUser(user);
      res.status(201).json({ rowsAffected });
  } catch (err) {
      res.status(500).send('Server error');
  }
});


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
  const rowsAffected = await database.getAllActivities(activity);
  res.status(200).json({ rowsAffected });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//Vælg ingredienser
router.get('/ingredients', async (req, res) => {
    try {
      
    const ingredient = req.body;
    const rowsAffected = await database.getIngredient(ingredient);
    res.status(200).json({ rowsAffected });
    } catch (err) {
      res.status(500).send('Server error');
    }
  });





// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
          .input('username', sql.VarChar, username)
          .input('password', sql.VarChar, password)
          .query('SELECT user_id FROM Nutri.[USER] WHERE username = @username AND password = @password');

      if (result.recordset.length > 0) {
          res.send('Login successful');
      } else {
          res.status(401).send('Invalid credentials');
      }
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// user id
router.get('/users/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
          .input('userId', sql.Int, userId)
          .query('SELECT user_id, username FROM Nutri.[USER] WHERE user_id = @userId');

      if (result.recordset.length > 0) {
          const user = result.recordset[0]; // Der blvier kun fundet 1 user

          // Return user details as JSON response
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