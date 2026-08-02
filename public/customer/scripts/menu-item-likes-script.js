// Adds a Like button to each menu item card.

// Prefixed with "like" to avoid clashing with variables declared in
// menu-items-script.js, which runs on the same page in the same global scope
const likeToken = localStorage.getItem("token");
const likeUserId = localStorage.getItem("userId");

let likedItemIds = new Map();

async function loadUserLikes() {
  try {
    const response = await fetch(`/likes/customer/${likeUserId}`, {
      headers: { Authorization: `Bearer ${likeToken}` },
    });
    if (!response.ok) return;
    const likedItems = await response.json();
    likedItems.forEach((like) => likedItemIds.set(like.menu_item_id, like.LikeID));
  } catch (error) {
    console.error("Failed to load likes:", error);
  }
}

// Apply the visual "liked" or "not liked" state to a like button
function applyLikeStyle(likeBtn, isLiked) {
  likeBtn.textContent = isLiked ? "♥ Liked" : "♡ Like";
  likeBtn.style.background = isLiked ? "#e63950" : "white";
  likeBtn.style.color = isLiked ? "white" : "#666";
  likeBtn.style.borderColor = isLiked ? "#e63950" : "#ccc";
}

function addLikeButton(card) {
  // Skip cards that already have a Like button
  if (card.querySelector(".like-btn")) return;

  const menuItemId = parseInt(card.dataset.id, 10);
  const isLiked = likedItemIds.has(menuItemId);

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "like-btn" + (isLiked ? " liked" : "");
  likeBtn.dataset.likeId = isLiked ? likedItemIds.get(menuItemId) : "";
  likeBtn.style.border = "1px solid";
  likeBtn.style.borderRadius = "20px";
  likeBtn.style.padding = "4px 12px";
  likeBtn.style.cursor = "pointer";
  likeBtn.style.fontSize = "0.85em";
  likeBtn.style.float = "right";
  applyLikeStyle(likeBtn, isLiked);

  likeBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleLikeClick(likeBtn, menuItemId);
  });

  card.prepend(likeBtn);
}

async function handleLikeClick(likeBtn, menuItemId) {
  const likeId = likeBtn.dataset.likeId;

  try {
    if (likeId) {
      const response = await fetch(`/likes/${likeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${likeToken}` },
      });
      if (!response.ok) return;

      likedItemIds.delete(menuItemId);
      likeBtn.dataset.likeId = "";
      applyLikeStyle(likeBtn, false);
    } else {
      const response = await fetch("/likes", {
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
      applyLikeStyle(likeBtn, true);
    }
  } catch (error) {
    console.error("Failed to update like:", error);
  }
}

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