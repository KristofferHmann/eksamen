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
        try{
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
            // Process response data if needed
            console.log('Response status:', response.status);
        } else {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const ressult = document.getElementById('searchResults');
        ressult.innerHTML = '';
        data.forEach((ingredient) => {
            const option = document.createElement('option');
            option.value = data.ingredientname;
            ressult.appendChild(option);
        });
    } catch (error) {
        throw new Error('Error fetching data:', error);
    }
}