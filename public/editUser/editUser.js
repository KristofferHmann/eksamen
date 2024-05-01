// // Assuming you have the user's ID stored in a variable named userId


// // Make an HTTP GET request to fetch user data
// fetch(`/items/users/${user_ID}`)
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Failed to fetch user data');
//         }
//         return response.json();
//     })
//     .then(userData => {
//         // Handle the fetched user data
//         console.log(userData); // Log the user data to the console (you can do further processing here)
//         // Example: Populate form fields with fetched user data for editing
//         document.getElementById('username').value = userData.username;
//         document.getElementById('password').value = userData.password;
//         document.getElementById('gender').value = userData.gender;
//         document.getElementById('weight').value = userData.weight;
//         document.getElementById('age').value = userData.age;
//     })
//     .catch(error => {
//         console.error('Error fetching user data:', error.message);
//         // Handle error (e.g., display an error message to the user)
//     });

// Function to handle user editing
async function updateUser(updatedUserData) {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:3000/items/edit`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(updatedUserData)
    });

    if (!response.ok) {
        console.error('Failed to update user');
        return;
    }

    const data = await response.json();
    console.log(data.message); // Log the response from the server
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();

    const genderRadios = document.getElementsByName('gender');
    let selectedGender;
    for (const radio of genderRadios) {
        if (radio.checked) {
            selectedGender = radio.value;
            break;
        }
    }

    const updatedUserData = {
        gender: selectedGender,
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value)
    };

    // Call the updateUser function to update user information
    updateUser(updatedUserData).catch(error => console.error(error));
}

// Add event listener to the update button
const updateButton = document.getElementById('updateButton');
updateButton.addEventListener('click', handleSubmit);











// Delete function
async function deleteUser() {
    const token = localStorage.getItem('token');

    // Show confirmation dialog
    const confirmDelete = confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) {
        return; // Abort deletion if user cancels
    }

    const response = await fetch('http://localhost:3000/items/delete', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token, // Assuming token is available
        }
    });

    if (!response.ok) {
        // Handle error responses
        console.error('Failed to delete user');
        return;
    }

    const data = await response.text();
    console.log(data); // Log the response from the server
}

// Assuming you have a delete button in your HTML with id="deleteButton"
const deleteButton = document.getElementById('deleteButton');
deleteButton.addEventListener('click', () => {
    deleteUser().catch(error => console.error(error));
});



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
    }
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', () => {
    logout().catch(error => console.error(error));
});