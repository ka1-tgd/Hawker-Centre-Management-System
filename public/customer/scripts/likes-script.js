// userId is declared inline in likes.html

// The login token saved by login.js after a successful login
const token = localStorage.getItem("token");

const likesListDiv = document.getElementById("likesList");
const messageDiv = document.getElementById("message");

// Load all menu items the current user has liked
async function loadLikes() {
  try {
    likesListDiv.innerHTML = "Loading likes...";

    const response = await fetch(`/likes/customer/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      likesListDiv.innerHTML = "<p>Authentication failed! Please login.</p>";
      return;
    }

    const likedItems = await response.json();

    if (likedItems.length === 0) {
      likesListDiv.innerHTML = "<p>You haven't liked any items yet.</p>";
      return;
    }

    likesListDiv.innerHTML = "";

    likedItems.forEach((item) => {
      const likeElement = document.createElement("div");
      likeElement.classList.add("like-item");

      const likedDate = new Date(item.CreatedDate).toLocaleDateString();
      const price = Number(item.price).toFixed(2);

      likeElement.innerHTML = `
        <span>${item.item_name}</span>
        <span>Price: $${price}</span>
        <span>Liked on: ${likedDate}</span>
        <button data-like-id="${item.LikeID}">Unlike</button>
      `;

      likeElement.querySelector("button").addEventListener("click", handleUnlikeClick);
      likesListDiv.appendChild(likeElement);
    });
  } catch (error) {
    console.error(error);
    likesListDiv.innerHTML = "<p>Failed to load likes</p>";
  }
}

// Handle clicking "Unlike" - removes the like and the row from the page
async function handleUnlikeClick(event) {
  const likeId = event.target.getAttribute("data-like-id");

  try {
    const response = await fetch(`/likes/${likeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      event.target.closest(".like-item").remove();
      messageDiv.textContent = "Item unliked";
      messageDiv.style.color = "green";
    } else if (response.status === 401 || response.status === 403) {
      messageDiv.textContent = "Authentication failed! Please login.";
      messageDiv.style.color = "red";
    } else {
      messageDiv.textContent = "Failed to unlike item";
      messageDiv.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to unlike item";
    messageDiv.style.color = "red";
  }
}

window.addEventListener("load", loadLikes);