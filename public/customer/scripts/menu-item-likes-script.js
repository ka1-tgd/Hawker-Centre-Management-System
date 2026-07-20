// Adds a Like button to each menu item card. 
const likeToken = localStorage.getItem("token");
const likeUserId = localStorage.getItem("userId");

let likedItemIds = new Map(); // menu_item_id -> LikeID

async function loadUserLikes() {
  try {
    const response = await fetch(`http://localhost:3000/likes/customer/${likeUserId}`, {
      headers: { Authorization: `Bearer ${likeToken}` },
    });
    if (!response.ok) return;
    const likedItems = await response.json();
    likedItems.forEach((like) => likedItemIds.set(like.menu_item_id, like.LikeID));
  } catch (error) {
    console.error("Failed to load likes:", error);
  }
}

function addLikeButton(card) {
  // Skip cards that already have a Like button (the observer can fire
  // more than once for the same card)
  if (card.querySelector(".like-btn")) return;

  const menuItemId = parseInt(card.dataset.id, 10);
  const isLiked = likedItemIds.has(menuItemId);

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "like-btn" + (isLiked ? " liked" : "");
  likeBtn.textContent = isLiked ? "♥ Liked" : "♡ Like";
  likeBtn.dataset.likeId = isLiked ? likedItemIds.get(menuItemId) : "";
  likeBtn.style.border = `1px solid ${isLiked ? "#e63950" : "#ccc"}`;
  likeBtn.style.background = isLiked ? "#e63950" : "white";
  likeBtn.style.color = isLiked ? "white" : "#666";
  likeBtn.style.borderRadius = "20px";
  likeBtn.style.padding = "4px 12px";
  likeBtn.style.cursor = "pointer";
  likeBtn.style.fontSize = "0.85em";
  likeBtn.style.float = "right";

  likeBtn.addEventListener("click", async (event) => {
    // Stop the click from bubbling up to the card's own click handler,
    // so liking an item never also adds it to the cart
    event.stopPropagation();
    await handleLikeClick(likeBtn, menuItemId);
  });

  card.prepend(likeBtn);
}

async function handleLikeClick(likeBtn, menuItemId) {
  const likeId = likeBtn.dataset.likeId;

  try {
    if (likeId) {
      const response = await fetch(`http://localhost:3000/likes/${likeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${likeToken}` },
      });
      if (!response.ok) return;

      likedItemIds.delete(menuItemId);
      likeBtn.dataset.likeId = "";
      likeBtn.textContent = "♡ Like";
      likeBtn.style.background = "white";
      likeBtn.style.color = "#666";
      likeBtn.style.borderColor = "#ccc";
    } else {
      const response = await fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${likeToken}`,
        },
        body: JSON.stringify({ user_id: parseInt(likeUserId, 10), menu_item_id: menuItemId }),
      });
      if (!response.ok) return;

      const newLike = await response.json();
      likedItemIds.set(menuItemId, newLike.LikeID);
      likeBtn.dataset.likeId = newLike.LikeID;
      likeBtn.textContent = "♥ Liked";
      likeBtn.style.background = "#e63950";
      likeBtn.style.color = "white";
      likeBtn.style.borderColor = "#e63950";
    }
  } catch (error) {
    console.error("Failed to update like:", error);
  }
}

// Watch the page for menu item cards being added (by the teammate's
// script), and attach a Like button to each one as it appears
async function watchForMenuItems() {
  await loadUserLikes();

  const contentContainer = document.querySelector(".content");
  if (!contentContainer) return;

  // Handle any cards that are already on the page
  contentContainer.querySelectorAll(".menuItem").forEach(addLikeButton);

  // Handle cards added later (menu-items-script.js renders them async)
  const observer = new MutationObserver(() => {
    contentContainer.querySelectorAll(".menuItem").forEach(addLikeButton);
  });

  observer.observe(contentContainer, { childList: true, subtree: true });
}

watchForMenuItems();