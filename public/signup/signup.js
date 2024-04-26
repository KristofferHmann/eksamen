
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    // Check if registerForm exists before adding event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const weight = document.getElementById('weight');
            const height = document.getElementById('height');
            const age = document.getElementById('age');
            const gender = document.querySelector('input[name ="gender"]:checked');

            const userData = {
                username: username.value,
                password: password.value,
                weight: weight.value,
                height: height.value,
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
                    // Process response data if needed
                    console.log('Response status:', response.status);
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (error) {
                throw new Error('Error fetching data:', error);
            }
        });
    } else {
        console.error('Register form element not found');
    }
});
