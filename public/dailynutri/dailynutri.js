// Funktionen fetchUserInfo henter brugerinformation fra serveren
async function fetchUserInfo() {
  try {
    // Henter token fra localStorage
    const token = localStorage.getItem('token');
    // Hvis der ikke er nogen token, logges en fejl og funktionen stopper
    if (!token) {
      console.error('Token mangler');
      return;
    }

    // Laver en GET request til serveren for at hente brugerinformation
    const response = await fetch('http://localhost:3000/items/userInfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });
    // Hvis responsen ikke er ok, kastes en fejl
    if (!response.ok) {
      throw new Error('Kunne ikke hente brugerdata');
    }

    // Parser responsen til JSON
    const userData = await response.json();
    console.log(userData);

    // Uddrager BMR fra brugerdata
    const userBMR = userData.bmr;

    // Nu er userBMR tilgængelig til brug
    console.log('Bruger BMR:', userBMR);
    
    // Kalder fetchAndGroupUserActivities med userBMR
    fetchAndGroupUserActivities(userBMR);
  } catch (error) {
    console.error('Fejl ved hentning af bruger måltider:', error);
  }
}
fetchUserInfo();

// Funktionen fetchAndGroupUserActivities henter og grupperer brugeraktiviteter
async function fetchAndGroupUserActivities(userBMR) {
  // Henter token fra localStorage
  const token = localStorage.getItem("token");

  // Henter brugeraktiviteter fra serveren
  const response = await fetch('http://localhost:3000/items/userActivities', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userActivities = await response.json();

  // Henter brugervand fra serveren
  const responseWater = await fetch('http://localhost:3000/items/allWater', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userWater = await responseWater.json();

  // Henter brugermåltider fra serveren
  const responseMeals = await fetch('http://localhost:3000/items/userMeals', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userMeals = await responseMeals.json();
  console.log('userMeals:', userMeals);

  // Filtrer aktiviteter og vand fra de sidste 24 timer
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivities = userActivities.getAllActivities.filter(activity => new Date(activity.activityTime) >= oneDayAgo);
  const recentWater = userWater.getAllWater.filter(water => new Date(water.waterTime) >= oneDayAgo);

  // Filtrer måltider fra de sidste 24 timer
  const recentMeals = userMeals.userMeals.filter(meal => new Date(meal.mealTime) >= oneDayAgo);

  // Grupper aktiviteter og vand efter time og beregn total durationKcal og waterVolume
  const groupedActivities = [...recentActivities, ...recentWater].reduce((acc, item) => {
    const date = new Date(item.activityTime || item.waterTime);
    const hour = date.toISOString().split('T')[1].split(':')[0]; // Uddrag time fra tid
    const dayHour = `${date.toISOString().split('T')[0]} ${hour}:00`; // Kombiner dato og time
    if (!acc[dayHour]) {
      acc[dayHour] = { durationKcal: 0, waterVolume: 0 }; // Initialiser hvis ikke allerede til stede
    }
    if (item.durationkcal) {
      acc[dayHour].durationKcal += item.durationkcal; // Tilføj durationKcal til totalen
    }
    if (item.waterVolume) {
      acc[dayHour].waterVolume += item.waterVolume; // Tilføj waterVolume til totalen
    }
    return acc;
  }, {});

  // Grupper måltider efter time og beregn totalKcal
  const groupedMeals = recentMeals.reduce((acc, meal) => {
    const date = new Date(meal.mealTime);
    const hour = date.toISOString().split('T')[1].split(':')[0]; // Uddrag time fra tid
    const dayHour = `${date.toISOString().split('T')[0]} ${hour}:00`; // Kombiner dato og time
    if (!acc[dayHour]) {
      acc[dayHour] = { totalKcal: 0 }; // Initialiser hvis ikke allerede til stede
    }
    acc[dayHour].totalKcal += meal.totalKcal; // Tilføj totalKcal til totalen
    return acc;
  }, {});

  // Vis de grupperede aktiviteter og vand i HTML
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
      <td>${groupedMeals[dayHour] ? groupedMeals[dayHour].totalKcal.toFixed(2) : 0}</td>
      <td>${totalDurationKcal.toFixed(2)}</td>
      <td>${totalKcal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  }
}

