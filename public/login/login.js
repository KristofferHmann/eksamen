let loginBtn = document.getElementById('loginBtn')
loginBtn.addEventListener('click', async () => {
  const userData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value

  };
  
  const data = await fetch('http://localhost:3000/items/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  const token = await data.json()
  if (!token) {
    return alert("noget gik galt!!!!!!")
  } else {
    
    window.location.href = '../mealcreator/mealcreator.html'
    localStorage.setItem("token", token)
  }

    
});
