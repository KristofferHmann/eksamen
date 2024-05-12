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
async function fetchUserMeals() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token missing');
      return;
    }
    const response = await fetch('http://localhost:3000/items/userMeals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch meal data');
    }
    return await response.json(); // Return the meal data
  } catch (error) {
    console.error('Error fetching user meals:', error.message);
    return []; // Return an empty array if an error occurs
  }
}
// Function to group user meals by date and calculate total calories consumed
function groupMealsByDate(meals) {
  console.log(meals);
  return meals.reduce((acc, meal) => {
    const date = new Date(meal.mealTime).toISOString().substring(0, 10); // Extract date from mealTime
    const totalKcal = meal.totalKcal;

    console.log("totalkcal", totalKcal);
    if (!acc[date]) {
      acc[date] = 0; // Initialize total calories for the date if not present
    }

    acc[date] += totalKcal; // Add total calories to the date's total
    return acc;
  }, {});
}
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

  // Fetch recent meals based on the current date
  const userMeals = await fetchUserMeals();
  const currentDate = new Date().toISOString().substring(0, 10);
  const recentMeals = userMeals.userMeals.filter(meal => {
    const mealDate = new Date(meal.mealTime).toISOString().substring(0, 10);
    return mealDate === currentDate;
  });

  // Group recent meals by date and calculate total calories consumed
  const mealsByDate = groupMealsByDate(recentMeals);

  // Merge the grouped activities and meals by date
  for (const date in mealsByDate) {
    if (!groupedActivities[date]) {
      groupedActivities[date] = { durationKcal: 0, waterVolume: 0 };
    }
    groupedActivities[date].mealTotalKcal = mealsByDate[date];
  }


  // Display the grouped activities in HTML
  const tbody = document.getElementById('overview');
  for (const date in groupedActivities) {
    const totalDurationKcal = groupedActivities[date].durationKcal + userBMR; //ikke divideret med 24 for nu det en dag
    const totalKcal = groupedActivities[date].mealTotalKcal ? (groupedActivities[date].mealTotalKcal - totalDurationKcal) : 0;
    
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${month}</td>
      <td>${groupedActivities[date].waterVolume} ml</td>
      <td>${groupedActivities[date].mealTotalKcal ? groupedActivities[date].mealTotalKcal.toFixed(2) : '0'} kcal</td>     
      <td>${totalDurationKcal.toFixed(2)}</td>
      <td>${totalKcal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  }
}

