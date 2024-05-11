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

async function fetchUserInfo() {
  try {
      const token = localStorage.getItem('token');
      if (!token) {
          console.error('Token missing');
          return;
      }

      const response = await fetch('http://localhost:3000/items/userInfo', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
          },
      });
      if (!response.ok) {
          throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log(userData);

      // Extract BMR from user data
      const userBMR = userData.bmr;

      // Now you have userBMR available for use
      console.log('User BMR:', userBMR);
      
      // Call fetchAndGroupUserActivities with userBMR
      fetchAndGroupUserActivities(userBMR);
  } catch (error) {
      console.error('Error fetching user meals:', error);
  }
}
fetchUserInfo();
async function fetchAndGroupUserActivities(userBMR) {
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

  // Fetch water data from the server
  const waterResponse = await fetch('http://localhost:3000/items/allWater', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  if (!waterResponse.ok) {
    console.error('Error fetching water data:', waterResponse.status, waterResponse.statusText);
    return;
  }
  const userWater = await waterResponse.json();
// Group activities by date and calculate total durationKcal
let groupedActivities = userActivities.getAllActivities.reduce((acc, activity) => {
  const date = new Date(activity.activityTime).toISOString().substring(0, 10); // Extract date from activityTime
  console.log('date:', date); // Log the date
  if (!acc[date]) {
    acc[date] = { durationKcal: 0, waterVolume: 0 }; // Initialize if not already present
  }
  acc[date].durationKcal += activity.durationkcal; // Add durationKcal to the total
  return acc;
}, {});

// Add water volume to the total
userWater.getAllWater.forEach(water => {
  const waterDate = new Date(water.waterTime).toISOString().substring(0, 10);
  console.log('waterDate:', waterDate); // Log the waterDate
  console.log('waterVolume:', water.waterVolume); // Log the waterVolume
  if (groupedActivities[waterDate]) {
    groupedActivities[waterDate].waterVolume += water.waterVolume;
  }
});

  // Display the grouped activities in HTML
  const tbody = document.getElementById('overview');
  for (const date in groupedActivities) {
    const totalDurationKcal = groupedActivities[date].durationKcal + userBMR; //ikke divideret med 24 for nu det en dag
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>Water, tap, drinking, average values</td>
      <td>${groupedActivities[date].waterVolume} ml</td>
      <td></td>
      <td>${totalDurationKcal.toFixed(2)}</td>
      <td></td>
    `;
    tbody.appendChild(row);
  }
}

fetchAndGroupUserActivities();