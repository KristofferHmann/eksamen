let ybodyRef = document.getElementById('overviewOfIntake');

//Ny række til tabellen
let newRow = tbodyRef.insertRow();

//Insætter celle til slutningen af række
let newCell = newRow.insertCell();

let newText = document.createTextNode('new row');
newCell.appenChild(newText);