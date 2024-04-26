
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');

    testButton.addEventListener('click', async () => {
        try {
            await testFetch();
            console.log('Fetch request successful');
        } catch (error) {
            console.error('Error during fetch request:', error);
        }
    });
});
async function testFetch() {
    try {
        const response = await fetch('http://localhost:3000/items/ingredients');
        if (response.ok) {
            // Process response data if needed
            console.log('Response status:', response.status);
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        throw new Error('Error fetching data:', error);
    }
}