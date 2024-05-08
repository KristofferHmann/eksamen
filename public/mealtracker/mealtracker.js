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

    const waterBtn = document.getElementById('addWaterBtn');
    const waterModal = document.getElementById('waterModal');
    const waterIngredientList = document.getElementById('waterIngredientList');

    waterBtn.addEventListener('click', async function () {
        waterModal.style.display = "block";

        // Fetch all ingredients
        const allIngredients = await fetchAllIngredients();

        // Find water ingredient
        const allArrays = Object.values(allIngredients).flat();
        const water = allArrays.find(ingredient => ingredient.ingredient_ID === 53);

        // Display water ingredient in the modal
        waterIngredientList.textContent = water.ingredientname;

        document.getElementById('waterTime').textContent = 'Added on: ' + getDate();
    });

    const addWaterBtn = document.getElementById('addWater');

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
            <button class="edit-btn">Edit</button>
            <button id="delete-btn">Delete</button>
        </td>`;
    table.appendChild(row);
}
window.onload = function () {
    // Hent alle ingredienser fra lokal lagring
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

    // Vis hver ingrediens i tabellen
    ingredientsData.forEach(ingredientData => {
        displayIngredientInTable(ingredientData);
    });

    // Gennemgang af alle rækker i tabellen
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach((row, index) => {
        // Finder "Delete" knappen i rækken
        const deleteButton = row.querySelector('#delete-btn');

        // Tilføjer event listener til "Delete" knappen
        deleteButton.addEventListener('click', () => {
            // Fjerner ingrediensen fra lokal lagring
            removeFromLocalStorageAndTable(index);
        });
    });
};

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
            body: JSON.stringify()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}, Status Text: ${response.statusText}`);
        }
        

        const data = await response.json();
        console.log(data);
        // const uniqueMeals = data.getUserMeals.filter((meal, index, self) =>
        //     index === self.findIndex((t) => t.meal_ID === meal.meal_ID)
        // );
        // Call the loadMeals function with the retrieved data
        displayMeals(data.getUserMeals);
    } catch (error) {
        console.error(error);
        // Handle errors
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
            // Implement logic to handle when a meal button is clicked
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

function displayMealInTable(meal) {
    const table = document.querySelector('table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${table.childElementCount + 1}</td>
        <td>${meal.mealname}</td>
        <td>${getDate()}</td>
        <td>${meal.address}</td>
        <td>${meal.weight}</td>
        <td> ${meal.totalKcal} kcal, ${meal.totalProtein} g, ${meal.totalFat} g, ${meal.totalFiber} g </td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </td>`;
    table.appendChild(row);
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

// Fetch meals data from local storage
function fetchMealsFromLocalStorage() {
    let mealsDataJson = localStorage.getItem('mealName');
    return mealsDataJson ? JSON.parse(mealsDataJson) : [];
}

// Display meals from local storage
function displayMealsFromLocalStorage() {
    const mealsData = fetchMealsFromLocalStorage();
    mealsData.forEach(mealData => {
        displayMealInTable(mealData);
    });
}

// Remove meal from local storage and update display
function removeMealFromLocalStorageAndTable(index) {
    let mealsDataJson = localStorage.getItem('mealName');
    let mealsData = mealsDataJson ? JSON.parse(mealsDataJson) : [];

    if (index >= 0 && index < mealsData.length) {
        mealsData.splice(index, 1);
        localStorage.setItem('mealName', JSON.stringify(mealsData));
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