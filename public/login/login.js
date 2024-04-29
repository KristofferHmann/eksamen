document.querySelector('.loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const userData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value

  };

  fetch('http://localhost:3000/items/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (response.ok) {
        window.location.href = '../mealcreator/mealcreator.html'
      } else {
        return response.json(); // Parse response body as JSON
      }
    })
    .then(data => {
      // Display error message returned by the server
      if (data && data.error) {
        throw new Error(data.error);
      }
    })
    .catch(error => alert(error.message));
});
