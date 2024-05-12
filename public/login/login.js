// Henter login-knappen fra dokumentet ved hjælp af dens id 'loginBtn'
let loginBtn = document.getElementById('loginBtn')

// Tilføjer en event listener til login-knappen, der udløses, når knappen klikkes
loginBtn.addEventListener('click', async () => {
  // Opretter et objekt med brugerdata, der indeholder brugernavn og adgangskode indtastet af brugeren
  const userData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };
  
  // Laver en POST request til serveren med brugerdata som body for at logge ind
  const data = await fetch('http://localhost:3000/items/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  
  // Konverterer serverens respons til JSON, som indeholder en token
  const token = await data.json()
  
  // Hvis der ikke er nogen token i responsen, vises en alert med fejlmeddelelse
  if (!token) {
    return alert("Wrong username or password")
  } else {
    // Hvis der er en token i responsen, omdirigeres brugeren til 'mealcreator' siden
    window.location.href = '../mealcreator/mealcreator.html'
    // Tokenen gemmes i localStorage for senere brug
    localStorage.setItem("token", token)
  }
});