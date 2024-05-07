-- Her er vores SQL-statements der opretter databasen
-- Bruger INT typen i istedet for BIGINT pga. størrelsen af opgaven, selvom BIGINT
-- i de felste tilfælde er bedre da den er større. SÅ specielt for store databaser

CREATE SCHEMA Nutri
GO

CREATE TABLE Nutri.[USER] -- I kantede parentes pga. den også er en reserved keyword
(
    user_ID  INT IDENTITY (1,1) PRIMARY KEY, --Identity skaber en automatisk stigning på 1 ved hver nye bruger. Den starter også på 1. Det ses i (1,1)
    username VARCHAR(255)   NOT NULL,
    password VARCHAR(255)   NOT NULL,
    weight   INT            NOT NULL,
    gender   VARCHAR(255)   NOT NULL,
    age      INT            NOT NULL,
    bmr      DECIMAL(18, 2) NOT NULL,        -- Den er blevet added senere for syns skyld
);
GO

CREATE TABLE Nutri.Activities
(
    activity_ID INT IDENTITY (1,1) PRIMARY KEY,
    activities  VARCHAR(255),
    kcalburned  INT NOT NULL,
);
GO

CREATE TABLE Nutri.ActivitiesUser
(
    ActivitiesUser_ID INT IDENTITY (1,1) PRIMARY KEY,
    user_ID     INTEGER FOREIGN KEY REFERENCES Nutri.[USER] (user_ID),
    activity_ID INTEGER FOREIGN KEY REFERENCES Nutri.Activities (activity_ID),
    duration    INTEGER NOT NULL
);
GO


CREATE TABLE Nutri.Meals
(
    meal_ID        INT IDENTITY (1,1) PRIMARY KEY,
    mealname       VARCHAR(255),
    weight         INT,
    totalnutrition INT,
    user_ID        INTEGER FOREIGN KEY REFERENCES Nutri.[USER] (user_ID)
);
GO

CREATE TABLE Nutri.Ingredients
(
    ingredient_ID  INT PRIMARY KEY,
    ingredientname VARCHAR(255),
    kcal           DECIMAL(6, 2),
    protein        DECIMAL(6, 2),
    fat            DECIMAL(6, 2),
    fiber          DECIMAL(6, 2),
);
GO


CREATE TABLE Nutri.MealsIngredients
(
    mealingredient_ID INT IDENTITY (1,1) PRIMARY KEY,
    ingredientweight  INT,
    meal_ID           INTEGER FOREIGN KEY REFERENCES Nutri.Meals (meal_ID),
    ingredient_ID     INTEGER FOREIGN KEY REFERENCES Nutri.Ingredients (ingredient_ID),
    weightKcal        INT NOT NULL,
    weightProtein     INT NOT NULL,
    weightFat         INT NOT NULL,
    weightFiber       INT NOT NULL

);
GO




INSERT INTO Nutri.Activities (activities, kcalburned)
VALUES ('Almindelig gang', 215),
       ('Gang ned af trapper', 414),
       ('Gang op af trapper', 1079),
       ('Slå græs med en manuel græsslåmaskine', 281),
       ('Lave mad og redde senge', 236),
       ('Luge ukrudt', 362),
       ('Rydde sne', 481),
       ('Læse eller se TV', 74),
       ('Stå oprejst', 89),
       ('Cykling i roligt tempo', 310),
       ('Tørre støv af', 163),
       ('Vaske gulv', 281),
       ('Pudse vinduer', 259),
       ('Cardio', 814),
       ('Hård styrketræning', 348),
       ('Badminton', 318),
       ('Volleyball', 318),
       ('Bordtennis', 236),
       ('Dans i højt tempo', 355),
       ('Dans i moderat tempo', 259),
       ('Fodbold', 510),
       ('Rask gang', 384),
       ('Golf', 244),
       ('Håndbold', 466),
       ('Squash', 466),
       ('Jogging', 666),
       ('Langrend', 405),
       ('Løb i moderat tempo', 872),
       ('Løb i hurtigt tempo', 1213),
       ('Ridning', 414),
       ('Skøjteløb', 273),
       ('Svømning', 296),
       ('Cykling i højt tempo', 658),
       ('Bilreparation', 259),
       ('Gravearbejde', 414),
       ('Landbrugsarbejde', 236),
       ('Let kontorarbejde', 185),
       ('Male hus', 215),
       ('Murerarbejde', 207),
       ('Hugge og slæbe på brænde', 1168)

GO


