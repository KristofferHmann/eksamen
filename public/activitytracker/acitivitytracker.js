// Denne event listener venter på, at DOM-indholdet er fuldt indlæst, før den udfører funktionen
document.addEventListener('DOMContentLoaded', async () => {
    // Henter select-elementet med id 'allActivity'
    const activitySelect = document.getElementById('allActivity');

    // Kalder funktionen for at opdatere aktivitetslisten
    updateActivityList()
    try {
        // Henter alle aktiviteter fra serveren
        const response = await fetch('http://localhost:3000/items/allActivities')

        // Hvis svaret ikke er ok (statuskoden er ikke i området 200-299), kastes en fejl
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }

        // Parser svarets indhold som JSON og henter 'getAllActivities'-egenskaben
        const activities = (await response.json()).getAllActivities;

        // Rydder select-elementet
        activitySelect.innerHTML = '';

        // Tilføjer et option-element for hver aktivitet
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.activity_ID;
            option.textContent = activity.activities;
            option.dataset.kcalBurned = activity.kcalburned; // Bruger den korrekte nøgle
            activitySelect.appendChild(option);
        });
        console.log('Activities fetched and select element populated successfully');
        // Tilføjer event listener til submit-knappen
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
});

// Henter knappen med id 'addActivityBtn'
let addActivityBtn = document.getElementById("addActivityBtn")
// Tilføjer en click event listener til knappen
addActivityBtn.addEventListener("click", async () => {
    const activitySelect = document.getElementById('allActivity');

    const selectedActivity = activitySelect.options[activitySelect.selectedIndex];
    const selectedActivityID = activitySelect.value;
    const kcalBurnedPerHour = parseFloat(selectedActivity.dataset.kcalBurned);
    const duration = parseFloat(durationInput.value);
    const totalKcalBurned = (kcalBurnedPerHour / 60) * duration; // Beregner total kcal brændt
    console.log(selectedActivityID, duration, totalKcalBurned);

    // Definerer activityTime her
    const activityTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Copenhagen" });
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:3000/items/addActivity', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
            activity_ID: selectedActivityID,
            duration: duration,
            durationkcal: totalKcalBurned,
            activityTime: activityTime
        })
    });
    if (!response.ok) {
        throw new Error('Failed to add activity');
    }

    updateActivityList()
})

// Funktion til at opdatere aktivitetslisten
async function updateActivityList() {

    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:3000/items/userActivities', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch activities');
    }
    const userActivities = (await response.json()).getAllActivities;

    const activityBody = document.querySelector('.activityBody');
    activityBody.innerHTML = '';
    console.log(userActivities);
    for (let index = 0; index < userActivities.length; index++) {
        // Manipulerer activityTime-strengen for at fjerne 'Z' og 'T' symboler
        const formattedActivityTime = userActivities[index].activityTime.replace(/[TZ]/g, ' ').split('.')[0];

        // Tilføjer en ny række til tabellen
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${formattedActivityTime}</td>
        <td>${userActivities[index].activities}</td>
        <td>${userActivities[index].duration}</td>
        <td>${userActivities[index].durationkcal}</td>`  // Afrunder til 2 decimaler
        activityBody.appendChild(row);
    }

}