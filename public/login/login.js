document.querySelector('.loginSite').addEventListener('submit', function (e) {
  e.preventDefault();

  fetch('http://localhost:3000/items/login', {
    method: 'POST',
    body: JSON.stringify(userData.username && userData)
  })
    .then(response => {
      if (response.ok) {
        window.location.href = '../mealcreator/mealcreator.html'
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => alert(data))
    .catch(error => alert(error.message));
});

