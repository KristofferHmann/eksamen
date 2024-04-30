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


