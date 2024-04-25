document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const registerForm = document.getElementById('registerForm');

    // Check if registerForm exists before adding event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const userData = {
                brugernavn: formData.get('brugernavn'),
                adgangskode: formData.get('adgangskode'),
                weight: formData.get('weight'),
                height: formData.get('height'),
                gender: formData.get('gender')
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
