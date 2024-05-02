<<<<<<< HEAD

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
}
=======
let ybodyRef = document.getElementById('overviewOfIntake');

//Ny række til tabellen
let newRow = tbodyRef.insertRow();

//Insætter celle til slutningen af række
let newCell = newRow.insertCell();

let newText = document.createTextNode('new row');
newCell.appenChild(newText);
>>>>>>> d7fa143d70dcb2d01d33dac808f4076bbaf1a9f9
