// Assuming you have the user's ID stored in a variable named userId

// Make an HTTP GET request to fetch user data
fetch(`/items/users/${user_ID}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(userData => {
        // Handle the fetched user data
        console.log(userData); // Log the user data to the console (you can do further processing here)
        // Example: Populate form fields with fetched user data for editing
        document.getElementById('username').value = userData.username;
        document.getElementById('password').value = userData.password;
        document.getElementById('gender').value = userData.gender;
        document.getElementById('weight').value = userData.weight;
        document.getElementById('age').value = userData.age;
    })
    .catch(error => {
        console.error('Error fetching user data:', error.message);
        // Handle error (e.g., display an error message to the user)
    });

    document.addEventListener('DOMContentLoaded', function() {
        const deleteButton = document.getElementById('delete-user');
    
        deleteButton.addEventListener('click', async function() {
            try {
                
                const userId = getUserId(); 
    
                // Call the deleteUser function with the userId
                const rowsAffected = await deleteUser(userId);
    
                // Check if the deletion was successful
                if (rowsAffected > 0) {
                    console.log('User deleted successfully');
                   
                } else {
                    console.log('User not found or could not be deleted');
                }
            } catch (error) {
                console.error('Error deleting user:', error.message);
                // Optionally, display an error message to the user
            }
        });
    });


