



/*
document.addEventListener('DOMContentLoaded', () => {
  // Function to fetch waterData and update the table
  function fetchAndUpdate() {
    // Fetch waterData from localStorage
    const waterData = JSON.parse(localStorage.getItem('waterData')) || [];

    // Get the current date
    const now = new Date();

    // Filter the data based on the timestamp
    const filteredData = waterData.filter(data => {
      // Extract the date and time from the string
      const dateTime = data.waterTime;

      // Convert the date string to the format "mm-dd-yyyy hh:mm:ss"
      const dateParts = dateTime.split(' ')[0].split('-');
      const timePart = dateTime.split(' ')[1];
      const formattedDateTime = `${dateParts[1]}-${dateParts[0]}-${dateParts[2]} ${timePart}`;

      // Convert the date and time string to a Date object
      const dataDate = new Date(formattedDateTime);

      // Calculate the difference in days
      const diffInDays = (now - dataDate) / (1000 * 60 * 60 * 24);

      // Check if the difference is less than or equal to 24 hours
      return diffInDays <= 1;
    });

    // Update the table with filteredData
    updateTable(filteredData);
  }

  // Function to update the table
  function updateTable(data) {
    const tbody = document.getElementById('overview');
    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.waterTime}</td>
        <td>${item.ingredientname}</td>
        <td>${item.waterAmount}</td>
        <td></td>
        <td></td>
        <td></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Initial table update
  fetchAndUpdate();
});
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

  // Fetch userWater from the server
  const responseWater = await fetch('http://localhost:3000/items/allWater', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userWater = await responseWater.json();

  // Fetch userMeals from the server
  const responseMeals = await fetch('http://localhost:3000/items/userMeals', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userMeals = await responseMeals.json();
  console.log('userMeals:', userMeals);

  // Filter activities and water from the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivities = userActivities.getAllActivities.filter(activity => new Date(activity.activityTime) >= oneDayAgo);
  const recentWater = userWater.getAllWater.filter(water => new Date(water.waterTime) >= oneDayAgo);

  // Filter meals from the last 24 hours
  const recentMeals = userMeals.userMeals.filter(meal => new Date(meal.mealTime) >= oneDayAgo);


  // Group activities and water by hour and calculate total durationKcal and waterVolume
  const groupedActivities = [...recentActivities, ...recentWater].reduce((acc, item) => {
    const date = new Date(item.activityTime || item.waterTime);
    const hour = date.toISOString().split('T')[1].split(':')[0]; // Extract hour from time
    const dayHour = `${date.toISOString().split('T')[0]} ${hour}:00`; // Combine date and hour
    if (!acc[dayHour]) {
      acc[dayHour] = { durationKcal: 0, waterVolume: 0 }; // Initialize if not already present
    }
    if (item.durationkcal) {
      acc[dayHour].durationKcal += item.durationkcal; // Add durationKcal to the total
    }
    if (item.waterVolume) {
      acc[dayHour].waterVolume += item.waterVolume; // Add waterVolume to the total
    }
    return acc;
  }, {});

  // Group meals by hour and calculate totalKcal
  const groupedMeals = recentMeals.reduce((acc, meal) => {
    const date = new Date(meal.mealTime);
    const hour = date.toISOString().split('T')[1].split(':')[0]; // Extract hour from time
    const dayHour = `${date.toISOString().split('T')[0]} ${hour}:00`; // Combine date and hour
    if (!acc[dayHour]) {
      acc[dayHour] = { totalKcal: 0 }; // Initialize if not already present
    }
    acc[dayHour].totalKcal += meal.totalKcal; // Add totalKcal to the total
    return acc;
  }, {});

  // Display the grouped activities and water in HTML
const tbody = document.getElementById('overview');
for (const dayHour in groupedActivities) {  
  const day = new Date(dayHour).toLocaleDateString('en-US', { weekday: 'long' });
  const totalDurationKcal = groupedActivities[dayHour].durationKcal + userBMR / 24;
let totalKcal = 0;
if (groupedMeals[dayHour]) {
  totalKcal = groupedMeals[dayHour].totalKcal;
}
totalKcal -= totalDurationKcal;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${dayHour}</td>
    <td>${day}</td>
    <td>${groupedActivities[dayHour].waterVolume} ml</td>
    <td>${groupedMeals[dayHour] ? groupedMeals[dayHour].totalKcal : 0}</td>
    <td>${totalDurationKcal.toFixed(2)}</td>
    <td>${totalKcal.toFixed(2)}</td>
  `;
  tbody.appendChild(row);
}
}


// færdiggør daily: fetch bmr og kcal consumed for det i tracker i stedet for creator, udregn og vis surplus or deficit, lige nu opdate den kun hvis der er tilføjet vand også