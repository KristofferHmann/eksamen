// Importerer sql-modul fra 'mssql'
import sql from 'mssql';

// Eksporterer Database-klassen som standard
export default class Database {
  // Initialiserer konfigurationsobjektet, poolforbindelsen og forbindelsesstatus
  config = {};
  poolconnection = null;
  connected = false;

  // Konstruktør til at initialisere konfigurationen
  constructor(config) {
    this.config = config;
  };

  // Asynkron metode til at oprette forbindelse til databasen
  async connect() {
    try {
      // Hvis der ikke er nogen aktiv forbindelse, oprettes en ny
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
      }
    } catch (error) {
      // Logger fejl, hvis der opstår en under forbindelsen
      console.error(`Fejl ved forbindelse til databasen: ${JSON.stringify(error)}`);
      console.log(error)
    }
  };

  // Asynkron metode til at lukke forbindelsen til databasen
  async disconnect() {
    try {
      this.poolconnection.close();
    } catch (error) {
      // Logger fejl, hvis der opstår en under lukning af forbindelsen
      console.error(`Fejl ved lukning af databaseforbindelsen: ${error}`);
    }
  };

  // Asynkron metode til at udføre en SQL-forespørgsel
  async executeQuery(query) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
    const request = this.poolconnection.request();
    // Udfører forespørgslen og gemmer resultatet
    const result = await request.query(query);

    // Returnerer antallet af berørte rækker
    return result.rowsAffected[0];
  };

  // Asynkron metode til at registrere en bruger
  async registerUser(data) {
    try {
      // Beregner BMR baseret på alder, køn og vægt
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

      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();
      // Definerer inputparametrene til forespørgslen
      request.input('username', sql.VarChar, data.username)
      request.input('password', sql.VarChar, data.password)
      request.input('gender', sql.VarChar, data.gender)
      request.input('weight', sql.Int, data.weight)
      request.input('age', sql.Int, data.age)
      request.input('bmr', sql.Decimal(18, 2), (bmr * 239).toFixed(2)) //Decimal er sql hvor 18 er hvor mange decimaler der er og 2 er hvor mange der vises.
      // Udfører SQL-forespørgslen til at indsætte en ny bruger
      const result = await request.query(`
    INSERT INTO Nutri.[USER] (username, password, gender, weight, age, bmr) 
    VALUES (@username, @password, @gender, @weight, @age, @bmr)`
      );

      // Returnerer antallet af berørte rækker
      return result.rowsAffected[0];
    } catch (error) {
      // Logger fejl, hvis der opstår en under registrering af brugeren
      console.error('Fejl ved registrering af bruger:', error.message);
      throw error;
    }
  };

  // Asynkron metode til at hente en bruger ved brugernavn og adgangskode
  async getUserByUsernameAndPassword(username, password) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();

      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();

      // Definerer inputparametrene til forespørgslen
      request.input('username', sql.VarChar, username);
      request.input('password', sql.VarChar, password);
      // Udfører SQL-forespørgslen til at hente en bruger
      const result = await request.query(`
        SELECT * FROM Nutri.[USER]
        WHERE username = @username AND password = @password
      `);

      // Logger resultatet
      console.log(result);

      // Returnerer den første bruger i resultatet
      return result.recordset[0];
    } catch (error) {
      // Logger fejl, hvis der opstår en under hentning af brugeren
      console.error('Fejl ved hentning af bruger ved brugernavn og adgangskode:', error.message);
      throw error;
    }
  };

  // Asynkron metode til at hente en bruger ved bruger-ID
  async getUser(user_ID) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();
      // Definerer inputparametrene til forespørgslen
      request.input('user_ID', sql.Int, user_ID);
      // Udfører SQL-forespørgslen til at hente en bruger
      const result = await request.query(`
      SELECT user_ID, username, weight, gender, age, bmr
      FROM Nutri.[USER]
      WHERE user_ID = @user_ID      
      `);
      // Returnerer den første bruger i resultatet
      return result.recordset[0];
    } catch (error) {
      // Logger fejl, hvis der opstår en under hentning af brugeren
      console.error('Fejl ved hentning af bruger:', error.message);
      throw error;
    }
  };
  // Asynkron metode til at slette en bruger
  async deleteUser(userId) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();
      // Definerer inputparametrene til forespørgslen
      request.input('user_ID', sql.Int, userId)
      // Udfører SQL-forespørgsler til at slette brugerens måltider og aktiviteter
      await request.query('DELETE FROM Nutri.Meals WHERE user_ID = @user_ID')
      await request.query('DELETE FROM Nutri.ActivitiesUser WHERE user_ID = @user_ID')
      // Udfører SQL-forespørgslen til at slette brugeren
      const result = await request.query('DELETE FROM Nutri.[USER] WHERE user_ID = @user_ID');

      // Returnerer antallet af berørte rækker (skulle være 1, hvis det er succesfuldt)
      return result.rowsAffected;
    } catch (error) {
      // Logger fejl, hvis der opstår en under sletning af brugeren
      console.error('Fejl ved sletning af bruger:', error.message);
      throw error;
    }
  }

  // Asynkron metode til at redigere en bruger
  async editUser(userId, updatedUserData) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();

      // Uddrager opdaterede brugerdata
      const { gender, weight, age } = updatedUserData;

      // Beregner BMR baseret på køn, vægt og alder
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
      // Konstruerer SQL-forespørgslen til at opdatere brugerinformation
      // Definerer inputparametre
      request.input('userId', sql.Int, userId);
      request.input('gender', sql.VarChar, gender);
      request.input('weight', sql.Int, weight);
      request.input('age', sql.Int, age);
      request.input('bmr', sql.Decimal(18, 2), (bmr * 239).toFixed(2));
      // SQL-forespørgslen til at opdatere brugeren
      const query = `
        UPDATE Nutri.[USER]
        SET gender = @gender, weight = @weight, age = @age, bmr = @bmr
        WHERE user_ID = @userId
      `;

      // Udfører SQL-forespørgslen til at opdatere brugeren
      const result = await request.query(query);

      // Returnerer antallet af rækker, der er påvirket af opdateringsoperationen
      return result.rowsAffected[0];
    } catch (error) {
      // Logger fejl, hvis der opstår en under opdatering af brugeren
      console.error('Fejl ved opdatering af bruger:', error.message);
      throw error;
    }
  }

  // Asynkron metode til at oprette et måltid
  async createMeal(mealData, userID) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel ved hjælp af poolforbindelsen
      const request = this.poolconnection.request();
      // Definerer inputparametrene til forespørgslen
      request.input('mealname', sql.VarChar, mealData.mealname);
      request.input('weight', sql.Int, mealData.weight);
      request.input('totalKcal', sql.Float, mealData.totalKcal);
      request.input('totalProtein', sql.Float, mealData.totalProtein);
      request.input('totalFat', sql.Float, mealData.totalFat);
      request.input('totalFiber', sql.Float, mealData.totalFiber);
      request.input('user_ID', sql.Int, userID);
      request.input('mealTime', sql.DateTime, mealData.mealTime);

      // Udfører SQL-forespørgslen til at indsætte et nyt måltid
      const result = await request.query(`
            INSERT INTO Nutri.Meals (mealname, weight, totalKcal, totalProtein, totalFat, totalFiber, user_ID, mealTime)
            OUTPUT INSERTED.meal_ID
            VALUES (@mealname, @weight, @totalKcal, @totalProtein, @totalFat, @totalFiber, @user_ID, @mealTime);
        `);
      // Gemmer måltidets ID fra resultatet
      const mealID = result.recordset[0].meal_ID;

      // Returnerer måltidets ID
      return mealID;
    } catch (error) {
      // Logger fejl, hvis der opstår en under oprettelse af måltidet
      console.error('Fejl ved oprettelse af måltid:', error.message);
      throw error;
    }
  }
  // Funktion til at redigere måltider
  async editMeals(mealID, mealData) {
    try {
      // Opretter forbindelse til databasen
      await this.connect();
      // Opretter en ny forespørgsel
      const request = this.poolconnection.request();
      // Destructurerer mealData objektet
      const { weight, totalKcal, totalProtein, totalFat, totalFiber } = mealData
      // Tilføjer inputs til forespørgslen
      request.input('weight', sql.Int, weight);
      request.input('totalKcal', sql.Float, totalKcal);
      request.input('totalProtein', sql.Float, totalProtein);
      request.input('totalFat', sql.Float, totalFat);
      request.input('totalFiber', sql.Float, totalFiber);
      request.input('meal_ID', sql.Int, mealID);

      // Udfører forespørgslen
      const result = await request.query(`
        UPDATE Nutri.Meals
        SET 
            weight = @weight,
            totalKcal = @totalKcal,
            totalProtein = @totalProtein,
            totalFat = @totalFat,
            totalFiber = @totalFiber
        WHERE
            meal_ID = @meal_ID;
        
        `);
      // Returnerer antallet af rækker, der er påvirket af forespørgslen
      return result.rowsAffected[0];
    } catch (error) {
      // Logger fejlen, hvis der opstår en
      console.error('Error editing meal:', error.message);
      // Kaster fejlen videre
      throw error;
    }
  }

  // Funktion til at oprette måltidsingredienser
  async createMealIngredients(ingredientData, meal_ID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();
    // Tilføjer inputs til forespørgslen
    request.input('ingredientweight', sql.Int, ingredientData.ingredientweight)
    request.input('meal_ID', sql.Int, meal_ID)
    request.input('ingredient_ID', sql.Int, ingredientData.ingredient_ID)
    request.input('weightKcal', sql.Float, ingredientData.weightKcal)
    request.input('weightProtein', sql.Float, ingredientData.weightProtein)
    request.input('weightFat', sql.Float, ingredientData.weightFat)
    request.input('weightFiber', sql.Float, ingredientData.weightFiber)

    // Udfører forespørgslen
    const result = await request.query(`INSERT INTO Nutri.MealsIngredients (ingredientweight, meal_ID, ingredient_ID, weightKcal, weightProtein, weightFat, weightFiber) VALUES (@ingredientweight, @meal_ID, @ingredient_ID, @weightKcal, @weightProtein, @weightFat, @weightFiber)`);

    // Returnerer antallet af rækker, der er påvirket af forespørgslen
    return result.rowsAffected[0];
  }

  // Funktion til at hente brugerens måltider
  async getUserMeals(userID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();
    // Tilføjer input til forespørgslen
    request.input('user_ID', sql.Int, userID)
    // Udfører forespørgslen
    const result = await request.query(
      'SELECT Meals.meal_ID, Meals.mealname, Meals.weight, Meals.mealTime, Meals.totalKcal, Meals.totalProtein, Meals.totalFat, Meals.totalFiber, MealsIngredients.ingredient_ID, MealsIngredients.ingredientweight, MealsIngredients.weightKcal, MealsIngredients.weightProtein, MealsIngredients.weightFat, MealsIngredients.weightFiber FROM Nutri.Meals JOIN Nutri.MealsIngredients ON Meals.meal_ID = MealsIngredients.meal_ID WHERE Meals.user_ID = @user_ID ORDER BY Meals.meal_ID ASC;')
    // Returnerer resultatsættet
    return result.recordsets[0];
  }

  // Funktion til at hente alle aktiviteter
  async getAllActivities() {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();

    // Udfører forespørgslen
    const result = await request.query('SELECT activity_ID, activities, kcalburned FROM Nutri.Activities');

    // Returnerer resultatsættet
    return result.recordsets[0];
  };

  // Funktion til at hente brugerens aktiviteter
  async getUserActivities(userID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();

    // Tilføjer input til forespørgslen
    request.input('user_ID', sql.Int, userID)

    // Udfører forespørgslen
    const result = await request.query('SELECT Activities.activity_ID, activities, durationkcal, duration, activityTime FROM Nutri.Activities JOIN Nutri.ActivitiesUser on Activities.activity_ID = ActivitiesUser.activity_ID WHERE user_ID = @user_ID');

    // Returnerer resultatsættet
    return result.recordsets[0];
  };

  // Funktion til at tilføje en aktivitet
  async addActivity(data, userID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();
    // Tilføjer inputs til forespørgslen
    request.input('activity_ID', sql.Int, data.activity_ID)
    request.input('duration', sql.Int, data.duration)
    request.input('durationkcal', sql.Int, data.durationkcal)
    request.input('user_ID', sql.Int, userID)
    request.input('activityTime', sql.DateTime, data.activityTime)
    // Udfører forespørgslen
    const result = await request.query(`INSERT INTO Nutri.ActivitiesUser (user_ID, activity_ID, duration, durationkcal, activityTime) VALUES (@user_ID, @activity_ID, @duration, @durationkcal, @activityTime)`);

    // Returnerer antallet af rækker, der er påvirket af forespørgslen
    return result.rowsAffected[0];

  };

  // Funktion til at hente en ingrediens
  async getIngredient(data) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();
    // Tilføjer inputs til forespørgslen
    request.input('ingredient_ID', sql.Int, data.ingredient_ID)
    request.input('ingredientname', sql.VarChar, data.ingredientname)
    request.input('kcal', sql.Int, data.kcal)
    request.input('protein', sql.Int, data.protein)
    request.input('fat', sql.Int, data.fat)
    request.input('fiber', sql.Int, data.fiber)
    // Udfører forespørgslen
    const result = await request.query('SELECT ingredient_ID, ingredientname, kcal, protein, fat, fiber FROM Nutri.Ingredients');

    // Returnerer resultatsættet
    return result.recordsets[0];

  };

  // Funktion til at hente brugerens vandindtag
  async getUserWater(userID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();

    // Tilføjer input til forespørgslen
    request.input('user_ID', sql.Int, userID)

    // Udfører forespørgslen
    const result = await request.query('SELECT water_ID, waterTime, waterVolume, user_ID FROM Nutri.Water WHERE user_ID = @user_ID');

    // Returnerer resultatsættet
    return result.recordsets[0];
  };

  // Funktion til at tilføje vandindtag
  async addWater(data, userID) {
    // Opretter forbindelse til databasen
    await this.connect();
    // Opretter en ny forespørgsel
    const request = this.poolconnection.request();
    // Tilføjer inputs til forespørgslen
    request.input('waterName', sql.VarChar, data.waterName)
    request.input('waterTime', sql.DateTime, data.waterTime)
    request.input('user_ID', sql.Int, userID)
    request.input('waterVolume', sql.Int, data.waterVolume)
    // Udfører forespørgslen
    const result = await request.query(`INSERT INTO Nutri.Water (user_ID, waterName, waterTime, waterVolume) VALUES (@user_ID, @waterName, @waterTime, @waterVolume)`);
    // Returnerer antallet af rækker, der er påvirket af forespørgslen
    return result.rowsAffected[0];
  };

};

