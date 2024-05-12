// Tilføjer en event listener til dokumentet, der afventer at alt indhold er indlæst
document.addEventListener('DOMContentLoaded', () => {
    // Finder registreringsformularen i dokumentet
    const registerForm = document.getElementById('registerForm');

    // Tjekker om registreringsformularen eksisterer, før der tilføjes en event listener
    if (registerForm) {
        // Tilføjer en event listener til formularen, der afventer at formularen indsendes
        registerForm.addEventListener('submit', async (event) => {
            // Forhindrer formularen i at indsende som standard, så vi kan håndtere indsendelsen manuelt
            event.preventDefault();

            // Finder inputfelterne for brugernavn, adgangskode, vægt, alder og køn i dokumentet
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const weight = document.getElementById('weight');
            const age = document.getElementById('age');
            const gender = document.querySelector('input[name ="gender"]:checked');

            // Samler brugerdata fra inputfelterne i et objekt
            const userData = {
                username: username.value,
                password: password.value,
                weight: weight.value,
                age: age.value,
                gender: gender.value
            };

            try {
                // Sender en POST request til serveren med brugerdata for at registrere en ny bruger
                const response = await fetch('http://localhost:3000/items/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                if (response.ok) {
                    // Omdirigerer til login-siden efter vellykket registrering
                    alert('Profil oprettet')
                    window.location.href = '../login/login.html';
                } else {
                    // Kaster en fejl, hvis registreringen mislykkes
                    throw new Error('Failed to register user');
                }
            } catch (error) {
                // Kaster en fejl, hvis der opstår en fejl under hentning af data
                throw new Error('Error fetching data:', error);
            }
        });
    }
});