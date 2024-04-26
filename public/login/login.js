document.querySelector('.loginSite').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch('http://localhost:3000/items/login', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (response.ok) {
        window.location.href = '../mealcreator/mealcreator.html'
      } else {
      throw new Error('Login failed');
  }})
  .then(data => alert(data))
  .catch(error => alert(error.message));
});