import sql from 'mssql';

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
  };

  async connect() {
    try {
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
      }
    } catch (error) {
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
      console.log(error)
    }
  };

  async disconnect() {
    try {
      this.poolconnection.close();
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
      request.input('bmr', sql.Decimal(18, 2), (bmr * 239).toFixed(2)) //Decimal er sql hvor 18 er hvor mange decimaler der er og 2 er hvor mange der vises.
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
      await this.connect();

      const request = this.poolconnection.request();

      request.input('username', sql.VarChar, username);
      request.input('password', sql.VarChar, password);
      const result = await request.query(`
        SELECT * FROM Nutri.[USER]
        WHERE username = @username AND password = @password
      `);

      console.log(result);

      return result.recordset[0];
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
      request.input('user_ID', sql.Int, userId)
      await request.query('DELETE FROM Nutri.Meals WHERE user_ID = @user_ID')
      await request.query('DELETE FROM Nutri.ActivitiesUser WHERE user_ID = @user_ID')
      const result = await request.query('DELETE FROM Nutri.[USER] WHERE user_ID = @user_ID');

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
      const { gender, weight, age } = updatedUserData;

      let bmr;
      if (gender === 'female') {
        if (age < 3) {
          bmr = 0.244 * weight - 0.13;
        } else if (age >= 4 & age <= 10) {
          bmr = 0.085 * weight + 2.03;
        } else if (age >= 11 && age <= 18) {
          bmr = 0.056 * weight + 2.90;
        } else if (age >= 19 && age <= 30) {
          bmr = 0.0615 * weight + 2.08;
        } else if (age >= 31 && age <= 60) {
          bmr = 0.0364 * weight + 3.47;
        } else if (age >= 61 && age <= 75) {
          bmr = 0.0386 * weight + 2.88;
        } else if (age > 75) {
          bmr = 0.0410 * weight + 2.61;
        }
      } else if (gender === 'male') {
        if (age < 3) {
          bmr = 0.249 * weight - 0.13;
        } else if (age >= 4 && age <= 10) {
          bmr = 0.095 * weight + 2.11;
        } else if (age >= 11 && age <= 18) {
          bmr = 0.074 * weight + 2.75 * 0.068;
        } else if (age >= 19 && age <= 30) {
          bmr = 0.064 * weight + 2.84;
        } else if (age >= 31 && age <= 60) {
          bmr = 0.0485 * weight + 3.67;
        } else if (age >= 61 && age <= 75) {
          bmr = 0.0499 * weight + 2.93;
        } else if (age > 75) {
          bmr = 0.035 * weight + 3.43;
        }
      }
      // Construct the SQL query to update user information
      // Define input parameters
      request.input('userId', sql.Int, userId);
      request.input('gender', sql.VarChar, gender);
      request.input('weight', sql.Int, weight);
      request.input('age', sql.Int, age);
      request.input('bmr', sql.Decimal(18, 2), (bmr * 239).toFixed(2));
      const query = `
        UPDATE Nutri.[USER]
        SET gender = @gender, weight = @weight, age = @age, bmr = @bmr
        WHERE user_ID = @userId
      `;


      const result = await request.query(query);

      // Return the number of rows affected by the update operation
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }




  async createMeal(mealData, userID) {
    try {
      await this.connect();
      const request = this.poolconnection.request();
      request.input('mealname', sql.VarChar, mealData.mealname);
      request.input('weight', sql.Int, mealData.weight);
      request.input('totalKcal', sql.Float, mealData.totalKcal);
      request.input('totalProtein', sql.Float, mealData.totalProtein);
      request.input('totalFat', sql.Float, mealData.totalFat);
      request.input('totalFiber', sql.Float, mealData.totalFiber);
      request.input('user_ID', sql.Int, userID);
      request.input('mealTime', sql.DateTime, mealData.mealTime);

      const result = await request.query(`
            INSERT INTO Nutri.Meals (mealname, weight, totalKcal, totalProtein, totalFat, totalFiber, user_ID, mealTime)
            OUTPUT INSERTED.meal_ID
            VALUES (@mealname, @weight, @totalKcal, @totalProtein, @totalFat, @totalFiber, @user_ID, @mealTime);
        `);
      const mealID = result.recordset[0].meal_ID;

      return mealID;
    } catch (error) {
      console.error('Error creating meal:', error.message);
      throw error;
    }
  }

  async editMeals(mealData, userID) {
    try {
      await this.connect();
      const request = this.poolconnection.request();
      request.input('mealname', sql.VarChar, mealData.mealname);
      request.input('weight', sql.Int, mealData.weight);
      request.input('totalKcal', sql.Float, mealData.totalKcal);
      request.input('totalProtein', sql.Float, mealData.totalProtein);
      request.input('totalFat', sql.Float, mealData.totalFat);
      request.input('totalFiber', sql.Float, mealData.totalFiber);
      request.input('user_ID', sql.Int, userID);

      const result = await request.query(`
      UPDATE Nutri.Meals
      SET 
          mealname = @mealname,
          weight = @weight,
          totalKcal = @totalKcal,
          totalProtein = @totalProtein,
          totalFat = @totalFat,
          totalFiber = @totalFiber
      WHERE
          meal_ID = @meal_ID;
      
        `);
        return result.rowsAffected[0];
    } catch (error) {
      console.error('Error editing meal:', error.message);
      throw error;
    }
  }


  async createMealIngredients(ingredientData, meal_ID) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('ingredientweight', sql.Int, ingredientData.ingredientweight)
    request.input('meal_ID', sql.Int, meal_ID)
    request.input('ingredient_ID', sql.Int, ingredientData.ingredient_ID)
    request.input('weightKcal', sql.Float, ingredientData.weightKcal)
    request.input('weightProtein', sql.Float, ingredientData.weightProtein)
    request.input('weightFat', sql.Float, ingredientData.weightFat)
    request.input('weightFiber', sql.Float, ingredientData.weightFiber)

    const result = await request.query(`INSERT INTO Nutri.MealsIngredients (ingredientweight, meal_ID, ingredient_ID, weightKcal, weightProtein, weightFat, weightFiber) VALUES (@ingredientweight, @meal_ID, @ingredient_ID, @weightKcal, @weightProtein, @weightFat, @weightFiber)`);

    return result.rowsAffected[0];
  }



  async getUserMeals(userID) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_ID', sql.Int, userID)
    const result = await request.query(
      'SELECT Meals.meal_ID, Meals.mealname, Meals.weight, Meals.mealTime, Meals.totalKcal, Meals.totalProtein, Meals.totalFat, Meals.totalFiber, MealsIngredients.ingredient_ID, MealsIngredients.ingredientweight, MealsIngredients.weightKcal, MealsIngredients.weightProtein, MealsIngredients.weightFat, MealsIngredients.weightFiber FROM Nutri.Meals JOIN Nutri.MealsIngredients ON Meals.meal_ID = MealsIngredients.meal_ID WHERE Meals.user_ID = @user_ID;')
    return result.recordsets[0];
  }

  //Alle vores aktiviteter
  async getAllActivities() {
    await this.connect();
    const request = this.poolconnection.request();

    const result = await request.query('SELECT activity_ID, activities, kcalburned FROM Nutri.Activities');

    return result.recordsets[0];
  };
  //get user activities
  async getUserActivities(userID) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('user_ID', sql.Int, userID)

    const result = await request.query('SELECT Activities.activity_ID, activities, durationkcal, duration, activityTime FROM Nutri.Activities JOIN Nutri.ActivitiesUser on Activities.activity_ID = ActivitiesUser.activity_ID WHERE user_ID = @user_ID');

    return result.recordsets[0];
  };

  async addActivity(data, userID) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('activity_ID', sql.Int, data.activity_ID)
    request.input('duration', sql.Int, data.duration)
    request.input('durationkcal', sql.Int, data.durationkcal)
    request.input('user_ID', sql.Int, userID)
    request.input('activityTime', sql.DateTime, data.activityTime)
    const result = await request.query(`INSERT INTO Nutri.ActivitiesUser (user_ID, activity_ID, duration, durationkcal, activityTime) VALUES (@user_ID, @activity_ID, @duration, @durationkcal, @activityTime)`);

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


  async getUserWater(userID) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('user_ID', sql.Int, userID)

    const result = await request.query('SELECT water_ID, waterTime, waterVolume, user_ID FROM Nutri.Water WHERE user_ID = @user_ID');

    return result.recordsets[0];
  };

  async addWater(data, userID) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('waterName', sql.VarChar, data.waterName)
    request.input('waterTime', sql.DateTime, data.waterTime)
    request.input('user_ID', sql.Int, userID)
    request.input('waterVolume', sql.Int, data.waterVolume)
    const result = await request.query(`INSERT INTO Nutri.Water (user_ID, waterName, waterTime, waterVolume) VALUES (@user_ID, @waterName, @waterTime, @waterVolume)`);
    return result.rowsAffected[0];
  };
  

};