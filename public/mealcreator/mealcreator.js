// Initialiserer globale variabler til at holde styr på ernæringsværdier og måltider
let totalKcal = 0;
let totalProtein = 0;
let totalFat = 0;
let totalFiber = 0;
let meals = []; // Liste af måltider, hvert måltid er en liste af ingredienser
let currentMeal = []; // Liste af ingredienser for det nuværende måltid

// Funktion til at åbne modal for måltidsnavn
function openMealNameModal() {
    document.getElementById("mealNameModal").style.display = "block";
}

// Funktion til at lukke modal for måltidsnavn
function closeMealNameModal() {
    document.getElementById("mealNameModal").style.display = "none";
}

// Funktioner til at åbne og lukke modal for måltidsskaber
function openMealCreator() {
    document.getElementById("modal").style.display = "block";
    document.getElementById("mealCreatorModal").style.display = "block";
}
function closeMealCreator() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("mealCreatorModal").style.display = "none";
}

// Funktion til at håndtere søgeknap i måltidsskaber
function searchButton_MC(event) {
    if (event.key === "Enter") {
        let text = document.getElementById("mcFoodSearch").value
        searchFoodMC(text);
    }
}

// Event listener til at håndtere søgeinput i måltidsskaber
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

// Funktion til at hente ernæringsinformation for en ingrediens
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

// Event listener til at håndtere tilføjelse af ingrediens til måltid
document.addEventListener('DOMContentLoaded', () => {
    const addIngredientButton = document.getElementById('addIngredient');
    if (addIngredientButton) {
        addIngredientButton.addEventListener('click', addIngredientToMeal);
    } else {
        console.log('Button is not found');
    }
});

// Funktion til at hente ingredienser baseret på søgeinput
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

// Funktion til at tilføje en ingrediens til et måltid
async function addIngredientToMeal() {
    let selectedFoodItem = document.getElementById("searchResults").value;
    let weight = document.getElementById('mealWeight').value;

    // Tjekker om valgt madvare eller vægt er tom
    if (!selectedFoodItem.trim() || !weight.trim()) {
        alert('Please select a food item and enter its weight');
        return; // Afslutter funktionen tidligt hvis nogen input er tom
    }

    // Henter ernæringsinformation
    const nutrition = await fetchNutrition(selectedFoodItem);

    // Beregner ernæringsværdier baseret på vægt
    const weightInGrams = parseFloat(weight);
    const kcal = (nutrition.kcal * weightInGrams) / 100;
    const protein = (nutrition.protein * weightInGrams) / 100;
    const fat = (nutrition.fat * weightInGrams) / 100;
    const fiber = (nutrition.fiber * weightInGrams) / 100;

    // Opdaterer de globale totaler
    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalFiber += fiber;

    const ingredientID = nutrition.ingredientID;

    // Tilføjer ingrediensen til det nuværende måltid
    currentMeal.push({
        name: selectedFoodItem,
        weight: weight,
        nutrition: { kcal, protein, fat, fiber }
    });

    let meal_ID = document.getElementById('mealIDHidden').value; // Tager værdien fra den gemte mealid input og bruger det i ingiredientdata for at gemme det i databasen

    // Skaber ingredientsdata som skal sendes til backend
    const ingredientData = {
        ingredient_ID: ingredientID,
        ingredientweight: weight,
        weightKcal: kcal,
        weightProtein: protein,
        weightFat: fat,
        weightFiber: fiber,
        meal_ID: meal_ID
    }
    // Kalder funktionen for at sende ingredienser til backend
    createMealIngredient(ingredientData);
    // Definerer ingredientsTable
    let ingredientsTable = document.getElementById('ingredientsTable');
    // Opretter en ny række og tilføjer den til tabellen
    let row = ingredientsTable.insertRow();
    row.insertCell().textContent = ingredientsTable.rows.length - 1; // # column
    row.insertCell().textContent = selectedFoodItem; // Ingredient Name column
    row.insertCell().textContent = weight; // Weight column
    row.insertCell().textContent = `${kcal.toFixed(2)} kcal, ${protein.toFixed(2)} protein, ${fat.toFixed(2)} fat, ${fiber.toFixed(2)} fiber`; // Nutrition column

};

// Event listener til at håndtere tilføjelse af måltid til tabel
document.getElementById("SubmitButtonID").addEventListener("click", addMealToTable);

// Funktion til at tilføje et måltid til tabel
async function addMealToTable() {
    // Tilføjer det nuværende måltid til listen af måltider
    meals.push(currentMeal);

    try {
        // Kalder updateMealID funktionen for at opdatere måltids ID
        const meal_ID = await updateMealID(document.getElementById('mealIDHidden').value);
    } catch (error) {
        console.error('Error submitting meal name:', error);
    }

    // Nulstiller de globale totaler for det næste måltid
    totalKcal = 0;
    totalProtein = 0;
    totalFat = 0;
    totalFiber = 0;

    // Nulstiller det nuværende måltid for det næste måltid
    currentMeal = [];

    closeMealCreator();
    window.location.reload();
};

// Funktion til at indsende måltidsnavn
async function submitMealName() {
    // Lukker modalen
    closeMealNameModal();
    openMealCreator();
    
    try {
        // Kalder adam funktionen for at skabe måltidet og få måltids ID
        const meal_ID = await adam();
        // Fjerner eventuelle eksisterende værdier i det skjulte inputfelt
        document.getElementById('mealIDHidden').value = '';
        // Sætter måltids ID i det skjulte inputfelt
        document.getElementById('mealIDHidden').value = meal_ID;
    } catch (error) {
        console.error('Error submitting meal name:', error);
    }
}

// Funktion til at skabe et måltid
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
        // Skaber måltidet og får måltids ID
        const meal_ID = await createMeal(mealData);

        // Returnerer måltids ID
        return meal_ID;
    } catch (error) {
        console.error('Error creating meal:', error);
        throw error; // Kaster fejlen igen for at håndtere den i den kalder funktion
    }
}

// Funktion til at opdatere måltids ID
async function updateMealID(meal_ID) {
    try {
        // Henter måltidsdata fra det nuværende måltid
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

        // Opdaterer måltidet med det givne måltids ID
        await updateMeals(mealData, meal_ID);

        // Sætter måltids ID i det skjulte inputfelt
        document.getElementById('mealIDHidden').value = meal_ID;
    } catch (error) {
        console.error('Error updating meal ID:', error);
        throw error; // Kaster fejlen igen for at håndtere den i den kalder funktion
    }
}
// Funktion til at oprette et måltid
async function createMeal(mealData) {
    // Henter token fra localStorage
    const token = localStorage.getItem('token');
    // Hvis der ikke er nogen token, logges en fejlmeddelelse og funktionen stopper
    if (!token) {
        console.error('Token missing');
        return;
    }

    // Laver en POST request til serveren for at oprette et måltid
    const response = await fetch('http://localhost:3000/items/mealCreator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(mealData)
    })
    // Hvis responsen ikke er ok, logges en fejlmeddelelse og funktionen stopper
    if (!response.ok) {
        console.Error('Failed to create meals')
        return;
    }
    // Konverterer serverens respons til JSON
    const data = await response.json();
    // Henter meal_ID fra data
    const meal_ID = data.meal_ID
    // Logger meal_ID
    console.log('mealid', meal_ID);
    // Gemmer meal_ID i det skjulte input felt 'mealIDHidden' på HTML siden
    document.getElementById('mealIDHidden').value = meal_ID;

    // Returnerer meal_ID
    return meal_ID;
}

// Funktion til at oprette en ingrediens til et måltid
async function createMealIngredient(ingredientData) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token missing');
        return;
    }

    try {
        // Laver en POST request til serveren for at oprette en ingrediens til et måltid
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

        // Konverterer serverens respons til JSON og logger det
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error creating meal ingredient:', error);
    }
}

// Variabel til at holde alle ingredienser
let ingredients;

// Funktion til at hente alle ingredienser
async function fetchAllIngredients() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token missing');
            return;
        }

        // Laver en GET request til serveren for at hente alle ingredienser
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

        // Gemmer serverens respons (alle ingredienser) i variablen 'ingredients'
        ingredients = await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Funktion til at hente alle brugerens måltider
async function fetchUserMeals() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token missing');
            return;
        }

        // Laver en GET request til serveren for at hente alle brugerens måltider
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

        // Konverterer serverens respons til JSON
        const data = await response.json();

        // Finder de seneste unikke måltider
        const latestMeals = data.userMeals.reduce((acc, meal) => {
            if (!acc[meal.mealname] || meal.meal_ID > acc[meal.mealname].meal_ID) {
                acc[meal.mealname] = meal;
            }
            return acc;
        }, {});

        const uniqueMeals = Object.values(latestMeals);

        // Henter alle ingredienser, hvis de ikke allerede er hentet
        if (!ingredients) {
            await fetchAllIngredients();
        }

        // Logger ingrediens id'er
        uniqueMeals.forEach(meal => {
            if (meal.ingredient_IDs) { 
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
// Funktionen updateMeals opdaterer måltider ved hjælp af en PUT-anmodning til serveren
async function updateMeals(mealData, mealID) {
    try {
        // Henter token fra local storage
        const token = localStorage.getItem('token');
        // Hvis der ikke er nogen token, logges en fejl og funktionen stopper
        if (!token) {
            console.error('Token missing');
            return;
        }

        // Sender en PUT-anmodning til serveren med måltidsdata og måltidsID
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

        // Hvis svaret fra serveren ikke er ok, kastes en fejl
        if (!response.ok) {
            throw new Error('Failed to update meal');
        }

        // Henter data fra svaret
        const data = await response.json();
        // Logger svarets besked
        console.log(data.message);
    } catch (error) {
        // Logger eventuelle fejl
        console.error('Error updating meals:', error);
    }
}

// Funktionen callUpdateMeals kalder updateMeals med data fra adam-funktionen og måltidsID fra en skjult input i dokumentet
async function callUpdateMeals() {
    const mealData = await adam(); // Sikrer at adam() returnerer korrekt måltidsdata
    const mealID = document.getElementById('mealIDHidden').value; // Henter korrekt måltidsID
    await updateMeals(mealData, mealID); // Sender måltidsdata og måltidsID til updateMeals
}

// Funktionen displayMeals viser måltider i en tabel
function displayMeals(meals) {
    // Henter tbody-elementet fra tabellen
    const mealTableBody = document.querySelector('.mealCreator table tbody');
    mealTableBody.innerHTML = ''; // Rydder tidligere indhold

    // Går igennem hvert måltid
    meals.forEach((meal, index) => {
        // Indsætter en ny række i tabellen
        const row = mealTableBody.insertRow();
        // Indsætter celler i rækken med data fra måltidet
        row.insertCell().textContent = index + 1; // # kolonne
        row.insertCell().textContent = meal.mealname; // Måltidsnavn kolonne
        row.insertCell().textContent = `Kcal: ${meal.totalKcal.toFixed(2)}, Protein: ${meal.totalProtein.toFixed(2)}, Fat: ${meal.totalFat.toFixed(2)}, Fiber: ${meal.totalFiber.toFixed(2)}`;
        row.insertCell().textContent = meal.mealTime ? new Date(meal.mealTime).toLocaleString() : 'N/A'; // Tilføjet på kolonne

        // Opretter en ny knap
        const button = document.createElement('button');
        button.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';

        // Når knappen klikkes, åbnes en modal med ingredienser
        button.addEventListener('click', () => {
            // Finder ingrediensen der matcher måltidets ingredient_ID
            const foundIngredient = ingredients.allIngredients.find(ingredient => ingredient.ingredient_ID === meal.ingredient_ID);
            // Opretter en ny modal
            const modal = document.createElement('div');
            modal.classList.add('modal');
        
            // Opretter et nyt indholdselement til modalen
            const content = document.createElement('div');
            content.classList.add('modal-content');
        
            // Tilføjer ingrediensinformation til modalens indhold
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
        
            // Tilføjer indholdet til modalen
            modal.appendChild(content);
        
            // Tilføjer modalen til body
            document.body.appendChild(modal);
        
            // Når der klikkes på modalen, fjernes den
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Tilføjer knappen til rækken
        row.appendChild(button);
    });
}

// Kalder fetchUserMeals-funktionen når dokumentet er indlæst
document.addEventListener('DOMContentLoaded', fetchUserMeals);