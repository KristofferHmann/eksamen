document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const registerForm = document.getElementById('registerForm');

    // Check if registerForm exists before adding event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const userData = {
                brugernavn: formData.get('username'),
                adgangskode: formData.get('password'),
                weight: formData.get('weight'),
                height: formData.get('height'),
                age: formData.get('age'),
                gender: formData.get('gender')
            };

            try {
                const response = await fetch('http://127.0.0.1/items/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('User registered successfully:', data);
                    alert('User registered successfully!');
                    // Redirect to the login page
                    window.location.href = '../login/login.html';
                } else {
                    const errorMessage = await response.text();
                    console.error('Registration failed:', errorMessage);
                    alert('Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during registration:', error.message);
                alert('An error occurred. Please try again.');
            }
        });
    } else {
        console.error('Register form element not found');
    }
});
