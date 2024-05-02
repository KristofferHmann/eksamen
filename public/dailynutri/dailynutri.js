
function updateHour() {
    let tbodyRef = document.getElementById('overview');
    //Ny række til tabellen
    let newRow = tbodyRef.insertRow(0);

    //Insætter celler/kolonner til slutningen af række
    let newCell1 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Hour";
    newCell1.appendChild(div);

    let newCell2 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Meal Name";
    newCell2.appendChild(div);

    let newCell3 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Water Consumed";
    newCell3.appendChild(div);

    let newCell4 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Calories Consumed";
    newCell4.appendChild(div);

    let newCell5 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Calories Burned";
    newCell5.appendChild(div);

    let newCell6 = newRow.insertCell(-1);
    var div = document.createElement("div");
    div.innerHTML = "Calories Surplus or Deficit";
    newCell6.appendChild(div);

    // let newCell2 = newRow.insertCell(0);
}
//"window.location.href='dailynutri.html'