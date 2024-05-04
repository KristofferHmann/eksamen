

let totalKcal = 0;
let totalProtein = 0;
let totalFat = 0;
let totalFiber = 0;
let numIngredients = 0;
let meals = []; // List of meals, each meal is a list of ingredients
let currentMeal = []; // List of ingredients for the current meal


function openMealNameModal() {
    document.getElementById("mealNameModal").style.display = "block";
}

// Close Meal Name Modal
function closeMealNameModal() {
    document.getElementById("mealNameModal").style.display = "none";
}

// Submit Meal Name
function submitMealName() {
    // Get the meal name from the input field
    let mealName = document.getElementById("mealNameInput").value;
    let mealWeight = document.getElementById("mealWeightInput").value;
    // Close the modal
    closeMealNameModal();

    const mealData = {
        mealname: mealName,
        weight: mealWeight
    }
    createMeal(mealData)
    openMealCreator();
}

//Knapper til at åbne modal (tilføj måltid), åbne og lukke modalvindue.
function openMealCreator() {
    document.getElementById("modal").style.display = "block";
    document.getElementById("mealCreatorModal").style.display = "block";
}
function closeMealCreator() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("mealCreatorModal").style.display = "none";
}

function searchButton_MC(event) {
    if (event.key === "Enter") {
        let text = document.getElementById("mcFoodSearch").value
        searchFoodMC(text);

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('mcFoodSearch');
    searchInput.addEventListener('input', async () => {
        try {
            await foodFetch();
            console.log('Fetch request successful');
        } catch (error) {
            console.error('Error during fetch request:', error);
        }
    });
});

async function fetchNutrition(ingredientName) {
    const response = await fetch('http://localhost:3000/items/ingredients');
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    const ingredient = data.allIngredients.find(ingredient => ingredient.ingredientname === ingredientName);
    if (!ingredient) {
        throw new Error('Ingredient not found');
    }
    const ingredientID = ingredient.ingredient_ID;
    return {
        ingredientID: ingredientID,
        kcal: ingredient.kcal,
        protein: ingredient.protein,
        fat: ingredient.fat,
        fiber: ingredient.fiber,
    };
};

document.addEventListener('DOMContentLoaded', () => {
    const addIngredientButton = document.getElementById('addIngredient');
    if (addIngredientButton) {
        addIngredientButton.addEventListener('click', addIngredientToMeal);
    } else {
        console.log('Button is not found');
    }
});
async function foodFetch() {
    try {
        const response = await fetch('http://localhost:3000/items/ingredients');
        if (response.ok) {
            console.log('Response status:', response.status);
        } else {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const ressult = document.getElementById('searchResults');
        ressult.innerHTML = '';
        const searchFoodInput = document.getElementById('mcFoodSearch');
        data.allIngredients
            .filter(ingredient => ingredient.ingredientname.toLowerCase().includes(searchFoodInput.value.toLowerCase()))
            .forEach((ingredient) => {
                const option = document.createElement('option');
                option.value = ingredient.ingredientname;
                option.textContent = ingredient.ingredientname;
                option.id = ingredient.ingredient_ID
                ressult.appendChild(option);
            });
    } catch (error) {
        throw new Error('Error fetching data:' + error.toString());
    }
};

async function addIngredientToMeal() {
    let selectedFoodItem = document.getElementById("searchResults").value;
    let weight = document.getElementById('mealWeight').value;

    // Fetch nutrition information
    const nutrition = await fetchNutrition(selectedFoodItem);

    // Calculate nutrition values based on weight
    const weightInGrams = parseFloat(weight);
    const kcal = (nutrition.kcal * weightInGrams) / 100;
    const protein = (nutrition.protein * weightInGrams) / 100;
    const fat = (nutrition.fat * weightInGrams) / 100;
    const fiber = (nutrition.fiber * weightInGrams) / 100;


    const ingredientID = nutrition.ingredientID;

    // Add the ingredient to the current meal
    currentMeal.push({
        name: selectedFoodItem,
        weight: weight,
        nutrition: { kcal, protein, fat, fiber }
    });

    let meal_ID = document.getElementById('mealIDHidden').value; //tager value fra den gemte mealid input og bruger det i ingiredientdata for at gemme det i databasen

    //skab ingredientsdata som skal sendes til backend
    const ingredientData = {
        ingredient_ID: ingredientID,
        ingredientweight: weight,
        weightKcal: kcal,
        weightProtein: protein,
        weightFat: fat,
        weightFiber: fiber,
        meal_ID: meal_ID
    }
    //Kalder funktionen for at sende ingredienser til backend
    createMealIngredient(ingredientData);
    // Define ingredientsTable
    let ingredientsTable = document.getElementById('ingredientsTable');
    // Opret en ny række og tilføj den til tabellen
    let row = ingredientsTable.insertRow();
    row.insertCell().textContent = ingredientsTable.rows.length - 1; // # column
    row.insertCell().textContent = selectedFoodItem; // Ingredient Name column
    row.insertCell().textContent = weight; // Weight column
    row.insertCell().textContent = `${kcal.toFixed(2)} kcal, ${protein.toFixed(2)} protein, ${fat.toFixed(2)} fat, ${fiber.toFixed(2)} fiber`; // Nutrition column

    // Opdater de globale totaler
    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalFiber += fiber;

    // Update numIngredients after a new row is added
    numIngredients += 1;
};

document.getElementById("SubmitButtonID").addEventListener("click", addMealToTable);

function addMealToTable() {
    // Find tabellen i mealCreator div
    let mealTable = document.querySelector(".mealCreator table tbody");

    // Hent måltidsnavnet fra input feltet
    let mealName = document.getElementById("mealNameInput").value;

    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    // Opret en ny række og tilføj den til tabellen
    let row = mealTable.insertRow();
    row.insertCell().textContent = mealTable.rows.length; // # kolonne
    row.insertCell().textContent = mealName; // Meal Name kolonne (opdater denne værdi som nødvendigt)
    row.insertCell().textContent = numIngredients;
    row.insertCell().textContent = `${totalKcal.toFixed(2)} kcal, ${totalProtein.toFixed(2)} protein, ${totalFat.toFixed(2)} fat, ${totalFiber.toFixed(2)} fiber`;
    row.insertCell().textContent = dateString; // Opdaterer denne værdi med datoen

    // Add the current meal to the list of meals
    meals.push(currentMeal);

    // Save the meal data in local storage
    const mealData = {
        name: mealName,
        numIngredients: numIngredients,
        ingredients: currentMeal,
        nutrition: {
            kcal: totalKcal,
            protein: totalProtein,
            fat: totalFat,
            fiber: totalFiber,
        },
        addedOn: dateString,
    };
    localStorage.setItem(mealName, JSON.stringify(mealData));

    // Reset numIngredients for the next meal
    numIngredients = 0;

    // Nulstil de globale totaler for det næste måltid
    totalKcal = 0;
    totalProtein = 0;
    totalFat = 0;
    totalFiber = 0;

    // Reset the current meal for the next meal
    currentMeal = [];

    // Add a new cell for the button
    let buttonCell = row.insertCell();
    // Create a button element
    let button = document.createElement('button');
    // Set the button text
    button.textContent = 'Show Ingredients';
    // Store the index of the meal in the button's dataset
    button.dataset.mealIndex = meals.length - 1;
    // Add an event listener to the button
    button.addEventListener('click', (event) => {
        // Get the index of the meal from the button's dataset
        let mealIndex = event.target.dataset.mealIndex;
        // Get the ingredients of the meal
        let ingredients = meals[mealIndex];
        // Create a string with the ingredients
        let ingredientsStr = ingredients.map(ingredient =>
            `${ingredient.name}: ${ingredient.weight}g, ${ingredient.nutrition.kcal.toFixed(2)} kcal, ${ingredient.nutrition.protein.toFixed(2)} protein, ${ingredient.nutrition.fat.toFixed(2)} fat, ${ingredient.nutrition.fiber.toFixed(2)} fiber`
        ).join('\n');
        // Display the ingredients
        alert('Ingredients:\n' + ingredientsStr);
    });
    // Add the button to the cell
    buttonCell.appendChild(button);
    createMeal(mealData);
    closeMealCreator();
};

function displayMealsFromLocalStorage() {
    // Get all keys from local storage
    const keys = Object.keys(localStorage);

    // Find the table in the mealCreator div
    let mealTable = document.querySelector(".mealCreator table tbody");
    // For each key in local storage
    keys.forEach(key => {
        // Get the meal data from local storage
        const mealData = JSON.parse(localStorage.getItem(key));
        console.log(mealData);
        // Create a new row and add it to the table
        let row = mealTable.insertRow();
        row.insertCell().textContent = mealTable.rows.length; // # column
        row.insertCell().textContent = mealData.name; // Meal Name column
        row.insertCell().textContent = mealData.numIngredients;
        row.insertCell().textContent = `${mealData.nutrition.kcal.toFixed(2)} kcal, ${mealData.nutrition.protein.toFixed(2)} protein, ${mealData.nutrition.fat.toFixed(2)} fat, ${mealData.nutrition.fiber.toFixed(2)} fiber`;
        row.insertCell().textContent = mealData.addedOn; // Date column

        // Add a new cell for the button
        let buttonCell = row.insertCell();
        // Create a button element
        let button = document.createElement('button');
        // Set the button text
        button.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        // Add an event listener to the button
        button.addEventListener('click', () => {
            // Create a string with the ingredients
            let ingredientsStr = mealData.ingredients.map(ingredient =>
                `${ingredient.name}: ${ingredient.weight}g, ${ingredient.nutrition.kcal.toFixed(2)} kcal, ${ingredient.nutrition.protein.toFixed(2)} protein, ${ingredient.nutrition.fat.toFixed(2)} fat, ${ingredient.nutrition.fiber.toFixed(2)} fiber`
            ).join('\n');
            // Display the ingredients
            alert('Ingredients:\n' + ingredientsStr);
        });
        // Add the button to the cell
        buttonCell.appendChild(button);
    });
}

// Call the function when the document is loaded
document.addEventListener('DOMContentLoaded', displayMealsFromLocalStorage);


async function createMeal(mealData) {

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token missing');
        return;
    }

    const response = await fetch('http://localhost:3000/items/mealCreator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token,

        },
        body: JSON.stringify(mealData)
    })
    if (!response.ok) {
        console.Error('Failed to create meals')
        return;
    }
    const data = await response.json();
    const meal_ID = data.meal_ID
    console.log('mealid', meal_ID);
document.getElementById('mealIDHidden').value = meal_ID;  //Gemmer mealID'et lokalt i html siden i det gemte input mealIDHidden

    return meal_ID;
    
}

async function createMealIngredient(ingredientData) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token missing');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/items/mealIngredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify(ingredientData)
        });

        if (!response.ok) {
            console.error('Failed to create meal ingredient');
            return;
        }

        const data = await response.json();
        console.log(data.rowsAffected);
    } catch (error) {
        console.error('Error creating meal ingredient:', error);
    }
}