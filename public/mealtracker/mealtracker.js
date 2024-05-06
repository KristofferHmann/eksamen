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
    const span = document.getElementsByClassName("close")[0];
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
            <button class="delete-btn">Delete</button>
        </td>`;
    table.appendChild(row);
}
  

  /*async function fetchUserMeals() {
      const token = localStorage.getItem('token');
      if (!token) {
          console.error('Token missing');
          return;
      }
      const response = await fetch('http://localhost:3000/items/userMeals', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + token,
          },
          body: JSON.stringify()
      });
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log(data);
    } */

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
                throw new Error('Failed to fetch data');
            }
    
            const data = await response.json();
            console.log(data);
    
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
            button.addEventListener('click', () => {
                // Implement logic to handle when a meal button is clicked
                console.log('Clicked on meal:', meal);
            });
            mealListDiv.appendChild(button);
        });
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

    