// Denne funktion henter brugerinformation fra serveren
async function fetchUserInfo() {
  try {
    // Henter token fra local storage
    const token = localStorage.getItem('token');
    // Hvis token ikke findes, logges en fejl og funktionen stopper
    if (!token) {
      console.error('Token missing');
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
      throw new Error('Failed to fetch user data');
    }

    // Konverterer responsen til JSON
    const userData = await response.json();
    console.log(userData);

    // Uddrager BMR fra brugerdata
    const userBMR = userData.bmr;

    // Nu er userBMR tilgængelig til brug
    console.log('User BMR:', userBMR);

    // Kalder fetchAndGroupUserActivities med userBMR
    fetchAndGroupUserActivities(userBMR);
  } catch (error) {
    // Logger fejl, hvis der opstår en under hentning af brugerdata
    console.error('Error fetching user meals:', error);
  }
}
fetchUserInfo();

// Denne funktion henter brugerens måltider fra serveren
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
    return await response.json(); // Returnerer måltidsdata
  } catch (error) {
    console.error('Error fetching user meals:', error.message);
    return []; // Returnerer et tomt array, hvis der opstår en fejl
  }
}

// Denne funktion grupperer brugerens måltider efter dato og beregner det samlede kalorieindtag
function groupMealsByDate(meals) {
  console.log(meals);
  return meals.reduce((acc, meal) => {
    const date = new Date(meal.mealTime).toISOString().substring(0, 10); // Uddrager dato fra mealTime
    const totalKcal = meal.totalKcal;

    console.log("totalkcal", totalKcal);
    if (!acc[date]) {
      acc[date] = 0; // Initialiserer det samlede kalorieindtag for datoen, hvis det ikke findes
    }

    acc[date] += totalKcal; // Lægger det samlede kalorieindtag til datoen
    return acc;
  }, {});
}

// Denne funktion henter og grupperer brugerens aktiviteter
async function fetchAndGroupUserActivities(userBMR) {
  // Henter brugeraktiviteter fra serveren
  const token = localStorage.getItem("token");
  const response = await fetch('http://localhost:3000/items/userActivities', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    }
  });
  const userActivities = await response.json();

  // Henter vanddata fra serveren
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

  // Grupperer aktiviteter efter dato og beregner det samlede kalorieforbrug
  let groupedActivities = userActivities.getAllActivities.reduce((acc, activity) => {
    const date = new Date(activity.activityTime).toISOString().substring(0, 10); // Uddrager dato fra activityTime
    console.log('date:', date); // Logger datoen
    if (!acc[date]) {
      acc[date] = { durationKcal: 0, waterVolume: 0 }; // Initialiserer, hvis det ikke allerede findes
    }
    acc[date].durationKcal += activity.durationkcal; // Lægger durationKcal til det samlede forbrug
    return acc;
  }, {});

  // Lægger vandvolumen til det samlede forbrug
  userWater.getAllWater.forEach(water => {
    const waterDate = new Date(water.waterTime).toISOString().substring(0, 10);
    console.log('waterDate:', waterDate); // Logger vanddatoen
    console.log('waterVolume:', water.waterVolume); // Logger vandvolumen
    if (groupedActivities[waterDate]) {
      groupedActivities[waterDate].waterVolume += water.waterVolume;
    }
  });

  // Henter nylige måltider baseret på den nuværende dato
  const userMeals = await fetchUserMeals();
  const currentDate = new Date().toISOString().substring(0, 10);
  const recentMeals = userMeals.userMeals.filter(meal => {
    const mealDate = new Date(meal.mealTime).toISOString().substring(0, 10);
    return mealDate === currentDate;
  });

  // Grupperer nylige måltider efter dato og beregner det samlede kalorieindtag
  const mealsByDate = groupMealsByDate(recentMeals);

  // Fletter de grupperede aktiviteter og måltider efter dato
  for (const date in mealsByDate) {
    if (!groupedActivities[date]) {
      groupedActivities[date] = { durationKcal: 0, waterVolume: 0 };
    }
    groupedActivities[date].mealTotalKcal = mealsByDate[date];
  }

  // Viser de grupperede aktiviteter i HTML
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