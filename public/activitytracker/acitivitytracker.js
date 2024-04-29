// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const response = await fetch('http://localhost:3000/items/activities', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },


//         });
//         if (response.ok) {
//             const data = await response.json();
//             console.log('Data fetched successfully:', data);
//         } else {
//             throw new Error('Failed to fetch data');
//         }
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// });

document.addEventListener('DOMContentLoaded', async () => {
    const activitySelect = document.getElementById('allActivity');

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
            activitySelect.appendChild(option);
        });

        console.log('Activities fetched and select element populated successfully');
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
});