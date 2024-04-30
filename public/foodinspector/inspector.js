// Håndtering af søgeinput
// const searchInput = document.getElementById('searchFoodInput');
// const searchResults = document.querySelector('.searchResults');


// Funktion til at hente og vise ingredienser
// async function fetchAndShowIngredients() {
//     console.log(searchInput.value);
//     try {
//         const response = await fetch('http://localhost:3000/items/ingredients/'+searchInput.value);

//         const ingredients = await response.json();
//         console.log("ingredients:");
//         console.log(ingredients);

//         const ingredientsElement = document.getElementById('ingredients');

//         let ingredientsHtml = '';
//         for (const ingredient of ingredients) {
//             ingredientsHtml += `<p>${ingredient.ingredientname}: ${ingredient.kcal} kcal, ${ingredient.protein} g protein, ${ingredient.fat} g fat, ${ingredient.fiber} g fiber</p>`;
//         }

//         ingredientsElement.innerHTML = ingredientsHtml;
//     } catch (error) {
//         console.error(`Error: ${error}`);
//     }
// }

// searchInput.addEventListener('input', async () => {
//     console.log("Nyt input");
//     fetchAndShowIngredients();
// });

// searchInput.addEventListener('input', async () => {
//     const searchText = searchInput.value;

//     const response = await fetch(`../ingredients?search=${encodeURIComponent(searchText)}`);
//     const ingredients = await response.json();

//     let resultsHtml = '';
//     for (const ingredient of ingredients) {
//         resultsHtml += `<option value="${ingredient.ingredientname}">${ingredient.ingredientname}</option>`;
//     }
//     searchResults.innerHTML = resultsHtml;
// });

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

        ressult.addEventListener('change', function () {
            const selectedIngredient = data.allIngredients.find(ingredient => ingredient.ingredientname === this.value);

            if (selectedIngredient) {
                document.getElementById('productID').textContent = '' + selectedIngredient.ingredient_ID;
                document.getElementById('energyKcal').textContent = 'Kcal: ' + selectedIngredient.kcal;
                document.getElementById('protein').textContent = 'Protein: ' + selectedIngredient.protein;
                document.getElementById('fat').textContent = 'Fat: ' + selectedIngredient.fat;
                document.getElementById('fiber').textContent = 'Fiber: ' + selectedIngredient.fiber;
            }
        });
    } catch (error) {
        throw new Error('Error fetching data:' + error.toString());
    }
};

