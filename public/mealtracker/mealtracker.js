document.addEventListener("DOMContentLoaded", function () {
    // Henter maddata baseret på søgeinput
    const searchInput = document.getElementById('searchFoodInput');
    searchInput.addEventListener('input', async () => {
        try {
            await foodFetch(); // Kører foodFetch funktionen
        } catch (error) {
            console.error('Fejl under fetch anmodning:', error);
        }
    });

    // Åbner modal når "Tilføj Ingrediens" knappen bliver klikket på
    const btn = document.getElementById("addIngredient");
    btn.onclick = function () {
        const modal = document.getElementById("myModal");
        modal.style.display = "block"; // Viser modalen
    }

    // Lukker modal når luk-knappen bliver klikket på
    const span = document.getElementsByClassName("close")[1];
    span.onclick = function () {
        const modal = document.getElementById("myModal");
        modal.style.display = "none"; // Skjuler modalen
    }

    // Lukker modal når der bliver klikket udenfor modalen
    window.onclick = function (event) {
        const modal = document.getElementById("myModal");
        if (event.target == modal) {
            modal.style.display = "none"; // Skjuler modalen
        }
    }

    // Henter luk-knappen
    const closeBtn = document.getElementById('closeBtn');

    // Når brugeren klikker på luk-knappen, lukkes modalen
    closeBtn.onclick = function () {
        document.getElementById('waterModal').style.display = "none"; // Skjuler modalen
    }

    async function fetchAllIngredients() {
        const response = await fetch('http://localhost:3000/items/ingredients');
        if (!response.ok) {
            throw new Error(`HTTP fejl! status: ${response.status}`);
        }
        const allIngredients = await response.json();
        return allIngredients;
    }

    const waterModal = document.getElementById('waterModal');
    const waterIngredientList = document.getElementById('waterIngredientList');
    const addWaterBtn = document.getElementById('addWater');

    addWaterBtn.addEventListener('click', async function () {
        // Henter vandmængde
        const waterVolume = document.getElementById('waterAmount').value;

        // Henter vandingrediensnavn og tid
        const waterName = waterIngredientList.textContent;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth er nulbaseret, så tilføj 1
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const waterTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Henter bruger ID
        const user_ID = localStorage.getItem('user_ID'); // Antager at du gemmer bruger ID i localStorage
        const token = localStorage.getItem('token');
        // Opretter nye vanddata
        const newWaterData = {
            waterName: waterName,
            waterVolume: waterVolume,
            waterTime: waterTime,
            user_ID: user_ID
        };

        // Sender nye vanddata til serveren
        const response = await fetch('http://localhost:3000/items/addWater', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token, // Antager at du gemmer din JWT token i localStorage
            },
            body: JSON.stringify(newWaterData)
        });

        if (!response.ok) {
            console.error('Kunne ikke gemme vanddata', response);
        }

        // Lukker modalen
        waterModal.style.display = "none";
    });

    const waterBtn = document.getElementById('addWaterBtn'); // Knappen der åbner modalen

    waterBtn.addEventListener('click', async function () {
        waterModal.style.display = "block";

        // Henter alle ingredienser
        const allIngredients = await fetchAllIngredients();

        // Finder vandingrediens
        const allArrays = Object.values(allIngredients).flat();
        const water = allArrays.find(ingredient => ingredient.ingredient_ID === 53);

        // Viser vandingrediens i modalen
        waterIngredientList.textContent = water.ingredientname;

        document.getElementById('waterTime').textContent = getDate();
    });


    addWaterBtn.addEventListener('click', function () {
        // Henter vandmængde
        const waterAmount = document.getElementById('waterAmount').value;

        // Henter vandingrediensnavn og tid
        const ingredientname = waterIngredientList.textContent;
        const waterTime = document.getElementById('waterTime').textContent;

        // Opretter nye vanddata
        const newWaterData = {
            ingredientname: ingredientname,
            waterAmount: waterAmount,
            waterTime: waterTime
        };

        // Henter eksisterende vanddata fra localStorage
        const existingWaterData = JSON.parse(localStorage.getItem('waterData')) || [];

        // Tilføjer nye vanddata til eksisterende vanddata
        existingWaterData.push(newWaterData);

        // Gemmer eksisterende vanddata tilbage til localStorage
        localStorage.setItem('waterData', JSON.stringify(existingWaterData));

        // Lukker modalen
        waterModal.style.display = "none";
    });

    // Tilføj ingrediens når "Tilføj" knappen inde i modalen bliver klikket på
    const addIngredientBtn = document.getElementById("addIngredientBtn");
    addIngredientBtn.addEventListener('click', async function () {
        try {
            const selectedIngredient = document.getElementById('searchResults').value;
            const weight = document.getElementById('Weight').value;

            // Henter ernæringsinformation
            const nutrition = await fetchNutrition(selectedIngredient);

            // Beregner ernæringsværdier baseret på vægt
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

            // Tilføjer ingrediens til listen og gemmer til local storage
            addIngredientToLocalStorage(ingredientData);

            // Viser ingrediens i tabellen
            displayIngredientInTable(ingredientData);

            // Lukker modalen
            const modal = document.getElementById("myModal");
            modal.style.display = "none";
        } catch (error) {
            console.error('Fejl ved tilføjelse af ingrediens:', error);
        }
    });

    // Henter og viser brugerens måltider
    fetchUserMeals();
});

// Henter maddata baseret på søgeinput
async function foodFetch() {
    const response = await fetch('http://localhost:3000/items/ingredients');
    if (!response.ok) {
        throw new Error('Kunne ikke hente data');
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
// Henter ernæringsinformation for den valgte ingrediens
async function fetchNutrition(ingredientName) {
    // Anmoder om data fra serveren
    const response = await fetch('http://localhost:3000/items/ingredients');
    // Tjekker om anmodningen var succesfuld
    if (!response.ok) {
        throw new Error('Kunne ikke hente data');
    }
    // Konverterer svaret til JSON
    const data = await response.json();
    // Finder den specifikke ingrediens i dataen
    const ingredient = data.allIngredients.find(ingredient => ingredient.ingredientname === ingredientName);
    // Tjekker om ingrediensen blev fundet
    if (!ingredient) {
        throw new Error('Ingrediens ikke fundet');
    }
    // Returnerer ingrediensens information
    return {
        id: ingredient.ingredient_ID,
        kcal: ingredient.kcal,
        protein: ingredient.protein,
        fat: ingredient.fat,
        fiber: ingredient.fiber,
    };
}

// Henter aktuel dato og tid
function getDate() {
    const date = new Date();
    // Returnerer datoen og tiden i en streng
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// Henter adresse baseret på geolocation
async function getAddress() {
    return new Promise((resolve, reject) => {
        // Anmoder om brugerens position
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            // Anmoder om adresse baseret på position
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            // Tjekker om en adresse blev fundet
            if (data.address) {
                const { town, postcode, country } = data.address;
                // Returnerer adressen
                resolve(`${town}, ${postcode}, ${country}`);
            } else {
                reject('Adresse ikke fundet');
            }
        }, error => reject(error));
    });
}

// Tilføjer ingrediens til local storage
function addIngredientToLocalStorage(ingredientData) {
    // Henter eksisterende data fra local storage
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];
    // Tilføjer den nye ingrediens til dataen
    ingredientsData.push(ingredientData);
    // Gemmer den opdaterede data i local storage
    localStorage.setItem('ingredientsdata', JSON.stringify(ingredientsData));
}

// Viser ingrediens i tabellen
function displayIngredientInTable(ingredientData) {
    // Finder tabellen i dokumentet
    const table = document.querySelector('table tbody');
    // Opretter en ny række
    const row = document.createElement('tr');
    // Indsætter data i rækken
    row.innerHTML = `
        <td>${table.childElementCount + 1}</td>
        <td>${ingredientData.name}</td>
        <td>${ingredientData.date}</td>
        <td>${ingredientData.address}</td>
        <td>${ingredientData.weight}</td>
        <td>${ingredientData.nutrition.kcal} kcal, 
        ${ingredientData.nutrition.protein} protein, 
        ${ingredientData.nutrition.fat} fedt, 
        ${ingredientData.nutrition.fiber} fiber</td>
        <td>
            <button id="delete-btn">Slet</button>
        </td>`;
    // Tilføjer rækken til tabellen
    table.appendChild(row);
    // Finder slet-knappen
    const deleteButton = row.querySelector('#delete-btn');
    // Tilføjer en event listener til slet-knappen
    deleteButton.addEventListener('click', () => {
        // Finder rækkens indeks
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        // Fjerner ingrediensen fra local storage og tabellen
        removeFromLocalStorageAndTable(rowIndex);
    });
}
window.onload = function () {
    // Viser ingredienser fra local storage
    displayIngredientsFromLocalStorage();

    // Viser måltider fra local storage
    displayMealsFromLocalStorage();
};

// Funktion til at vise ingredienser fra local storage
function displayIngredientsFromLocalStorage() {
    // Henter data fra local storage
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

    // Viser hver ingrediens i tabellen
    ingredientsData.forEach(ingredientData => {
        displayIngredientInTable(ingredientData);
    });
}

// Funktion til at vise måltider fra local storage
function displayMealsFromLocalStorage() {
    // Henter data fra local storage
    let mealsDataJson = localStorage.getItem('meals');
    let mealsData = mealsDataJson ? JSON.parse(mealsDataJson) : [];

    // Viser hvert måltid i tabellen
    mealsData.forEach(mealData => {
        displayMealInTable(mealData);
    });
}


function removeFromLocalStorageAndTable(index) {
    // Fjerner ingrediens fra local storage
    let ingredientsDataJson = localStorage.getItem('ingredientsdata');
    let ingredientsData = ingredientsDataJson ? JSON.parse(ingredientsDataJson) : [];

    // Tjekker om indekset er gyldigt
    if (index >= 0 && index < ingredientsData.length) {
        // Fjerner ingrediensen fra dataen
        ingredientsData.splice(index, 1);
        // Gemmer den opdaterede data i local storage
        localStorage.setItem('ingredientsdata', JSON.stringify(ingredientsData));
    } else {
        console.error('Indeks uden for grænser.');
        return;
    }

    // Fjerner række fra tabellen
    const rows = document.querySelectorAll('table tbody tr');
    // Tjekker om indekset er gyldigt
    if (index >= 0 && index < rows.length) {
        // Fjerner rækken
        rows[index].remove();
    } else {
        console.error('Indeks uden for grænser.');
    }
}

// Fjerner måltid fra local storage og opdaterer visning
function removeMealFromLocalStorageAndTable(index) {
    // Henter data fra local storage
    let mealsDataJson = localStorage.getItem('meals');
    let mealsData = mealsDataJson ? JSON.parse(mealsDataJson) : [];

    // Tjekker om indekset er gyldigt
    if (index >= 0 && index < mealsData.length) {
        // Fjerner måltidet fra dataen
        mealsData.splice(index, 1);
        // Gemmer den opdaterede data i local storage
        localStorage.setItem('meals', JSON.stringify(mealsData));
    } else {
        console.error('Indeks uden for grænser.');
        return;
    }

    // Opdaterer visning
    const rows = document.querySelectorAll('table tbody tr');
    // Tjekker om indekset er gyldigt
    if (index >= 0 && index < rows.length) {
        // Fjerner rækken
        rows[index].remove();
    } else {
        console.error('Indeks uden for grænser.');
    }
}
// Tilføjer en event listener til 'addMeal' knappen. Når knappen klikkes, vises modalen og brugerens måltider hentes.
document.getElementById('addMeal').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    fetchUserMeals(); // Henter brugerens måltider når modalen åbnes
});

// Denne asynkrone funktion henter brugerens måltider fra serveren.
async function fetchUserMeals() {
    try {
        const token = localStorage.getItem('token'); // Henter token fra local storage
        if (!token) {
            console.error('Token mangler');
            return;
        }

        // Laver en GET request til serveren for at hente brugerens måltider
        const response = await fetch('http://localhost:3000/items/userMeals', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });

        if (!response.ok) {
            throw new Error('Fejlede i at hente data');
        }

        const data = await response.json(); // Konverterer svaret til JSON

        // Reducerer brugerens måltider til et objekt, hvor hvert måltid kun optræder én gang
        const latestMeals = data.userMeals.reduce((acc, meal) => {
            if (!acc[meal.mealname] || meal.meal_ID > acc[meal.mealname].meal_ID) {
                acc[meal.mealname] = meal;
            }
            return acc;
        }, {});

        const uniqueMeals = Object.values(latestMeals); // Konverterer objektet til en array

        displayMeals(uniqueMeals); // Viser de unikke måltider
    } catch (error) {
        console.error(error);
    }
}

// Denne funktion viser måltiderne i en liste
function displayMeals(meals) {
    const mealListDiv = document.getElementById('mealList');
    mealListDiv.innerHTML = ''; // Rydder tidligere indhold

    meals.forEach(meal => {
        const button = document.createElement('button');
        button.textContent = meal.mealname;
        button.classList.add('mealListButton');
        button.addEventListener('click', () => {
            openMealModal(meal); // Åbner modalen med måltidsdetaljer når knappen klikkes
        });
        mealListDiv.appendChild(button); // Tilføjer knappen til listen
    });
}

// Denne funktion åbner en modal med detaljer om det valgte måltid
function openMealModal(meal) {
    const modal = document.getElementById('mealModal');
    const modalContent = document.getElementById('mealModalContent');

    // Sætter modalens indhold med detaljer om måltidet
    modalContent.innerHTML = `
        <h2>${meal.mealname}</h2>
        <p class="modal-label">Kalorier</p>
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

    modal.style.display = 'block'; // Viser modalen

    // Tilføjer event listeners til knapperne i modalen
    document.getElementById('submitMealBtn').addEventListener('click', () => {
        displayMealInTable(meal); // Viser måltidet i tabellen
        saveMealToLocal(meal); // Gemmer måltidet i local storage
        modal.style.display = 'none'; // Lukker modalen
    });
    document.getElementById('closeMealModalBtn').addEventListener('click', () => {
        modal.style.display = 'none'; // Lukker modalen
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
// Denne funktion gemmer et måltid i local storage
function saveMealToLocal(meal) {
    const mealsData = JSON.parse(localStorage.getItem('meals')) || [];
    mealsData.push(meal);
    localStorage.setItem('meals', JSON.stringify(mealsData));
}

// Denne funktion viser et måltid i tabellen
async function displayMealInTable(meal) {
    const table = document.querySelector('table tbody');
    const row = document.createElement('tr');

    // Henter lokation fra browseren
    let address = 'Adresse ikke tilgængelig';
    try {
        address = await getAddress();
    } catch (error) {
        console.error(error);
    }

    // Sætter rækken med måltidsdetaljer
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
    table.appendChild(row); // Tilføjer rækken til tabellen

    // Tilføjer event listeners til knapperne i rækken
    row.querySelector('.edit-btn').addEventListener('click', () => {
        openEditModal(meal); // Åbner redigeringsmodalen når edit-knappen klikkes
    });
    row.querySelector('.delete-btn').addEventListener('click', () => {
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        removeMealFromLocalStorageAndTable(rowIndex); // Fjerner måltidet fra local storage og tabellen når delete-knappen klikkes
    });
}

// Denne funktion fjerner et måltid fra local storage og tabellen
function removeMealFromLocalStorageAndTable(index) {
    const mealsData = JSON.parse(localStorage.getItem('meals'));
    mealsData.splice(index, 1);
    localStorage.setItem('meals', JSON.stringify(mealsData));

    const table = document.querySelector('table tbody');
    table.removeChild(table.children[index]);
}

// Denne asynkrone funktion opdaterer et måltid i databasen
async function updateMeals(mealData, mealID) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token mangler');
            return;
        }

        // Laver en PUT request til serveren for at opdatere måltidet
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
            throw new Error('Fejlede i at opdatere måltid');
        }

        const data = await response.json();
        console.log(data.message); // Logger svarets besked
    } catch (error) {
        console.error('Fejl ved opdatering af måltider:', error);
    }
}

// Tilføjer en event listener til 'close' knappen. Når knappen klikkes, lukkes modalen.
document.getElementsByClassName('close')[0].addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});