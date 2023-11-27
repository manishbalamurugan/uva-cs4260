fetch('http://localhost:4200/voter')
  .then(response => response.json())
  .then(data => {
    const votersList = document.getElementById('voters-list');
    data.forEach(voter => {
      const listItem = document.createElement('li');
      listItem.classList.add('profile-card');

      const content = document.createElement('div');
      content.classList.add('profile-card-content');
      listItem.appendChild(content);

      const title = document.createElement('h3');
      title.classList.add('profile-card-title');
      title.textContent = voter.name; // assuming each voter object has a 'name' property
      content.appendChild(title);

      votersList.appendChild(listItem);
    });
  })
  .catch(error => console.error('Error:', error));