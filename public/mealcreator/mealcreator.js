let totalKcal = 0;
let totalProtein = 0;
let totalFat = 0;
let totalFiber = 0;
let meals = []; // List of meals, each meal is a list of ingredients
let currentMeal = []; // List of ingredients for the current meal


function openMealNameModal() {
    document.getElementById("mealNameModal").style.display = "block";
}

// Close Meal Name Modal
function closeMealNameModal() {
    document.getElementById("mealNameModal").style.display = "none";
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

    // Check if selectedFoodItem or weight is empty
    if (!selectedFoodItem.trim() || !weight.trim()) {
        alert('Please select a food item and enter its weight');
        return; // Exit the function early if any input is empty
    }


    // Fetch nutrition information
    const nutrition = await fetchNutrition(selectedFoodItem);

    // Calculate nutrition values based on weight
    const weightInGrams = parseFloat(weight);
    const kcal = (nutrition.kcal * weightInGrams) / 100;
    const protein = (nutrition.protein * weightInGrams) / 100;
    const fat = (nutrition.fat * weightInGrams) / 100;
    const fiber = (nutrition.fiber * weightInGrams) / 100;

    // Opdater de globale totaler
    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalFiber += fiber;

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

};

document.getElementById("SubmitButtonID").addEventListener("click", addMealToTable);

async function addMealToTable() {
    // Add the current meal to the list of meals
    meals.push(currentMeal);

    try {
        // Call the updateMealID function to update the meal ID
        const meal_ID = await updateMealID(document.getElementById('mealIDHidden').value);
    } catch (error) {
        console.error('Error submitting meal name:', error);
    }

    // Nulstil de globale totaler for det næste måltid
    totalKcal = 0;
    totalProtein = 0;
    totalFat = 0;
    totalFiber = 0;

    // Reset the current meal for the next meal
    currentMeal = [];

    closeMealCreator();
    window.location.reload();
};

// Submit Meal Name
async function submitMealName() {
    // Close the modal
    closeMealNameModal();
    openMealCreator();
    
    try {
        // Call adam function to create the meal and get the meal_ID
        const meal_ID = await adam();
        // Remove any existing value in the hidden input field
        document.getElementById('mealIDHidden').value = '';
        // Set the meal_ID in the hidden input field
        document.getElementById('mealIDHidden').value = meal_ID;
    } catch (error) {
        console.error('Error submitting meal name:', error);
    }
}

async function adam() {
    let mealName = document.getElementById("mealNameInput").value;
    let mealWeight = document.getElementById("mealWeightInput").value;
    const mealData = {
        mealname: mealName,
        weight: mealWeight,
        totalKcal: totalKcal,
        totalProtein: totalProtein,
        totalFat: totalFat,
        totalFiber: totalFiber,
        mealTime: new Date()
    }

    try {
        // Create the meal and get the meal_ID
        const meal_ID = await createMeal(mealData);

        // Return the meal_ID
        return meal_ID;
    } catch (error) {
        console.error('Error creating meal:', error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

async function updateMealID(meal_ID) {
    try {
        // Retrieve meal data from the current meal
        const mealName = document.getElementById("mealNameInput").value;
        const mealWeight = document.getElementById("mealWeightInput").value;
        const mealData = {
            mealname: mealName,
            weight: mealWeight,
            totalKcal: totalKcal.toFixed(2),
            totalProtein: totalProtein.toFixed(2),
            totalFat: totalFat.toFixed(2),
            totalFiber: totalFiber.toFixed(2),
            mealTime: new Date()
        };

        // Update the meal with the given meal_ID
        await updateMeals(mealData, meal_ID);

        // Set the meal_ID in the hidden input field
        document.getElementById('mealIDHidden').value = meal_ID;
    } catch (error) {
        console.error('Error updating meal ID:', error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

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
            console.error('HTTP error');
            return;
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error creating meal ingredient:', error);
    }
}

let ingredients;

async function fetchAllIngredients() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token missing');
            return;
        }

        const response = await fetch('http://localhost:3000/items/ingredients', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ingredients');
        }

        ingredients = await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function fetchUserMeals() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token missing');
            return;
        }

        const response = await fetch('http://localhost:3000/items/userMeals', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        const latestMeals = data.userMeals.reduce((acc, meal) => {
            if (!acc[meal.mealname] || meal.meal_ID > acc[meal.mealname].meal_ID) {
                acc[meal.mealname] = meal;
            }
            return acc;
        }, {});

        const uniqueMeals = Object.values(latestMeals);

        // Fetch all ingredients if not already fetched
        if (!ingredients) {
            await fetchAllIngredients();
        }

        // Log ingredient ids
        uniqueMeals.forEach(meal => {
            if (meal.ingredient_IDs) { // Assuming meal.ingredient_IDs is a list of ingredient IDs
                meal.ingredient_IDs.forEach(ingredient_ID => {
                    const foundIngredient = ingredients.allIngredients.find(ingredient => ingredient.ingredient_ID === ingredient_ID);
        
                    if (foundIngredient) {
                        console.log(foundIngredient.ingredient_ID);
                    } else {
                        console.log('Ingen ingrediens fundet med id:', ingredient_ID);
                    }
                });
            } else {
                console.log('Ingen ingrediens ID fundet for måltidet:', meal.mealname);
            }
        });
        displayMeals(uniqueMeals);
    } catch (error) {
        console.error(error);
    }
}

async function updateMeals(mealData, mealID) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token missing');
            return;
        }

        const response = await fetch('http://localhost:3000/items/updateMeals', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                mealData: mealData,
                mealID: mealID
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update meal');
        }

        const data = await response.json();
        console.log(data.message); // Log the response message
    } catch (error) {
        console.error('Error updating meals:', error);
    }
}

async function callUpdateMeals() {
    const mealData = await adam(); // Ensure adam() returns the correct mealData
    const mealID = document.getElementById('mealIDHidden').value; // Correctly retrieve the mealID
    await updateMeals(mealData, mealID); // Pass the mealData and mealID to updateMeals
}



function displayMeals(meals) {
    const mealTableBody = document.querySelector('.mealCreator table tbody');
    mealTableBody.innerHTML = ''; // Clear previous content
console.log(meals, 'fck');
    meals.forEach((meal, index) => {
        const row = mealTableBody.insertRow();
        row.insertCell().textContent = index + 1; // # column
        row.insertCell().textContent = meal.mealname; // Meal Name column
        row.insertCell().textContent = `Kcal: ${meal.totalKcal.toFixed(2)}, Protein: ${meal.totalProtein.toFixed(2)}, Fat: ${meal.totalFat.toFixed(2)}, Fiber: ${meal.totalFiber.toFixed(2)}`;
        console.log(meal);
        row.insertCell().textContent = meal.mealTime ? new Date(meal.mealTime).toLocaleString() : 'N/A'; // Added on column

        // Create a new button element
        const button = document.createElement('button');
        button.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';

        // When the button is clicked, open a modal showing the ingredients
        button.addEventListener('click', () => {
            const foundIngredient = ingredients.allIngredients.find(ingredient => ingredient.ingredient_ID === meal.ingredient_ID);
            console.log('Meal object:', meal);
            // Create a new modal element
            const modal = document.createElement('div');
            modal.classList.add('modal');
        
            // Create a new content element for the modal
            const content = document.createElement('div');
            content.classList.add('modal-content');
        
            // Add the ingredient information to the modal content
            if (foundIngredient) {
                content.innerHTML = `
                    <p>Ingrediensnavn: ${foundIngredient.ingredientname}</p>
                    <p>Vægt: ${meal.ingredientweight}</p>
                    <p>Fedt: ${meal.weightFat.toFixed(2)}</p>
                    <p>Fiber: ${meal.weightFiber.toFixed(2)}</p>
                    <p>Kcal: ${meal.weightKcal.toFixed(2)}</p>
                    <p>Protein: ${meal.weightProtein.toFixed(2)}</p>
                `;
            } else {
                content.textContent = 'Ingen ingrediens fundet';
            }
        
            // Add the content to the modal
            modal.appendChild(content);
        
            // Add the modal to the body
            document.body.appendChild(modal);
        
            // When the modal is clicked, remove it
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Add the button to the row
        row.appendChild(button);
    });
}

// Call the function when the document is loaded
document.addEventListener('DOMContentLoaded', fetchUserMeals);