/*
document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch waterData and update the table
    function fetchAndUpdate() {
      // Fetch waterData from localStorage
      const waterData = JSON.parse(localStorage.getItem('waterData')) || [];
  
      // Group the data by date and calculate the total water amount for each day
      const groupedData = waterData.reduce((acc, data) => {
        // Extract the date from the string
        const date = data.waterTime;
  
        // If the date is already in the accumulator, add the waterAmount
        // Otherwise, initialize the date with the waterAmount
        acc[date] = (acc[date] || 0) + Number(data.waterAmount);
  
        return acc;
      }, {});
  
      // Update the table with groupedData
      updateTable(groupedData);
    }
  
    // Function to update the table
    function updateTable(data) {
      const tbody = document.getElementById('overview');
      tbody.innerHTML = ''; // Clear existing rows
  
      for (const date in data) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${date}</td>
          <td>Water, tap, drinking, average values</td>
          <td>${data[date]}</td>
          <td></td>
          <td></td>
          <td></td>
        `;
        tbody.appendChild(row);
      }
    }
  
    // Initial table update
    fetchAndUpdate();
  });

async function fetchAndGroupUserActivities() {
  // Fetch userActivities from the server
  const token = localStorage.getItem("token");
  const response = await fetch('http://localhost:3000/items/userActivities', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userActivities = await response.json();
  console.log(userActivities);
}
fetchAndGroupUserActivities();
*/

async function fetchAndGroupUserActivities() {
  // Fetch userActivities from the server
  const token = localStorage.getItem("token");
  const response = await fetch('http://localhost:3000/items/userActivities', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userActivities = await response.json();

  // Group activities by date and calculate total durationKcal
  const groupedActivities = userActivities.getAllActivities.reduce((acc, activity) => {
    const date = new Date(activity.activityTime).toISOString().split('T')[0]; // Extract date from activityTime
    if (!acc[date]) {
      acc[date] = 0; // Initialize if not already present
    }
    acc[date] += activity.durationkcal; // Add durationKcal to the total
    return acc;
  }, {});

  // Display the grouped activities in HTML
  const tbody = document.getElementById('overview');
  for (const date in groupedActivities) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>Water, tap, drinking, average values</td>
      <td></td>
      <td></td>
      <td>${groupedActivities[date]}</td>
      <td></td>
    `;
    tbody.appendChild(row);
  }
}

fetchAndGroupUserActivities();