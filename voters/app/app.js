async function fetchCandidates() {
  const urlParams = new URLSearchParams(window.location.search);
  const voterId = urlParams.get("voterid");
  // Fetch the candidates and populate the select element
  await fetch("http://localhost:4200/candidates")
    .then((response) => response.json())
    .then((candidates) => {
      const select = document.getElementById("candidates");
      candidates.forEach((candidate) => {
        const option = document.createElement("option");
        option.value = candidate._id;
        option.textContent = candidate.name;
        select.appendChild(option);
      });
    });
}

// Function to handle form submission
async function submitBallot(event) {
  event.preventDefault();
  const voterId = new URLSearchParams(window.location.search).get("voterid");
  const selectedCandidateId = document.getElementById("candidates").value;
  const response = await fetch(
    `http://localhost:4200/voter/${voterId}/ballot`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ candidate: selectedCandidateId }),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    alert("Ballot submitted successfully");
    window.location.assign("http://localhost:8080/uva-cs4260/voters/html/index.html");
  }
}

function toggleModal(event) {
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on the button, open the modal
  btn.onclick = function () {
    modal.style.display = "block";
    fetchResults();
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// Fetch results from the server and display them in the modal
async function fetchResults() {
  const response = await fetch("http://localhost:4200/candidates/ballots");
  const results = await response.json();
  const resultsList = document.getElementById("results-list");
  resultsList.innerHTML = "";
  for (const candidate in results) {
    const listItem = document.createElement("li");
    listItem.textContent = `${candidate}: ${results[candidate]}`;
    resultsList.appendChild(listItem);
  }
}

// Event listener for DOMContentLoaded to fetch candidates
document.addEventListener("DOMContentLoaded", function () {
  fetchCandidates();
  const form = document.querySelector("form");
  form.addEventListener("submit", submitBallot);
});

async function registerVoter() {
  const response = await fetch("http://localhost:4200/voter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: document.getElementById("voterRegister").value,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();
    console.log(data);
    fetchVoters();
  }
}

async function fetchVoters() {
  // Fetch voters data for the Current Voters section
  fetch("http://localhost:4200/voter")
    .then((response) => response.json())
    .then((data) => {
      const votersList = document.getElementById("voters-list");
      const pendingList = document.getElementById("pending-list");

      votersList.innerHTML = "";
      pendingList.innerHTML = "";

      data.forEach((voter) => {
        const listItem = document.createElement("li");
        listItem.classList.add("profile-card");

        const content = document.createElement("div");
        content.classList.add("profile-card-content");
        listItem.appendChild(content);

        // Create a link for each voter's name
        const title = document.createElement("a");
        title.classList.add("profile-card-title");
        title.textContent = voter.name;
        title.href = `http://localhost:8080/uva-cs4260/voters/html/ballot.html?voterid=${voter._id}`; // Redirect to individual ballot page
        title.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.href = `http://localhost:8080/uva-cs4260/voters/html/ballot.html?voterid=${voter._id}`;
        });

        content.appendChild(title);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        content.appendChild(deleteButton);

        // Add a click event listener to the delete button
        deleteButton.addEventListener("click", function () {
            deleteVoter(voter._id);
        });

        if (voter.ballot.candidate == null) {
          pendingList.appendChild(listItem);
        } else {
          votersList.appendChild(listItem);
        }
      });
    })
    .catch((error) => console.error("Error:", error));
}

// Function to delete a voter
function deleteVoter(voterId) {
    fetch(`http://localhost:4200/voter/${voterId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log(`Voter with ID ${voterId} deleted successfully`);
          // Refresh the list of voters
          fetchVoters();
        }
      })
      .catch((error) => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  fetchVoters();
});
