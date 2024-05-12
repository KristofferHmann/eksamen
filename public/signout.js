// Logout funktion
async function logout() {
    // Henter token fra localStorage
    const token = localStorage.getItem("token");

    // Laver en HTTP GET request til logout endpoint
    const response = await fetch('http://localhost:3000/items/logout', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            // Antager at token er tilgængelig
            "Authorization": "Bearer " + token, 
        }
    });
    // Debugging: Logger svaret fra serveren
    console.log(response);

    if (!response.ok) {
        // Håndterer 401 Unauthorized svar
        if (response.status === 401) {
            console.error('Unauthorized: Token expired or invalid.');
            // Håndterer udløbet eller ugyldig token
            // Omdirigerer til login side eller viser en besked til brugeren
        } else {
            throw new Error('Failed to fetch logout');
        }
    } else {
        // Fjerner token fra client-side localStorage, hvis logout var succesfuld
        localStorage.removeItem('token');
        console.log('Logout successful');
        // Genindlæser siden
        location.reload();
    }
}

// Tilføjer en event listener til dokumentet, der afventer at alt indhold er indlæst
document.addEventListener('DOMContentLoaded', () => {
    // Finder logout knappen i dokumentet
    const logoutButton = document.getElementsByClassName('outBtn')[0];
    // Tilføjer en event listener til logout knappen, der afventer et klik
    logoutButton.addEventListener('click', () => {
        // Kalder logout funktionen og logger eventuelle fejl
        logout().catch(error => console.error(error));
    });
});