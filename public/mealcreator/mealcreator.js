//Knapper til at åbne modal (tilføj måltid), åbne og lukke modalvindue.
function openMealCreator() {
    document.getElementById("modal").style.display = "block";
    document.getElementById("mealCreatorModal").style.display = "block";
}
function closeMealCreator() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("mealCreatorModal").style.display = "none";
}

function searchButton_MC(event){
    if(event.key === "Enter"){
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
/*
        ressult.addEventListener('change', function () {
            const selectedIngredient = data.allIngredients.find(ingredient => ingredient.ingredientname === this.value);

            if (selectedIngredient) {
                document.getElementById('productID').textContent = '' + selectedIngredient.ingredient_ID;
                document.getElementById('energyKcal').textContent = 'Kcal: ' + selectedIngredient.kcal;
                document.getElementById('protein').textContent = 'Protein: ' + selectedIngredient.protein;
                document.getElementById('fat').textContent = 'Fat: ' + selectedIngredient.fat;
                document.getElementById('fiber').textContent = 'Fiber: ' + selectedIngredient.fiber;
            }
        }); */
    } catch (error) {
        throw new Error('Error fetching data:' + error.toString());
    }
};