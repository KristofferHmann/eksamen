
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    // Check if registerForm exists before adding event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const weight = document.getElementById('weight');
            const age = document.getElementById('age');
            const gender = document.querySelector('input[name ="gender"]:checked');

            const userData = {
                username: username.value,
                password: password.value,
                weight: weight.value,
                age: age.value,
                gender: gender.value
            };

            try {
                const response = await fetch('http://localhost:3000/items/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                if (response.ok) {
                    // Redirect to the login page after successful registration
                    window.location.href = '../login/login.html';
                } else {
                    throw new Error('Failed to register user');
                }
            } catch (error) {
                throw new Error('Error fetching data:', error);
            }
        });
    }
});
