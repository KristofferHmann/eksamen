//Updater per time
/*setInterval(function() {updateHour()}, 1000 * 60 * 60 );

//Ny række med kolonner - Ny per time
function updateHour() {
    let tbodyRef = document.getElementById('overview');
    //Ny række til tabellen
    let newRow = tbodyRef.insertRow(0);
    newRow.id = "newRowHour";

    //Insætter celler/kolonner til slutningen af række
    let newCell1 = newRow.insertCell(-1);
    let div1 = document.createElement("div");
    div1.innerHTML = "Hour";
    newCell1.appendChild(div1);

    let newCell2 = newRow.insertCell(-1);
    let div2 = document.createElement("div");
    div2.innerHTML = "Meal Name";
    newCell2.appendChild(div2);

    let newCell3 = newRow.insertCell(-1);
    let div3 = document.createElement("div");
    div3.innerHTML = "Water Consumed";
    newCell3.appendChild(div3);

    let newCell4 = newRow.insertCell(-1);
    let div4 = document.createElement("div");
    div4.innerHTML = "Calories Consumed";
    newCell4.appendChild(div4);

    let newCell5 = newRow.insertCell(-1);
    let div5 = document.createElement("div");
    div5.innerHTML = "Calories Burned";
    newCell5.appendChild(div5);

    let newCell6 = newRow.insertCell(-1);
    let div6 = document.createElement("div");
    div6.innerHTML = "Calories Surplus or Deficit";
    newCell6.appendChild(div6);

    let oldData = localStorage.getItem('overviewTable') || '';

    let newData = oldData + tbodyRef.outerHTML;

    localStorage.setItem('overviewTable', newData);
    console.log('Table saved to local storage')

    return tbodyRef.outerHTML;
}


// setInterval(function() {updateDaily()}, 20000);
function updateDaily() {
    let dato = new Date().toLocaleDateString("da-DK");

    if(!document.getElementById(dato)) {
        newRowDaily();
    };
};

//Ny række med kolonner - Ny per dag
function newRowDaily() {

    let tbodyRef = document.getElementById('overviewDaily');
    //Ny række til tabellen
    let newRow = tbodyRef.insertRow(0);


    //Insætter celler/kolonner til slutningen af række
    let newCell1 = newRow.insertCell(-1);
    let div1 = document.createElement("div");
    div1.innerHTML = "Days";
    newCell1.appendChild(div1);

    let newCell2 = newRow.insertCell(-1);
    let div2 = document.createElement("div");
    div2.innerHTML = "Meal Name";
    newCell2.appendChild(div2);

    let newCell3 = newRow.insertCell(-1);
    let div3 = document.createElement("div");
    div3.innerHTML = "Water Consumed";
    newCell3.appendChild(div3);

    let newCell4 = newRow.insertCell(-1);
    let div4 = document.createElement("div");
    div4.innerHTML = "Calories Consumed";
    newCell4.appendChild(div4);

    let newCell5 = newRow.insertCell(-1);
    let div5 = document.createElement("div");
    div5.innerHTML = "Calories Burned";
    newCell5.appendChild(div5);

    let newCell6 = newRow.insertCell(-1);
    let div6 = document.createElement("div");
    div6.innerHTML = "Calories Surplus or Deficit";
    newCell6.appendChild(div6);
    let dato = new Date().toLocaleDateString("da-DK");

} 
*/


// let jsonObj = { 'newRow': newCell1 };
// localStorage.setItem('newRow', JSON.stringify(jsonObj));


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
  