//Logout funktion
async function logout() {
    const token = localStorage.getItem("token");

    // Make an HTTP GET request to the logout endpoint
    const response = await fetch('http://localhost:3000/items/logout', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token, // Assuming token is available
        }
    });
    // Debugging: Log the response from the server
    console.log(response);

    if (!response.ok) {
        // Handle 401 Unauthorized response
        if (response.status === 401) {
            console.error('Unauthorized: Token expired or invalid.');
            // Handle expired or invalid token
            // Redirect to login page or display a message to the user
        } else {
            throw new Error('Failed to fetch logout');
        }
    } else {
        // Clear the token from the client-side localStorage if the logout was successful
        localStorage.removeItem('token');
        console.log('Logout successful');
        // Reload the page
        location.reload();
    }
}

const logoutButton = document.getElementsByClassName('outBtn')[0];
logoutButton.addEventListener('click', () => {
    logout().catch(error => console.error(error));
});