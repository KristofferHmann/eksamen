async function signup(userData) {
    try {
        const response = await fetch('http://localhost:3000/items/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            return true; // Registration successful
        } else {
            throw new Error('Failed to register user');
        }
    } catch (error) {
        throw new Error('Error fetching data:', error);
    }
}

export { signup };
