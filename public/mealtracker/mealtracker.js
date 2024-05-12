document.addEventListener("DOMContentLoaded", function () {
    // Fetch food data based on search input
    const searchInput = document.getElementById('searchFoodInput');
    searchInput.addEventListener('input', async () => {
        try {
            await foodFetch();
        } catch (error) {
            console.error('Error during fetch request:', error);
        }
    });

    // Open modal when "Add Ingredient" button is clicked
    const btn = document.getElementById("addIngredient");
    btn.onclick = function () {
        const modal = document.getElementById("myModal");
        modal.style.display = "block";
    }

    // Close modal when the close button is clicked
    const span = document.getElementsByClassName("close")[1];
    span.onclick = function () {
        const modal = document.getElementById("myModal");
        modal.style.display = "none";
    }

    // Close modal when clicked outside the modal
    window.onclick = function (event) {
        const modal = document.getElementById("myModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Get the close button
    const closeBtn = document.getElementById('closeBtn');

    // When the user clicks on the close button, close the modal
    closeBtn.onclick = function () {
        document.getElementById('waterModal').style.display = "none";
    }

    async function fetchAllIngredients() {
        const response = await fetch('http://localhost:3000/items/ingredients');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allIngredients = await response.json();
        return allIngredients;
    }

    const waterModal = document.getElementById('waterModal');
    const waterIngredientList = document.getElementById('waterIngredientList');
    const addWaterBtn = document.getElementById('addWater');

    addWaterBtn.addEventListener('click', async function () {
        // Get water amount
        const waterVolume = document.getElementById('waterAmount').value;

        // Get water ingredient name and time
        const waterName = waterIngredientList.textContent;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth is zero-based, so add 1
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const waterTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Get user ID
        const user_ID = localStorage.getItem('user_ID'); // Assuming you store user ID in localStorage
        const token = localStorage.getItem('token');
        // Create new water data
        const newWaterData = {
            waterName: waterName,
            waterVolume: waterVolume,
            waterTime: waterTime,
            user_ID: user_ID
        };

        // Send new water data to the server
        const response = await fetch('http://localhost:3000/items/addWater', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token, // Assuming you store your JWT token in localStorage
            },
            body: JSON.stringify(newWaterData)
        });

        if (!response.ok) {
            console.error('Failed to save water data', response);
        }

        // Close the modal
        waterModal.style.display = "none";
    });

    const waterBtn = document.getElementById('addWaterBtn'); // The button that opens the modal

    waterBtn.addEventListener('click', async function () {
        waterModal.style.display = "block";

        // Fetch all ingredients
        const allIngredients = await fetchAllIngredients();

        // Find water ingredient
        const allArrays = Object.values(allIngredients).flat();
        const water = allArrays.find(ingredient => ingredient.ingredient_ID === 53);

        // Display water ingredient in the modal
        waterIngredientList.textContent = water.ingredientname;

        document.getElementById('waterTime').textContent = getDate();
    });


    addWaterBtn.addEventListener('click', function () {
        // Get water amount
        const waterAmount = document.getElementById('waterAmount').value;

        // Get water ingredient name and time
        const ingredientname = waterIngredientList.textContent;
        const waterTime = document.getElementById('waterTime').textContent;

        // Create new water data
        const newWaterData = {
            ingredientname: ingredientname,
            waterAmount: waterAmount,
            waterTime: waterTime
        };

        // Get existing water data from localStorage
        const existingWaterData = JSON.parse(localStorage.getItem('waterData')) || [];

        // Add new water data to existing water data
        existingWaterData.push(newWaterData);

        // Save existing water data back to localStorage
        localStorage.setItem('waterData', JSON.stringify(existingWaterData));

        // Close the modal
        waterModal.style.display = "none";
    });

    // Add ingredient when "Add" button inside the modal is clicked
    const addIngredientBtn = document.getElementById("addIngredientBtn");
    addIngredientBtn.addEventListener('click', async function () {
        try {
            const selectedIngredient = document.getElementById('searchResults').value;
            const weight = document.getElementById('Weight').value;

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
                date: getDate(),
                address: await getAddress(),
                weight: weight,
                nutrition: {
                    kcal: kcal.toFixed(2),
                    protein: protein.toFixed(2),
                    fat: fat.toFixed(2),
                    fiber: fiber.toFixed(2),
                },
            };

            // Add ingredient to the list and save to local storage
            addIngredientToLocalStorage(ingredientData);

            // Display ingredient in the table
            displayIngredientInTable(ingredientData);

            // Close the modal
            const modal = document.getElementById("myModal");
            modal.style.display = "none";
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    });

    // Fetch and display user meals
    fetchUserMeals();
});

// Fetch food data based on search input
async function foodFetch() {
    const response = await fetch('http://localhost:3000/items/ingredients');
    if (!response.ok) {
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
}

// Fetch nutrition information for the selected ingredient
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

// Get current date and time
function getDate() {
    const date = new Date();
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// Get address based on geolocation
async function getAddress() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            if (data.address) {
                const { town, postcode, country } = data.address;
                resolve(`${town}, ${postcode}, ${country}`);
            } else {
                reject('Address not found');
            }
        }, error => reject(error));
    });
}

// Add ingredient to local storage
function addIngredientToLocalStorage(ingredientData) {
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];
    ingredientsData.push(ingredientData);
    localStorage.setItem('ingredientsdata', JSON.stringify(ingredientsData));
}

// Display ingredient in the table
function displayIngredientInTable(ingredientData) {
    const table = document.querySelector('table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${table.childElementCount + 1}</td>
        <td>${ingredientData.name}</td>
        <td>${ingredientData.date}</td>
        <td>${ingredientData.address}</td>
        <td>${ingredientData.weight}</td>
        <td>${ingredientData.nutrition.kcal} kcal, ${ingredientData.nutrition.protein} protein, ${ingredientData.nutrition.fat} fat, ${ingredientData.nutrition.fiber} fiber</td>
        <td>
            <button id="delete-btn">Delete</button>
        </td>`;
    table.appendChild(row);
    const deleteButton = row.querySelector('#delete-btn');
    deleteButton.addEventListener('click', () => {
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        removeFromLocalStorageAndTable(rowIndex);
    });
}
window.onload = function () {
    // Display Ingredients
    displayIngredientsFromLocalStorage();

    // Display Meals
    displayMealsFromLocalStorage();
};

// Function to display ingredients from local storage
function displayIngredientsFromLocalStorage() {
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

    ingredientsData.forEach(ingredientData => {
        displayIngredientInTable(ingredientData);
    });
}

// Function to display meals from local storage
function displayMealsFromLocalStorage() {
    let mealsDataJson = localStorage.getItem('meals');
    let mealsData = mealsDataJson ? JSON.parse(mealsDataJson) : [];

    mealsData.forEach(mealData => {
        displayMealInTable(mealData);
    });
}


function removeFromLocalStorageAndTable(index) {
    // Remove ingredient from local storage
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

    if (index >= 0 && index < ingredientsData.length) {
        ingredientsData.splice(index, 1);
        localStorage.setItem('ingredientsdata', JSON.stringify(ingredientsData));
    } else {
        console.error('Index out of bounds.');
        return;
    }

    // Remove row from the table
    const rows = document.querySelectorAll('table tbody tr');
    if (index >= 0 && index < rows.length) {
        rows[index].remove();
    } else {
        console.error('Index out of bounds.');
    }
}

// Remove meal from local storage and update display
function removeMealFromLocalStorageAndTable(index) {
    let mealsDataJson = localStorage.getItem('meals');
    let mealsData = mealsDataJson ? JSON.parse(mealsDataJson) : [];

    if (index >= 0 && index < mealsData.length) {
        mealsData.splice(index, 1);
        localStorage.setItem('meals', JSON.stringify(mealsData));
    } else {
        console.error('Index out of bounds.');
        return;
    }

    // Update display
    const rows = document.querySelectorAll('table tbody tr');
    if (index >= 0 && index < rows.length) {
        rows[index].remove();
    } else {
        console.error('Index out of bounds.');
    }
}
document.getElementById('addMeal').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    // Fetch user meals only when the modal is opened for adding a new meal
    fetchUserMeals();
});

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

        console.log(data);
        const latestMeals = data.userMeals.reduce((acc, meal) => {
            // Tjek om der allerede er et måltid med samme navn i akkumulatoren
            if (!acc[meal.mealname] || meal.meal_ID > acc[meal.mealname].meal_ID) {

                // Opdater kun akkumulatoren hvis det aktuelle måltids-ID er større end det gemte
                acc[meal.mealname] = meal;
            }
            return acc;
        }, {});

        const uniqueMeals = Object.values(latestMeals);

        // Kalder displayMeals med de filtrerede måltider
        displayMeals(uniqueMeals);
    } catch (error) {
        console.error(error);
    }
}

function displayMeals(meals) {
    const mealListDiv = document.getElementById('mealList');
    mealListDiv.innerHTML = ''; // Clear previous content

    meals.forEach(meal => {
        const button = document.createElement('button');
        button.textContent = meal.mealname;
        button.classList.add('mealListButton');
        button.addEventListener('click', () => {
            openMealModal(meal);

            console.log('Clicked on meal:', meal);
        });
        mealListDiv.appendChild(button);
    });
}

function openMealModal(meal) {
    // Implement logic to open a modal with meal details
    const modal = document.getElementById('mealModal');
    const modalContent = document.getElementById('mealModalContent');

    // Set modal content with meal details
    modalContent.innerHTML = `
        <h2>${meal.mealname}</h2>
        <p class="modal-label">Kalories</p>
        <input type="number" class="modal-input" value="${meal.totalKcal}" placeholder="Total Kcal" readonly>
        <p class="modal-label">Protein</p>
        <input type="number" class="modal-input" value="${meal.totalProtein}" placeholder="Total Protein" readonly>
        <p class="modal-label">Fedt</p>
        <input type="number" class="modal-input" value="${meal.totalFat}" placeholder="Total Fat" readonly>
        <p class="modal-label">Fiber</p>
        <input type="number" class="modal-input" value="${meal.totalFiber}" placeholder="Total Fiber" readonly>
        <p class="modal-label">Dato</p>
        <input type="text" class="modal-input" value="${getDate()}" placeholder="Date" readonly>
        <button id="submitMealBtn">Submit</button>
        <button id="closeMealModalBtn">Close</button>
    `;

    // Display modal
    modal.style.display = 'block';

    const submitBtn = document.getElementById('submitMealBtn');
    submitBtn.addEventListener('click', () => {
        displayMealInTable(meal);
    
        // Save the meal to local storage
        const mealsData = JSON.parse(localStorage.getItem('meals')) || [];
        mealsData.push(meal);
        localStorage.setItem('meals', JSON.stringify(mealsData));
    
        const modal = document.getElementById('mealModal');
        const mealListDiv = document.getElementById('modal');
        modal.style.display = 'none';
        mealListDiv.style.display = 'none';
    });
    
    const closeBtn = document.getElementById('closeMealModalBtn');
    closeBtn.addEventListener('click', () => {
        // Implement logic to close the modal
        modal.style.display = 'none';
    });
}

function openEditModal(meal) {
    // Implement logic to open a modal with meal details
    const modal = document.getElementById('mealModalEdit');
    const modalContent = document.getElementById('mealModalContentEdit');
    document.getElementById('mealIDHidden').value = meal.meal_ID;
    // Set modal content with meal details
    modalContent.innerHTML = `
        <h2>Rediger dit måltid: <br> ${meal.mealname}</h2>
        <p class="modal-label">Weight</p>
        <input type="number" class="modal-input" id="weightEdit" value="${meal.weight}" placeholder="Weight">
        <p class="modal-label">Kalories</p>
        <input type="number" class="modal-input" id="totalKcalEdit" value="${meal.totalKcal}" placeholder="Total Kcal">
        <p class="modal-label">Protein</p>
        <input type="number" class="modal-input" id="totalProteinEdit" value="${meal.totalProtein}" placeholder="Total Protein">
        <p class="modal-label">Fedt</p>
        <input type="number" class="modal-input" id="totalFatEdit" value="${meal.totalFat}" placeholder="Total Fat">
        <p class="modal-label">Fiber</p>
        <input type="number" class="modal-input" id="totalFiberEdit" value="${meal.totalFiber}" placeholder="Total Fiber">
        <p class="modal-label">Dato</p>
        <input type="text" class="modal-input" value="${getDate()}" placeholder="Date" readonly>
        <button id="submitMealEditBtn">Submit</button>
        <button id="closeMealModalEditBtn">Close</button>
    `;

    // Display modal
    modal.style.display = 'block';

    const submitBtn = document.getElementById('submitMealEditBtn');
    submitBtn.addEventListener('click', async () => {
        try {
            // Get updated meal data from the modal inputs
            const updatedMeal = {
                mealname: meal.mealname,
                weight: parseInt(document.getElementById('weightEdit').value),
                totalKcal: parseFloat(document.getElementById('totalKcalEdit').value),
                totalProtein: parseFloat(document.getElementById('totalProteinEdit').value),
                totalFat: parseFloat(document.getElementById('totalFatEdit').value),
                totalFiber: parseFloat(document.getElementById('totalFiberEdit').value),
                // Add other properties if needed
            };

            // Update the meal in the table
            updateMealInTable(updatedMeal);

            await updateMeals(updatedMeal, meal.mealID);
            // Close the edit modal
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error updating meal:', error);
        }
    });
    const closeBtn = document.getElementById('closeMealModalEditBtn');
    closeBtn.addEventListener('click', () => {
        // Implement logic to close the modal
        modal.style.display = 'none';
    });
}

function updateMealInTable(updatedMeal) {
    // Find the row corresponding to the updated meal
    const table = document.querySelector('table tbody');
    const rows = table.querySelectorAll('tr');
    const rowToUpdate = Array.from(rows).find(row => row.cells[1].textContent === updatedMeal.mealname);

    if (rowToUpdate) {
        // Update the meal details in the table row
        rowToUpdate.cells[4].textContent = `${updatedMeal.weight}`
        rowToUpdate.cells[5].textContent = `${updatedMeal.totalKcal} kcal, ${updatedMeal.totalProtein} g, ${updatedMeal.totalFat} g, ${updatedMeal.totalFiber} g`;
    } else {
        console.error('Row not found for meal:', updatedMeal.mealname);
    }
    const mealID = document.getElementById('mealIDHidden').value;
    console.log(updatedMeal, "id", mealID);
    // Call the function to update the meal in the database
    updateMeals(updatedMeal, mealID);
}

async function displayMealInTable(meal) {
    const table = document.querySelector('table tbody');
    const row = document.createElement('tr');

    // Get location from browser
    let address = 'Address not available';
    try {
        address = await getAddress();
    } catch (error) {
        console.error(error);
    }

    row.innerHTML = `
        <td>${table.childElementCount + 1}</td>
        <td>${meal.mealname}</td>
        <td>${getDate()}</td>
        <td>${address}</td>
        <td>${meal.weight}</td>
        <td> ${meal.totalKcal} kcal, ${meal.totalProtein} g, ${meal.totalFat} g, ${meal.totalFiber} g </td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </td>`;
    table.appendChild(row);

    const editButton = row.querySelector('.edit-btn');
    editButton.addEventListener('click', () => {
        openEditModal(meal);
    });
    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        removeMealFromLocalStorageAndTable(rowIndex);
    });
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

document.getElementById('addMeal').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    fetchUserMeals(); // Load meals when modal is opened
});

document.getElementsByClassName('close')[0].addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});

