// Håndtering af søgeinput
const searchInput = document.getElementById('searchFoodInput');
const searchResults = document.querySelector('.searchResults');

// Funktion til at hente og vise ingredienser
async function fetchAndShowIngredients() {
    try {
        const response = await fetch('http://localhost:3000/items/ingredients');
        const ingredients = await response.json();

        const ingredientsElement = document.getElementById('ingredients');

        let ingredientsHtml = '';
        for (const ingredient of ingredients) {
            ingredientsHtml += `<p>${ingredient.ingredientname}: ${ingredient.kcal} kcal, ${ingredient.protein} g protein, ${ingredient.fat} g fat, ${ingredient.fiber} g fiber</p>`;
        }

        ingredientsElement.innerHTML = ingredientsHtml;
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

fetchAndShowIngredients();

searchInput.addEventListener('input', async () => {
    const searchText = searchInput.value;

    const response = await fetch(`../ingredients?search=${encodeURIComponent(searchText)}`);
    const ingredients = await response.json();

    let resultsHtml = '';
    for (const ingredient of ingredients) {
        resultsHtml += `<option value="${ingredient.ingredientname}">${ingredient.ingredientname}</option>`;
    }
    searchResults.innerHTML = resultsHtml;
});
