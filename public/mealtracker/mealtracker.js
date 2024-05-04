document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const btn = document.getElementById("addIngredient");
    const span = document.getElementsByClassName("close")[0];

    btn.onclick = function () {
        modal.style.display = "block";
    }

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const addIngredientBtn = document.getElementById("addIngredientBtn");
    addIngredientBtn.addEventListener('click', async function () {
        const selectedIngredient = document.getElementById('searchResults').value;
        const weight = document.getElementById('Weight').value;
        const table = document.querySelector('table tbody');
        const row = document.createElement('tr');
        const date = new Date(); // dato og tidspunkt ved jeg ikke helt hvad man skal gøre med databasen
        const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(async position => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoordinates(latitude, longitude)

                // Fetch nutrition information
                const nutrition = await fetchNutrition(selectedIngredient);

                // Calculate nutrition values based on weight
                const weightInGrams = parseFloat(weight);
                const kcal = (nutrition.kcal * weightInGrams) / 100;
                const protein = (nutrition.protein * weightInGrams) / 100;
                const fat = (nutrition.fat * weightInGrams) / 100;
                const fiber = (nutrition.fiber * weightInGrams) / 100;

                const ingredientData = {
                    name: selectedIngredient,
                    date: dateString,
                    address: address,
                    weight: weight,
                    nutrition: {
                        kcal: kcal.toFixed(2),
                        protein: protein.toFixed(2),
                        fat: fat.toFixed(2),
                        fiber: fiber.toFixed(2),
                    },
                };
                // Fetch existing ingredients from local storage
                let ingredientsDataJson = localStorage.getItem('ingredientsdata');
                let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

                // Add new ingredient to the list
                ingredientsData.push(ingredientData);

                // Save the list back to local storage
                localStorage.setItem('ingredientsdata', JSON.stringify(ingredientsData));

                row.innerHTML = `
            <td>${table.childElementCount + 1}</td>
            <td>${selectedIngredient}</td>
            <td>${dateString}</td>
            <td>${address}</td>
            <td>${weight}</td>
            <td>${kcal.toFixed(2)} kcal, ${protein.toFixed(2)} protein, ${fat.toFixed(2)} fat, ${fiber.toFixed(2)} fiber</td>
            <td><i class="fa fa-pencil" onclick="editMeal(${table.childElementCount})"></i>
            <i class="fa fa-trash" onclick="deleteMeal(${table.childElementCount})"></i> </td>`;

                table.appendChild(row);
            });
        }
    });




    //funktion der sletter et tracked måltid fra tabellen.
    /*function deleteMeals() {
        const mealIndex = meals.findIndex(meal => meal.id === mealId);
    }*/

    async function getAddressFromCoordinates(latitude, longitude) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();

        if (data.address) {
            const { amenity, town, postcode, country } = data.address;
            return `${amenity}, ${town}, ${postcode}, ${country}`;
        } else {
            return null;
        }
    }

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
            id: ingredient.ingredient_ID,
            kcal: ingredient.kcal,
            protein: ingredient.protein,
            fat: ingredient.fat,
            fiber: ingredient.fiber,
        };
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFoodInput');
    searchInput.addEventListener('input', async () => {
        try {
            await foodFetch();
            console.log('Fetch request successful');
        } catch (error) {
            console.error('Error during fetch request:', error);
        }
    });
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
        const searchFoodInput = document.getElementById('searchFoodInput');
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



async function getMealsFromMealCreator(mealname, meal_ID) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input('mealname', sql.varchar, mealname)
    request.input('meal_ID', sql.Int, meal_ID)

    const result = await request.query('SELECT Meals.meal_ID, mealname FROM Nutri.Meals');

    return result.recordsets[0];
};

document.addEventListener('DOMContentLoaded', () => {
    function displayIngredientsFromLocalStorage() {
        // Get the ingredient data from local storage
        const ingredientsDataJson = localStorage.getItem('ingredientsdata');
        if (!ingredientsDataJson) {
            console.log('No ingredient data found in local storage');
            return;
        }
        const ingredientsData = JSON.parse(ingredientsDataJson);

        // Find the table in the mealCreator div
        let mealTable = document.querySelector("table tbody");

        // Check if mealTable is not null
        if (mealTable) {
            // Loop through each ingredient in the ingredientsData array
            ingredientsData.forEach((ingredient, index) => {
                // Create a new row and add it to the table
                let row = mealTable.insertRow();
                row.insertCell().textContent = index + 1; // # column
                row.insertCell().textContent = ingredient.name; // Ingredient Name column
                row.insertCell().textContent = ingredient.date; // Date column
                row.insertCell().textContent = ingredient.address; // Address column
                row.insertCell().textContent = ingredient.weight; // Weight column
                row.insertCell().textContent = `${ingredient.nutrition.kcal} kcal, ${ingredient.nutrition.protein} protein, ${ingredient.nutrition.fat} fat, ${ingredient.nutrition.fiber} fiber`; // Nutrition column

                // Add a new cell for the button
                let buttonCell = row.insertCell();
                // Create a button element
                let button = document.createElement('button');
                // Set the button text
                button.textContent = 'Edit';
                // Add an event listener to the button
                button.addEventListener('click', () => {
                    // TODO: Add code to edit the ingredient
                });
                // Add the button to the cell
                buttonCell.appendChild(button);

                // Create a button element for delete
                let deleteButton = document.createElement('button');
                // Set the button text
                deleteButton.textContent = 'Delete';
                // Add an event listener to the button
                deleteButton.addEventListener('click', () => {
                    // TODO: Add code to delete the ingredient
                });
                // Add the button to the cell
                buttonCell.appendChild(deleteButton);
            });
        } else {
            console.log('No table found with the selector ".mealTracker table tbody"');
        }
    }

    // Call the function when the document is loaded
    displayIngredientsFromLocalStorage();
});


async function getWeightAndTotalNutritionFromMealTracker(weight, totalKcal, totalFat, totalFiber, totalProtein) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token missing');
        return;
    }
    const nutritionData = {
        weight: weight,
        totalKcal: totalKcal,
        totalFat: totalFat,
        totalFiber: totalFiber,
        totalProtein: totalProtein
    };
    const response = await fetch('http://localhost:3000/items/mealTracker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token,

        },
        body: JSON.stringify(nutritionData)
    })
    if (!response.ok) {
        console.Error('Failed to create meals')
        return;
    }
    const data = await response.json();
    console.log(data.rowsAffected);
};