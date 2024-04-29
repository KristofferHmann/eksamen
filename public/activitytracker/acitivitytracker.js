document.addEventListener('DOMContentLoaded', async () => {
    const activitySelect = document.getElementById('allActivity');
    const durationInput = document.getElementById('durationInput');
    const submitButton = document.getElementById('submit');
    const activityBody = document.querySelector('.activityBody');

    try {
        const response = await fetch('http://localhost:3000/items/activities');
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }

        const activities = (await response.json()).getAllActivities;

        // Clear the select element
        activitySelect.innerHTML = '';

        // Add an option element for each activity
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.activities;
            option.textContent = activity.activities;
            option.dataset.kcalBurned = activity.kcalburned; // Use the correct key
            activitySelect.appendChild(option);
        });
        console.log('Activities fetched and select element populated successfully');
        // Add event listener to submit button
        submitButton.addEventListener('click', () => {
            const selectedActivity = activitySelect.options[activitySelect.selectedIndex];
            const activityName = selectedActivity.value;
            const kcalBurnedPerHour = parseFloat(selectedActivity.dataset.kcalBurned);
            const duration = parseFloat(durationInput.value);
            const totalKcalBurned = (kcalBurnedPerHour / 60) * duration; // Calculate total kcal burned

            // Add a new row to the table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activityName}</td>
                <td>${duration}</td>
                <td>${totalKcalBurned.toFixed(2)}</td>`  // Round to 2 decimal places
            activityBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
});