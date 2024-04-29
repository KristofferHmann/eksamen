
function openMealCreator() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("mealCreatorModal").style.display = "block";
}
function closeMealCreator() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mealCreatorModal").style.display = "none";
}

function searchButton_MC(event) {
    if (event.key === "Enter") {
        let text = document.getElementById("mcFoodSearch").value
        searchFoodMC(text);

    }
}
