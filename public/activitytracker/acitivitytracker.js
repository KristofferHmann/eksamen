document.addEventListener('DOMContentLoaded', async () => {
    const activitySelect = document.getElementById('allActivity');


    updateActivityList()
    try {

        const response = await fetch('http://localhost:3000/items/allActivities')

        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }

        const activities = (await response.json()).getAllActivities;

        // Clear the select element
        activitySelect.innerHTML = '';

        // Add an option element for each activity
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.activity_ID;
            option.textContent = activity.activities;
            option.dataset.kcalBurned = activity.kcalburned; // Use the correct key
            activitySelect.appendChild(option);
        });
        console.log('Activities fetched and select element populated successfully');
        // Add event listener to submit button
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
});

let addActivityBtn = document.getElementById("addActivityBtn")
addActivityBtn.addEventListener("click", async () => {
    const activitySelect = document.getElementById('allActivity');

    const selectedActivity = activitySelect.options[activitySelect.selectedIndex];
    const selectedActivityID = activitySelect.value;
    const kcalBurnedPerHour = parseFloat(selectedActivity.dataset.kcalBurned);
    const duration = parseFloat(durationInput.value);
    const totalKcalBurned = (kcalBurnedPerHour / 60) * duration; // Calculate total kcal burned
    console.log(selectedActivityID, duration, totalKcalBurned);

    // Define activityTime here
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
        // Add a new row to the table
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${userActivities[index].activityTime}</td>
        <td>${userActivities[index].activities}</td>
        <td>${userActivities[index].duration}</td>
        <td>${userActivities[index].durationkcal}</td>`  // Round to 2 decimal places
        activityBody.appendChild(row);
    }

}
