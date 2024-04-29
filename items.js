import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import jwt from 'jsonwebtoken'
import { authMiddleware } from './authmiddleware.js';

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
const {username, password} = req.body;
if (typeof username === 'undefined' || typeof password === 'undefined') {
  return res.status(403).send('Username or password is missing');
}
  const jwtSecret = config.jwtSecret;

  try {
      const loginSuccessful = await database.getUserByUsernameAndPassword(username, password);
  }catch (err){
   return res.send(err.message)
  }
 const apiToken = jwt.sign({email: 'email@'}, jwtSecret)

 return res.send(apiToken);
});

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