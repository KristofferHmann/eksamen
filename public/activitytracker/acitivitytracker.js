document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/items/activities', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },


        });
        if (response.ok) {
            const data = await response.json();
            console.log('Data fetched successfully:', data);
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
