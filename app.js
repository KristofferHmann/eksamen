import express from 'express';
import { config } from './config.js';
import Database from './database.js';

// Import App routes
import items from './items.js';

// //Import login
// import login from './login.js';

// app.use('/login', login);

const port = process.env.PORT || 3000;

const app = express();

app.post('/register', async (req, res) => {
  const { username, password, gender, height, weight, age, bmr } = req.body;

  try {
      const pool = await sql.connect(config);
      await pool.request()
          .input('username', sql.VarChar, username)
          .input('password', sql.VarChar, password)
          .input('gender', sql.VarChar, gender)
          .input('height', sql.Int, height)
          .input('weight', sql.Int, weight)
          .input('age', sql.Int, age)
          .input('bmr', sql.Int, bmr)
          .query(`INSERT INTO Nutri.[USER] (username, password, gender, height, weight, age, bmr) VALUES (@username, @password, @gender, @height, @weight, @age, @bmr)`);

      res.send('User registered successfully');
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// Login endpoint
/*app.post('/login', async (req, res) => {
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
}); */




// Connect App routes
//app.use('/api-docs', openapi);
app.use('/items', items);
//app.use('*', (_, res) => {
//  res.redirect('/api-docs');
//});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
