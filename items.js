import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import jwt from 'jsonwebtoken'
import { authMiddleware } from './authmiddleware.js';
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
router.post('/mealCreator', authMiddleware, async (req, res) => {
  try {
    const meal = req.body;
    const rowsAffected = await database.createMeal(meal);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//Vælg aktiviteter
router.get('/userActivities', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID
    
    const getAllActivities = await database.getUserActivities(userID);
    console.log("udfhguerhguhreugh");
    res.status(200).json({ getAllActivities });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

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
    console.log("data2", activity);

    const token = req.headers.authorization.split(' ')[1]
    const secretKey = process.env.JWT_SECRET;
    const tokenDecoded = jwt.verify(token, secretKey)
    const userID = tokenDecoded.user_ID
    console.log("1111111111");
    const rowsAffected = await database.addActivity(activity, userID);
    console.log("22222222");
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
// router.post('/login', async (req, res) => {
//   console.log("Received login request", req.body);
//   const { username, password } = req.body;

//   try {
//     const loginSuccessful = await database.getUserByUsernameAndPassword(username, password);

//     if (loginSuccessful) {
//       req.session.user_ID = loginSuccessful.user_ID

//       res.send('Login successful');
//     } else {
//       res.status(401).send('Invalid credentials');
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });


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


/*catch (err){
 return res.send(err.message)
}
const apiToken = jwt.sign({username: 'username', password: 'password'}, jwtSecret)

return res.send(apiToken);
});
*/
//log ud endpoint
router.get('/logout', authMiddleware, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }

    res.send('Logout successful');
  });
});


// Edit user endpoint
router.put('/users/:user_ID', async (req, res) => {
  const userId = req.params.user_ID;
  const updatedUserData = req.body;

  try {
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

// //Delete user endpoint
// router.delete('//delete-user/:userId'), async (req, res) => {
//   const { userId } = req.params;
// }
// try {
//   const result = await db.query('DELETE FROM Users WHERE user_ID = $1', [userId]);
//   if (result.rowCount > 0) {
//       res.send({ success: true, message: "User deleted successfully" });
//   } else {
//       res.status(404).send({ success: false, message: "User not found" });
//   }
// } catch (error) {
//   console.error('Failed to delete user:', error);
//   res.status(500).send({ success: false, message: "Internal server error" });
// };



export default router;