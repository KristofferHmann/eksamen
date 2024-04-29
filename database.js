import sql from 'mssql';

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    console.log(`Database: config: ${JSON.stringify(config)}`);
  };

  async connect() {
    try {
      console.log(`Database connecting...${this.connected}`);
      console.log(this.config)
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log('Database connection successful');
      } else {
        console.log('Database already connected');
      }
    } catch (error) {
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
      console.log(error)
    }
  };

  async disconnect() {
    try {
      this.poolconnection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
    }
  };

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  };


  async registerUser(data) {
    try {
      //Udregner BMR baseret på alder, køn og vægt
      let bmr;
      if (data.gender === 'female') {
        if (data.age < 3) {
          bmr = 0.244 * data.weight - 0.13;
        } else if (data.age >= 4 && data.age <= 10) {
          bmr = 0.085 * data.weight + 2.03;
        } else if (data.age >= 11 && data.age <= 18) {
          bmr = 0.056 * data.weight + 2.90;
        } else if (data.age >= 19 && data.age <= 30) {
          bmr = 0.0615 * data.weight + 2.08;
        } else if (data.age >= 31 && data.age <= 60) {
          bmr = 0.0364 * data.weight + 3.47;
        } else if (data.age >= 61 && data.age <= 75) {
          bmr = 0.0386 * data.weight + 2.88;
        } else if (data.age > 75) {
          bmr = 0.0410 * data.weight + 2.61;
        }
      } else if (data.gender === 'male') {
        if (data.age < 3) {
          bmr = 0.249 * data.weight - 0.13;
        } else if (data.age >= 4 && data.age <= 10) {
          bmr = 0.095 * data.weight + 2.11;
        } else if (data.age >= 11 && data.age <= 18) {
          bmr = 0.074 * data.weight + 2.75 * 0.068;
        } else if (data.age >= 19 && data.age <= 30) {
          bmr = 0.064 * data.weight + 2.84;
        } else if (data.age >= 31 && data.age <= 60) {
          bmr = 0.0485 * data.weight + 3.67;
        } else if (data.age >= 61 && data.age <= 75) {
          bmr = 0.0499 * data.weight + 2.93;
        } else if (data.age > 75) {
          bmr = 0.035 * data.weight + 3.43;
        }
      }

      await this.connect();
      const request = this.poolconnection.request();
      request.input('username', sql.VarChar, data.username)
      request.input('password', sql.VarChar, data.password)
      request.input('gender', sql.VarChar, data.gender)
      request.input('weight', sql.Int, data.weight)
      request.input('age', sql.Int, data.age)
      request.input('bmr', sql.Decimal(18, 2), bmr.toFixed(2)) //Decimal er sql hvor 18 er hvor mange decimaler der er og 2 er hvor mange der vises.
      const result = await request.query(`
    INSERT INTO Nutri.[USER] (username, password, gender, weight, age, bmr) 
    VALUES (@username, @password, @gender, @weight, @age, @bmr)`
      );

      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error registering user:', error.message);
      throw error;
    }
  };

  async getUserByUsernameAndPassword(username, password) {
    try {
      console.log("Connecting to the database...");
      await this.connect();
      //console.log("Connection successful, creating request...");
      const request = this.pool.request();
      //console.log(`Looking up user: ${username}`);
      request.input('username', sql.VarChar, username);
      request.input('password', sql.VarChar, password);
      const result = await request.query(`
        SELECT user_ID FROM Nutri.[USER]
        WHERE username = @username AND password = @password
      `);

      
      return result.recordset.length > 0;
    } catch (error) {
      console.error('Error fetching user by username and password:', error.message);
      throw error;
    }
  };
  
//deleting a user
  async deleteUser(userId) {
    try {
    await this.connect();
const request = this.poolconnection.request();
const result = await request.query('DELETE FROM Nutri.[USER] WHERE user_ID = @userId')

console.log(result);

        return result.rowsAffected; // Return the number of rows affected (should be 1 if successful)
    } catch (error) {
        console.error('Error deleting user:', error.message);
        throw error;
  }
}

  async editUser(userId, updatedUserData) {
    try {
      await this.connect();

      const request = this.poolconnection.request();

      // Extract updated user data
      const { username, password, gender, weight, age } = updatedUserData;

      // Construct the SQL query to update user information
      const query = `
        UPDATE Nutri.[USER]
        SET username = @username, password = @password, gender = @gender, weight = @weight, age = @age
        WHERE user_ID = @userId
      `;

      // Define input parameters
      request.input('userId', sql.Int, userId);
      request.input('username', sql.VarChar, username);
      request.input('password', sql.VarChar, password);
      request.input('gender', sql.VarChar, gender);
      request.input('weight', sql.Int, weight);
      request.input('age', sql.Int, age);
      const result = await request.query(query);

      // Return the number of rows affected by the update operation
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }


  async createMeal(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('mealname', sql.VarChar, data.mealname)
    request.input('weight', sql.Int, data.weight)
    request.input('totalnutrition', sql.Int, data.totalnutrition)
    request.input('user_ID', sql.Int, data.user_ID)

    const result = await request.query(`INSERT INTO Nutri.Meals (mealname, weight, totalnutrition, user_ID) VALUES (@mealname, @weight, @totalnutrition, @user_ID)`);

    return result.rowsAffected[0];

  };

  //Alle vores aktiviteter
  async getAllActivities(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('activity_ID', sql.Int, data.activity_ID)
    request.input('activities', sql.VarChar, data.activities)
    request.input('kcalburned', sql.Int, data.kcalBurned / 60)

    const result = await request.query('SELECT activity_ID, activities, kcalburned FROM Nutri.Activities');

    return result.recordsets[0];
  };

  //Tid for aktiviteten
  async activityDuration(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_ID', sql.Int, data.user_ID)
    request.input('activity_ID', sql.Int, data.activity_ID)
    request.input('duration', sql.Time, data.duration)
    // Calculate total kilocalories burned for the activity
    const totalKcalBurned = data.kcalBurned / 60 * data.duration;

    request.input('total_kcal_burned', sql.Float, totalKcalBurned); // Adjusted input data type

    const result = await request.query('INSERT INTO Nutri.ActivitiesUser (user_ID, activity_ID, duration, total_kcal_burned) VALUES (@user_ID, @activity_ID, @duration_in_minutes, @total_kcal_burned)');

    return result.rowsAffected[0];
  };

  async getIngredient(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('ingredient_ID', sql.Int, data.ingredient_ID)
    request.input('ingredientname', sql.VarChar, data.ingredientname)
    request.input('kcal', sql.Int, data.kcal)
    request.input('protein', sql.Int, data.protein)
    request.input('fat', sql.Int, data.fat)
    request.input('fiber', sql.Int, data.fiber)
    const result = await request.query('SELECT ingredient_ID, ingredientname, kcal, protein, fat, fiber FROM Nutri.Ingredients');

    return result.recordsets[0];

  };


};