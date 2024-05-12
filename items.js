// Importerer nødvendige moduler
import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env`, debug: true });

// Opretter en ny router
const router = express.Router();
router.use(express.json());

// Udskriver konfigurationen (kun til udvikling - bør ikke gøres i produktion)
console.log(config);

// Opretter et nyt databaseobjekt
const database = new Database(config);

// Endpoint til at oprette et måltid
router.post('/mealCreator', async (req, res) => {
  try {
    const meal = req.body; // Henter måltidet fra request body
    const token = req.headers.authorization.split(' ')[1] // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey) // Dekoder token
    const userID = tokenDecoded.user_ID // Henter brugerID fra det dekodede token
    console.log(userID);
    const meal_ID = await database.createMeal(meal, userID); // Opretter måltidet i databasen
    res.status(201).json({ message: 'Meals created successfully', meal_ID }); // Sender succesbesked tilbage
  } catch (err) {
    console.error('Error cathing meal', err);
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at oprette ingredienser til et måltid
router.post('/mealIngredients', async (req, res) => {
  try {
    const ingredientData = req.body; // Henter ingrediensdata fra request body
    const meal_ID = ingredientData.meal_ID; // Henter måltidets ID
    const token = req.headers.authorization.split(' ')[1] // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey) // Dekoder token
    const userID = tokenDecoded.user_ID // Henter brugerID fra det dekodede token
    const rowsAffected = await database.createMealIngredients(ingredientData, meal_ID); // Opretter ingredienserne i databasen
    res.status(201).json({ message: 'Meal ingredients created successfully', rowsAffected }); // Sender succesbesked tilbage
  } catch (err) {
    console.error('Error catching meal ingredients', err);
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at hente en brugers måltider
router.get('/userMeals', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Dekoder token
    const userID = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token

    const userMeals = await database.getUserMeals(userID); // Henter brugerens måltider fra databasen
    res.status(200).json({ userMeals }); // Sender måltiderne tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at opdatere et måltid
router.put('/updateMeals', async (req, res) => {
  try {
    // Henter brugerID fra det dekodede token
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Dekoder token
    const userID = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token

    // Henter måltidsdata fra request body
    const mealData = req.body.mealData;
    const mealID = req.body.mealID;

    // Opdaterer måltidet i databasen
    const rowsAffected = await database.editMeals(mealID, mealData);

    // Tjekker om nogen rækker blev påvirket
    if (rowsAffected > 0) {
      res.status(200).json({ message: 'Meal updated successfully.' }); // Sender succesbesked tilbage
    } else {
      res.status(404).json({ message: 'Meal not found.' }); // Sender fejlbesked tilbage hvis måltidet ikke blev fundet
    }
  } catch (err) {
    console.error('Error updating meals:', err.message);
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at hente en brugers aktiviteter
router.get('/userActivities', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1] // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey) // Dekoder token
    const userID = tokenDecoded.user_ID // Henter brugerID fra det dekodede token

    const getAllActivities = await database.getUserActivities(userID); // Henter brugerens aktiviteter fra databasen
    res.status(200).json({ getAllActivities }); // Sender aktiviteterne tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at hente alle aktiviteter
router.get('/allActivities', async (req, res) => {
  try {
    const activity = req.body; // Henter aktivitetsdata fra request body
    const getAllActivities = await database.getAllActivities(activity); // Henter alle aktiviteter fra databasen
    res.status(200).json({ getAllActivities }); // Sender aktiviteterne tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at tilføje en aktivitet
router.post('/addActivity', async (req, res) => {
  try {
    const activity = req.body; // Henter aktivitetsdata fra request body
    const token = req.headers.authorization.split(' ')[1] // Henter token fra headers
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey) // Dekoder token
    const userID = tokenDecoded.user_ID // Henter brugerID fra det dekodede token
    const rowsAffected = await database.addActivity(activity, userID); // Tilføjer aktiviteten til databasen
    res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at hente alle ingredienser
router.get('/ingredients', async (req, res) => {
  try {
    const ingredient = req.body; // Henter ingrediensdata fra request body
    const allIngredients = await database.getIngredient(ingredient); // Henter alle ingredienser fra databasen
    res.status(200).json({ allIngredients }); // Sender ingredienserne tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at registrere en bruger
router.post('/register', async (req, res) => {
  try {
    const user = req.body; // Henter brugerdata fra request body
    const rowsAffected = await database.registerUser(user); // Registrerer brugeren i databasen
    res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at logge ind
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Henter brugernavn og password fra request body
  if (typeof username === 'undefined' || typeof password === 'undefined') {
    return res.status(403).send('Username or password is missing'); // Sender fejlbesked tilbage hvis brugernavn eller password mangler
  }
  const jwtSecret = config.jwtSecret; // Henter hemmelig nøgle fra konfigurationen

  try {
    const user = await database.getUserByUsernameAndPassword(username, password); // Henter brugeren fra databasen
    if (user) {
      const apiToken = jwt.sign({ username: user.username, user_ID: user.user_ID }, jwtSecret, { expiresIn: '2d' }); // Genererer et token
      console.log("token", apiToken);
      return res.status(200).json(apiToken); // Sender token tilbage
    } else {
      return res.status(401).json(false); // Sender fejlbesked tilbage hvis brugeren ikke blev fundet
    }
  } catch (err) {
    return res.status(500).json(err.message); // Sender fejlbesked tilbage hvis noget går galt
  }
});

// Endpoint til at logge ud
router.get('/logout', async (req, res) => {
  try {
    // Sender en besked om succesfuld logout
    res.send('Logout successful');
  } catch (error) {
    // Håndterer eventuelle fejl (selvom der ikke burde være nogen ved logout)
    console.error(error);
    res.status(500).send('Failed to log out');
  }
});

// Endpoint til at slette en bruger
router.get('/delete', async (req, res) => {
  try {
    // Henter token fra request headers og splitter det for at få det faktiske token
    const token = req.headers.authorization.split(' ')[1];
    // Henter hemmelig nøgle fra miljøvariabler
    const secretKey = process.env.JWT_SECRET;
    // Verificerer token og ekstraherer bruger ID
    const tokenDecoded = jwt.verify(token, secretKey);
    const userID = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token
    // Sletter bruger fra databasen
    const rowsAffected = await database.deleteUser(userID);
    if (rowsAffected > 0) {
      console.log('User deleted successfully');
      return res.status(200).send('User deleted');
    }
  } catch (error) {
    return res.status(500).send('Error deleting user');
  }
});

// Endpoint til at redigere en bruger
router.put('/edit', async (req, res) => {
  try {
    // Ekstraherer bruger ID fra JWT token
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra request headers og splitter det for at få det faktiske token
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Verificerer token og ekstraherer bruger ID
    const userId = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token

    // Ekstraherer opdaterede brugerdata fra request body
    const updatedUserData = req.body;

    // Opdaterer brugerinformation i databasen
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

// Endpoint til at hente brugerinformation
router.get('/userInfo', async (req, res) => {
  try {
    // Ekstraherer og dekoder token
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra request headers og splitter det for at få det faktiske token
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Verificerer token og ekstraherer bruger ID
    const userId = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token

    // Henter brugerinformation fra databasen ved hjælp af getUser funktionen
    const userData = await database.getUser(userId); // Bruger userId i stedet for req.params.user_ID
    if (!userData) {
      return res.status(404).send('User not found');
    }
    // Hvis userData ikke er tom, sendes det som et svar
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user by user ID:', error);
    return res.status(500).send('Error fetching user');
  }
});

// Endpoint til at hente al vandinformation for en bruger
router.get('/allWater', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra request headers og splitter det for at få det faktiske token
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Verificerer token og ekstraherer bruger ID
    const userID = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token

    // Henter alt vandinformation for en bruger
    const getAllWater = await database.getUserWater(userID); // Henter brugerens vandindtag fra databasen med getUserWater funktionen
    res.status(200).json({ getAllWater });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Endpoint til at registrere et vandindtag
router.post('/addWater', async (req, res) => {
  try {
    // Henter vanddata fra request body
    const water = req.body;
    const token = req.headers.authorization.split(' ')[1]; // Henter token fra request headers og splitter det for at få det faktiske token
    const secretKey = process.env.JWT_SECRET; // Henter hemmelig nøgle fra miljøvariabler
    const tokenDecoded = jwt.verify(token, secretKey); // Verificerer token og ekstraherer bruger ID
    const userID = tokenDecoded.user_ID; // Henter brugerID fra det dekodede token
    // Tilføjer vandindtag til databasen
    const rowsAffected = await database.addWater(water, userID); // Tilføjer vandindtag til databasen med addWater funktionen
    res.status(201).json({ rowsAffected });
  } catch (err) {
    console.error(err); 
    res.status(500).send('Server error');
  }
});

// Eksporterer routeren som standard
export default router;