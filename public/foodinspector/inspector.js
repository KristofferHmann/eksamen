// Tilføjer en event listener til dokumentet, der afventer at alt indhold er indlæst
document.addEventListener('DOMContentLoaded', () => {
    // Henter input feltet til søgning
    const searchInput = document.getElementById('searchFoodInput');
    // Tilføjer en event listener til input feltet, der lytter efter ændringer i input
    searchInput.addEventListener('input', async () => {
        try {
            // Kalder foodFetch funktionen, der henter data fra serveren
            await foodFetch();
            console.log('Fetch request successful');
        } catch (error) {
            // Logger eventuelle fejl under fetch request
            console.error('Error during fetch request:', error);
        }
    });
});

// Asynkron funktion til at hente data fra serveren
async function foodFetch() {
    try {
        // Laver en fetch request til serveren
        const response = await fetch('http://localhost:3000/items/ingredients');
        // Tjekker om responsen er ok, ellers kastes en fejl
        if (response.ok) {
            console.log('Response status:', response.status);
        } else {
            throw new Error('Failed to fetch data');
        }
        // Konverterer responsen til JSON
        const data = await response.json();
        // Henter elementet til at vise søgeresultater
        const ressult = document.getElementById('searchResults');
        // Tømmer søgeresultater
        ressult.innerHTML = '';
        // Henter input feltet til søgning
        const searchFoodInput = document.getElementById('searchFoodInput');
        // Filtrerer alle ingredienser baseret på søgeinput og tilføjer dem til søgeresultater
        data.allIngredients
            .filter(ingredient => ingredient.ingredientname.toLowerCase().includes(searchFoodInput.value.toLowerCase()))
            .forEach((ingredient) => {
                // Opretter et nyt option element for hver ingrediens
                const option = document.createElement('option');
                option.value = ingredient.ingredientname;
                option.textContent = ingredient.ingredientname;
                // Tilføjer option elementet til søgeresultater
                ressult.appendChild(option);
            });

        // Tilføjer en event listener til søgeresultater, der lytter efter ændringer i valgt option
        ressult.addEventListener('change', function () {
            // Finder den valgte ingrediens
            const selectedIngredient = data.allIngredients.find(ingredient => ingredient.ingredientname === this.value);

            // Hvis en ingrediens er valgt, opdateres indholdet med information om ingrediensen
            if (selectedIngredient) {
                document.getElementById('productID').textContent = '' + selectedIngredient.ingredient_ID;
                document.getElementById('energyKcal').textContent = 'Kcal: ' + selectedIngredient.kcal + ' kcal/100g';
                document.getElementById('protein').textContent = 'Protein: ' + selectedIngredient.protein + ' g/100g';
                document.getElementById('fat').textContent = 'Fat: ' + selectedIngredient.fat + ' g/100g';
                document.getElementById('fiber').textContent = 'Fiber: ' + selectedIngredient.fiber + ' g/100g';
            }
        });
    } catch (error) {
        // Kaster en fejl, hvis der opstår en fejl under fetch request
        throw new Error('Error fetching data:' + error.toString());
    }
};