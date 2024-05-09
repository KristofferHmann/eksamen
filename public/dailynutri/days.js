document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch waterData and update the table
    function fetchAndUpdate() {
      // Fetch waterData from localStorage
      const waterData = JSON.parse(localStorage.getItem('waterData')) || [];
  
      // Group the data by date and calculate the total water amount for each day
      const groupedData = waterData.reduce((acc, data) => {
        // Extract the date from the string
        const date = data.waterTime.split('Added on: ')[1].split(' ')[0];
  
        // If the date is already in the accumulator, add the waterAmount
        // Otherwise, initialize the date with the waterAmount
        acc[date] = (acc[date] || 0) + Number(data.waterAmount);
  
        return acc;
      }, {});
  
      // Update the table with groupedData
      updateTable(groupedData);
    }
  
    // Function to update the table
    function updateTable(data) {
      const tbody = document.getElementById('overview');
      tbody.innerHTML = ''; // Clear existing rows
  
      for (const date in data) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${date}</td>
          <td>Water, tap, drinking, average values</td>
          <td>${data[date]}</td>
          <td></td>
          <td></td>
          <td></td>
        `;
        tbody.appendChild(row);
      }
    }
  
    // Initial table update
    fetchAndUpdate();
  });