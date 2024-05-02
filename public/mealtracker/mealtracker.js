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
                const address = await getAddressFromCoordinates(latitude, longitude);

                const geolocation = address || `Latitude: ${latitude}, Longitude: ${longitude}`

        // Fetch nutrition information
        const nutrition = await fetchNutrition(selectedIngredient);

        // Calculate nutrition values based on weight
        const weightInGrams = parseFloat(weight);
        const kcal = (nutrition.kcal * weightInGrams) / 100;
        const protein = (nutrition.protein * weightInGrams) / 100;
        const fat = (nutrition.fat * weightInGrams) / 100;
        const fiber = (nutrition.fiber * weightInGrams) / 100;

        row.innerHTML = `
            <td>${table.childElementCount + 1}</td>
            <td>${selectedIngredient}</td>
            <td>${dateString}</td>
            <td>${address}</td>
            <td>${weight}</td>
            <td>${kcal.toFixed(2)} kcal, ${protein.toFixed(2)} protein, ${fat.toFixed(2)} fat, ${fiber.toFixed(2)} fiber</td>
            <td><td><i class="fa fa-book" onclick="view(${table.childElementCount})"></i>
            <i class="fa fa-pencil" onclick="edit(${table.childElementCount})"></i>
            <i class="fa fa-trash" onclick="delete(${table.childElementCount})"></i></td></td>
        `;

        table.appendChild(row);
        // Close the modal
        modal.style.display = "none";
    });
    }
    });

    function openView() {
        document.getElementById('openView').style.display = 'block';
    }

//funktion der henter den specifikke addresse med brug af nominatin.
    async function getAddressFromCoordinates(latitude, longitude) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        //if (data.display_name) {
            //return data.display_name;
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

