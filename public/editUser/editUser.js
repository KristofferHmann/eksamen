// Funktion til at håndtere brugeropdatering
async function updateUser(updatedUserData) {
    // Henter token fra localStorage
    const token = localStorage.getItem('token');

    // Laver en HTTP PUT request til serveren for at opdatere brugerdata
    const response = await fetch(`http://localhost:3000/items/edit`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(updatedUserData)
    });

    // Hvis responsen ikke er ok, logges en fejl
    if (!response.ok) {
        console.error('Failed to update user');
        return;
    }

    // Henter data fra responsen
    const data = await response.json();
    console.log(data.message); // Logger svaret fra serveren
}

// Funktion til at håndtere formularindsendelse
function handleSubmit(event) {
    event.preventDefault();

    // Henter alle radioknapper for køn
    const genderRadios = document.getElementsByName('gender');
    let selectedGender;
    // Finder det valgte køn
    for (const radio of genderRadios) {
        if (radio.checked) {
            selectedGender = radio.value;
            break;
        }
    }

    // Samler opdateret brugerdata
    const updatedUserData = {
        gender: selectedGender,
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value)
    };
    window.location.reload();
    // Kalder updateUser funktionen for at opdatere brugerinformation
    updateUser(updatedUserData).catch(error => console.error(error));
}

// Tilføjer event listener til opdateringsknappen
const updateButton = document.getElementById('updateButton');
updateButton.addEventListener('click', handleSubmit);


// Slet funktion
async function deleteUser() {
    // Henter token fra localStorage
    const token = localStorage.getItem('token');

    // Viser bekræftelsesdialog
    const confirmDelete = confirm("Er du sikker på, at du vil slette din konto?");
    if (!confirmDelete) {
        return; // Afbryder sletning, hvis brugeren annullerer
    }

    // Laver en HTTP GET request til serveren for at slette brugeren
    const response = await fetch('http://localhost:3000/items/delete', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token, // Antager at token er tilgængeligt
        }
    });

    // Hvis responsen ikke er ok, logges en fejl
    if (!response.ok) {
        console.error('Failed to delete user');
        return;
    }

    // Henter data fra responsen
    const data = await response.text();
    console.log(data); // Logger svaret fra serveren
}

// Antager at du har en slet-knap i din HTML med id="deleteButton"
const deleteButton = document.getElementById('deleteButton');
deleteButton.addEventListener('click', () => {
    deleteUser().catch(error => console.error(error));
});



// Logout funktion
async function logout() {
    // Henter token fra localStorage
    const token = localStorage.getItem("token");

    // Laver en HTTP GET request til logout endpoint
    const response = await fetch('http://localhost:3000/items/logout', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token, // Antager at token er tilgængeligt
        }
    });
    console.log(response); // Debugging: Logger svaret fra serveren

    // Hvis responsen ikke er ok, håndteres fejl
    if (!response.ok) {
        // Håndterer 401 Uautoriseret respons
        if (response.status === 401) {
            console.error('Uautoriseret: Token udløbet eller ugyldigt.');
            // Håndterer udløbet eller ugyldigt token
            // Omdiriger til login side eller vis en besked til brugeren
        } else {
            throw new Error('Failed to fetch logout');
        }
    } else {
        // Fjerner token fra klient-side localStorage, hvis logout var succesfuld
        localStorage.removeItem('token');
        console.log('Logout successful');
    }
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', () => {
    logout().catch(error => console.error(error));
});


async function fetchUserMeals() {
    try {
        // Henter token fra localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token mangler');
            return;
        }

        // Laver en HTTP GET request til serveren for at hente brugerdata
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

        // Henter brugerdata fra responsen
        const userData = await response.json();
        const userDataContainer = document.getElementById('userData');
        // Opdaterer HTML med brugerdata
        userDataContainer.innerHTML = `
            <h2><strong>Hej</strong> ${userData.username}</h2>
            <p><strong>Køn:</strong> ${userData.gender}</p>
            <p><strong>Alder:</strong> ${userData.age}</p>
            <p><strong>Vægt:</strong> ${userData.weight} kg</p>
            <p><strong>BMR:</strong> ${userData.bmr}</p>
        `;
        } catch (error) {
        console.error('Fejl ved hentning af bruger måltider:', error);
    }
  }
  fetchUserMeals(); // Henter bruger måltider ved load