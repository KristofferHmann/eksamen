document.addEventListener('DOMContentLoaded', () => {
  // Få knappen der åbner modalen
  const waterBtn = document.getElementById('showWater');

  // Få modal elementet
  const modal = document.getElementById('modal');

  // Få elementet der lukker modalen
  const closeBtn = document.querySelector(".close");

  // Få mealList elementet
  const mealList = document.getElementById('mealList');

  // Når brugeren klikker på knappen, åben modalen 
  waterBtn.addEventListener('click', () => {
    modal.style.display = "block";
  });

  // Når brugeren klikker på <span> (x), luk modalen
  closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
  });

  // Når brugeren klikker på knappen, opdater mealList
  waterBtn.addEventListener('click', () => {
    // Hent waterData fra localStorage
    const waterData = JSON.parse(localStorage.getItem('waterData'));

    // Opdater mealList's indhold med waterData
    mealList.innerHTML = '';
    if (waterData) {
      waterData.forEach(data => {
        mealList.innerHTML += `<p>Ingredient Name: ${data.ingredientname}</p>`;
        mealList.innerHTML += `<p>Water Amount: ${data.waterAmount}</p>`;
        mealList.innerHTML += `<p>Water Time: ${data.waterTime}</p>`;
        mealList.innerHTML += `<hr>`; // Add a horizontal line for readability
      });
    }
  });

  // Når brugeren klikker hvor som helst uden for modalen, luk den
  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});


// Example data - replace with your actual data fetching logic
let mergedData = {
  activities: [], // Data from activitytracker.js
  meals: []      // Data from mealtracker.js
};

// Function to update the table
function updateTable(meals) {
  const tbody = document.getElementById('overview');
  tbody.innerHTML = ''; // Clear existing rows

  meals.forEach(meal => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${meal.hour}</td>
        <td>${meal.mealName}</td>
        <td>${meal.waterConsumed}</td>
        <td>${meal.caloriesConsumed}</td>
        <td>${meal.caloriesBurned}</td>
        <td>${meal.caloriesSurplusOrDeficit}</td>
      `;
    tbody.appendChild(row);
  });
}

// Initial table update
updateTable(meals, 'hours');

// Function to handle view change
function updateView(view) {
  updateTable(meals, view);
}

//Event listeners til de forskellige knapper der tager en til siderne
document.getElementById('btn-hours').addEventListener('click', () => {
  updateView('hours');
  window.location.href = 'dailynutri.html'; // Redirect to maintain state
});

document.getElementById('btn-days').addEventListener('click', () => {
  updateView('days');
  window.location.href = 'days.html'; // Redirect to maintain state
});
