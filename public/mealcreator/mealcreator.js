let totalKcal = 0;
let totalProtein = 0;
let totalFat = 0;
let totalFiber = 0;
 
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
    return {
        kcal: ingredient.kcal,
        protein: ingredient.protein,
        fat: ingredient.fat,
        fiber: ingredient.fiber,
    };
};

const addIngredientButton = document.getElementById('addIngredient');
if (addIngredientButton) {
    addIngredientButton.addEventListener('click', addIngredientToMeal);
}

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

    // Find the table inside ingredientsBox
    let ingredientsTable = document.querySelector("#ingredientsBox table tbody");
    // Fetch nutrition information
    const nutrition = await fetchNutrition(selectedIngredient);

    // Calculate nutrition values based on weight
    const weightInGrams = parseFloat(weight);
    const kcal = (nutrition.kcal * weightInGrams) / 100;
    const protein = (nutrition.protein * weightInGrams) / 100;
    const fat = (nutrition.fat * weightInGrams) / 100;
    const fiber = (nutrition.fiber * weightInGrams) / 100;

    // Opret en ny række og tilføj den til tabellen
    let row = ingredientsTable.insertRow();
    row.insertCell().textContent = ingredientsTable.rows.length; // # column
    row.insertCell().textContent = selectedFoodItem; // Ingredient Name column
    row.insertCell().textContent = weight; // Weight column
    row.insertCell().textContent = `${kcal.toFixed(2)} kcal, ${protein.toFixed(2)} protein, ${fat.toFixed(2)} fat, ${fiber.toFixed(2)} fiber`; // Nutrition column

    // Opdater de globale totaler
    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalFiber += fiber;
};

document.getElementById("SubmitButtonID").addEventListener("click", addMealToTable);

function addMealToTable() {
    // Find tabellen i mealCreator div
    let mealTable = document.querySelector(".mealCreator table tbody");

    // Hent måltidsnavnet fra input feltet
    let mealName = document.getElementById("mealNameID").value;

    // Hent antallet af ingredienser fra ingredientsBox
    let numIngredients = document.querySelector("#ingredientsBox table tbody").rows.length;
    closeMealCreator();
    // Opret en ny række og tilføj den til tabellen
    let row = mealTable.insertRow();
    row.insertCell().textContent = mealTable.rows.length; // # kolonne
    row.insertCell().textContent = mealName; // Meal Name kolonne (opdater denne værdi som nødvendigt)
    row.insertCell().textContent = numIngredients; // # Ingredients kolonne (opdater denne værdi som nødvendigt)
    row.insertCell().textContent = `${totalKcal.toFixed(2)} kcal, ${totalProtein.toFixed(2)} protein, ${totalFat.toFixed(2)} fat, ${totalFiber.toFixed(2)} fiber`;
    row.insertCell().textContent = 'Added on'; // Added on kolonne (opdater denne værdi som nødvendigt)

     // Nulstil de globale totaler for det næste måltid
     totalKcal = 0;
     totalProtein = 0;
     totalFat = 0;
     totalFiber = 0;
};



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
    console.log(data.rowsAffected);
}

