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

        // ressult.addEventListener('change', function () {
        //     const selectedIngredient = data.allIngredients.find(ingredient => ingredient.ingredientname === this.value);

        //     if (selectedIngredient) {
        //         document.getElementById('productID').textContent = '' + selectedIngredient.ingredient_ID;
        //         document.getElementById('energyKcal').textContent = 'Kcal: ' + selectedIngredient.kcal;
        //         document.getElementById('protein').textContent = 'Protein: ' + selectedIngredient.protein;
        //         document.getElementById('fat').textContent = 'Fat: ' + selectedIngredient.fat;
        //         document.getElementById('fiber').textContent = 'Fiber: ' + selectedIngredient.fiber;
        //     }
        // }); 
    } catch (error) {
        throw new Error('Error fetching data:' + error.toString());
    }
};

async function addIngredientToMeal() {
    let selectedFoodItem = document.getElementById("searchResults");
    console.log(selectedFoodItem.value);
    let weight = document.getElementById('mealWeight').value;
    console.log(weight);


    //En div laves for de valgte ingredienser:
    let chosenfoodDiv = document.getElementById("chosenFoodDivID");

    let selectedFoodDiv = document.createElement("div");
};

async function addIngredientToMeal() {
    let selectedFoodItem = document.getElementById("searchResults");
    let weight = document.getElementById('mealWeight').value;

    // Find tabellen inde i ingredientsBox
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
    row.insertCell().textContent = ingredientsTable.rows.length; // # kolonne
    row.insertCell().textContent = selectedFoodItem.value; // Ingredient Name kolonne
    row.insertCell().textContent = weight; // Weight kolonne
    row.insertCell().textContent = 'Nutrition'; // Nutrition kolonne (opdater denne værdi som nødvendigt)
};
document.getElementById("addIngredient").addEventListener("click", addIngredientToMeal);

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
    row.insertCell().textContent = 'Nutrition'; // Nutrition kolonne (opdater denne værdi som nødvendigt)
    row.insertCell().textContent = 'Added on'; // Added on kolonne (opdater denne værdi som nødvendigt)
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

