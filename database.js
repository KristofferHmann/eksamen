import sql from 'mssql';

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    console.log(`Database: config: ${JSON.stringify(config)}`);
  }

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
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
    }
  }

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }


  async registerUser(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('username', sql.VarChar, data.username)
    request.input('password', sql.VarChar, data.password)
    request.input('gender', sql.VarChar, data.gender)
    request.input('height', sql.Int, data.height)
    request.input('weight', sql.Int, data.weight)
    request.input('age', sql.Int, data.age)
    request.input('bmr', sql.Int, data.bmr)
    const result = await request.query(`INSERT INTO Nutri.[USER] (username, password, gender, height, weight, age, bmr) VALUES (@username, @password, @gender, @height, @weight, @age, @bmr)`);

    return result.rowsAffected[0];
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

  }

  async getAllActivities (data){
    await this.connect();
    const request = this.poolconnection.request();
    request.input('activity_ID', sql.Int, data.activity_ID)
    request.input('activities', sql.VarChar, data.activities)
    request.input('kcalburned', sql.Int, data.kcalBurned)

    const result = await request.query('SELECT activity_ID, activities, kcalburned FROM Nutri.Activities');

    return result.rowsAffected[0]
  }



}