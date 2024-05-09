document.addEventListener('DOMContentLoaded', () => {
  // Function to fetch waterData and update the table
  function fetchAndUpdate() {
    // Fetch waterData from localStorage
    const waterData = JSON.parse(localStorage.getItem('waterData')) || [];

    // Get the current date
    const now = new Date();

    // Filter the data based on the timestamp
    const filteredData = waterData.filter(data => {
      // Extract the date and time from the string
      const dateTime = data.waterTime.split('Added on: ')[1];

      // Convert the date string to the format "mm-dd-yyyy hh:mm:ss"
      const dateParts = dateTime.split(' ')[0].split('-');
      const timePart = dateTime.split(' ')[1];
      const formattedDateTime = `${dateParts[1]}-${dateParts[0]}-${dateParts[2]} ${timePart}`;

      // Convert the date and time string to a Date object
      const dataDate = new Date(formattedDateTime);

      // Calculate the difference in days
      const diffInDays = (now - dataDate) / (1000 * 60 * 60 * 24);

      // Check if the difference is less than or equal to 24 hours
      return diffInDays <= 1;
    });

    // Update the table with filteredData
    updateTable(filteredData);
  }

  // Function to update the table
  function updateTable(data) {
    const tbody = document.getElementById('overview');
    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.waterTime}</td>
        <td>${item.ingredientname}</td>
        <td>${item.waterAmount}</td>
        <td></td>
        <td></td>
        <td></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Initial table update
  fetchAndUpdate();
});