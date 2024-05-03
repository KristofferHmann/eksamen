import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env`, debug: true });
//import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(express.json());
//router.use(cookieParser());
// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);




//Registrer et måltid
router.post('/mealCreator', async (req, res) => {
  try {
    const meal = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID
    console.log(userID);
    const rowsAffected = await database.createMeal(meal, userID);
    res.status(201).json({ message: 'Meals created successfully', rowsAffected });
  } catch (err) {
    console.error('Error cathing meal', err);
    res.status(500).send('Server error');
  }
});

router.get('/mealCreator', async (req, res) => {
  try {
    const { mealname, meal_ID } = req.query;
    if (!req.headers.authorization) {
      return res.status(401).send('No authorization token provided');
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(401).send('Invalid token format');
    }
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID

    const trackedMeals = await database.getMealsFromMealCreator(userID, mealname, meal_ID);
    res.status(200).json({ trackedMeals })
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error')
  }
});


router.post('/mealIngredients', async (req, res) => {
  try {
    const ingredientData = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID
    console.log(userID);
    const rowsAffected = await database.createMealIngredients(ingredientData, userID);
    res.status(201).json({ message: 'Meal ingredients created successfully', rowsAffected });
  } catch (err) {
    console.error('Error catching meal ingredients', err);
    res.status(500).send('Server error');
  }
});

router.get('/userActivities', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID

    const getAllActivities = await database.getUserActivities(userID);
    res.status(200).json({ getAllActivities });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//Vælg aktiviteter
router.get('/allActivities', async (req, res) => {
  try {

    const activity = req.body;
    const getAllActivities = await database.getAllActivities(activity);
    res.status(200).json({ getAllActivities });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//Registrer et måltid
router.post('/addActivity', async (req, res) => {
  try {
    const activity = req.body;
    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID
    const rowsAffected = await database.addActivity(activity, userID);
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


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username === 'undefined' || typeof password === 'undefined') {
    return res.status(403).send('Username or password is missing');
  }
  const jwtSecret = config.jwtSecret;

  try {
    const user = await database.getUserByUsernameAndPassword(username, password);
    if (user) {
      const apiToken = jwt.sign({ username: user.username, user_ID: user.user_ID }, jwtSecret, { expiresIn: '2d' });
      console.log("token", apiToken);
      return res.status(200).json(apiToken);
    } else {
      return res.status(401).json(false);
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});


//log ud endpoint
router.get('/logout', async (req, res) => {
  try {

    res.send('Logout successful');
  } catch (error) {
    // Handle any errors (though there shouldn't be any for logout)
    console.error(error);
    res.status(500).send('Failed to log out');
  }
});



router.get('/delete', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;
    // Verify the token and extract user ID
    const tokenDecoded = jwt.verify(token, secretKey);
    const userID = tokenDecoded.user_ID;
    const rowsAffected = await database.deleteUser(userID);
    if (rowsAffected > 0) {
      console.log('User deleted successfully');
      return res.status(200).send('User deleted');
    }
  } catch (error) {
    return res.status(500).send('Error deleting user');
  }
});


// Edit user endpoint
// Edit user endpoint
router.put('/edit', async (req, res) => {
  try {
    // Extract user ID from the JWT token
    const token = req.headers.authorization.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey);
    const userId = tokenDecoded.user_ID;

    // Extract updated user data from the request body
    const updatedUserData = req.body;

    // Update user information in the database
    const rowsAffected = await database.editUser(userId, updatedUserData);

    if (rowsAffected > 0) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});






export default router;