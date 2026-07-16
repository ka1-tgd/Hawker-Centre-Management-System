// userId is declared inline in feedback.html

const orderSelect = document.getElementById("orderSelect");
const ratingSelect = document.getElementById("ratingSelect");
const commentInput = document.getElementById("commentInput");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackListDiv = document.getElementById("feedbackList");
const messageDiv = document.getElementById("message");

// Load the customer's past orders into the dropdown
async function loadEligibleOrders() {
  try {
    const response = await fetch(`/feedback/orders/${userId}`);
    const eligibleOrders = await response.json();

    if (eligibleOrders.length === 0) {
      orderSelect.innerHTML = '<option value="">No past orders to review</option>';
      return;
    }

    orderSelect.innerHTML = "";
    eligibleOrders.forEach((order) => {
      const option = document.createElement("option");
      option.value = `${order.order_id}-${order.stall_id}`;
      const orderDate = new Date(order.order_date).toLocaleDateString();
      option.textContent = `Order #${order.order_id} - ${order.stall_name} (${orderDate}): ${order.items.join(", ")}`;
      orderSelect.appendChild(option);
    });

    // If a specific order was passed in via ?orderId=, pre-select it
    if (preselectOrderId) {
      const match = eligibleOrders.find((order) => order.order_id === preselectOrderId);
      if (match) {
        orderSelect.value = `${match.order_id}-${match.stall_id}`;
      }
    }
  } catch (error) {
    console.error(error);
    orderSelect.innerHTML = '<option value="">Failed to load orders</option>';
  }
}

// Load the customer's previously submitted feedback
async function loadMyFeedback() {
  try {
    feedbackListDiv.innerHTML = "Loading your feedback...";

    const response = await fetch(`/feedback/customer/${userId}`);
    const feedbackItems = await response.json();

    if (feedbackItems.length === 0) {
      feedbackListDiv.innerHTML = "<p>You haven't submitted any feedback yet.</p>";
      return;
    }

    feedbackListDiv.innerHTML = "";

    feedbackItems.forEach((item) => {
      const feedbackElement = document.createElement("div");
      feedbackElement.classList.add("feedback-item");

      const submittedDate = new Date(item.CreatedDate).toLocaleDateString();

      feedbackElement.innerHTML = `
        <div class="feedback-display">
          <strong>${item.stall_name}</strong>
          <span>Rating: ${item.Rating}/5</span>
          <p class="feedback-items">Ordered: ${item.items.join(", ")}</p>
          <p class="feedback-comment">${item.Comment || "(no comment)"}</p>
          <span class="feedback-date">Submitted: ${submittedDate}</span>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      feedbackElement.querySelector(".edit-btn").addEventListener("click", () => showEditForm(feedbackElement, item));
      feedbackElement.querySelector(".delete-btn").addEventListener("click", () => handleDeleteFeedback(item.FeedbackID, feedbackElement));

      feedbackListDiv.appendChild(feedbackElement);
    });
  } catch (error) {
    console.error(error);
    feedbackListDiv.innerHTML = "<p>Failed to load your feedback</p>";
  }
}

// Swap a feedback item's display into an editable form
function showEditForm(feedbackElement, item) {
  feedbackElement.innerHTML = `
    <div class="feedback-edit">
      <strong>${item.stall_name}</strong>
      <select class="edit-rating">
        <option value="5" ${item.Rating === 5 ? "selected" : ""}>5 - Excellent</option>
        <option value="4" ${item.Rating === 4 ? "selected" : ""}>4 - Good</option>
        <option value="3" ${item.Rating === 3 ? "selected" : ""}>3 - Average</option>
        <option value="2" ${item.Rating === 2 ? "selected" : ""}>2 - Poor</option>
        <option value="1" ${item.Rating === 1 ? "selected" : ""}>1 - Very Poor</option>
      </select>
      <textarea class="edit-comment" rows="3" maxlength="500">${item.Comment || ""}</textarea>
      <button class="save-btn">Save</button>
      <button class="cancel-btn">Cancel</button>
    </div>
  `;

  feedbackElement.querySelector(".save-btn").addEventListener("click", () => handleSaveFeedback(item.FeedbackID, feedbackElement));
  feedbackElement.querySelector(".cancel-btn").addEventListener("click", loadMyFeedback);
}

// Save an edited feedback entry
async function handleSaveFeedback(feedbackId, feedbackElement) {
  const rating = parseInt(feedbackElement.querySelector(".edit-rating").value);
  const comment = feedbackElement.querySelector(".edit-comment").value;

  try {
    const response = await fetch(`/feedback/${feedbackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Rating: rating, Comment: comment }),
    });

    if (response.ok) {
      messageDiv.textContent = "Feedback updated!";
      messageDiv.style.color = "green";
      loadMyFeedback();
    } else {
      const data = await response.json();
      messageDiv.textContent = data.error;
      messageDiv.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to update feedback";
    messageDiv.style.color = "red";
  }
}

// Delete a feedback entry
async function handleDeleteFeedback(feedbackId, feedbackElement) {
  const confirmDelete = confirm("Delete this feedback?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/feedback/${feedbackId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      feedbackElement.remove();
      messageDiv.textContent = "Feedback deleted";
      messageDiv.style.color = "green";
    } else {
      messageDiv.textContent = "Failed to delete feedback";
      messageDiv.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to delete feedback";
    messageDiv.style.color = "red";
  }
}

// Handle submitting new feedback
feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const [order_id, stall_id] = orderSelect.value.split("-").map(Number);

  if (!order_id || !stall_id) {
    messageDiv.textContent = "Please select an order first";
    messageDiv.style.color = "red";
    return;
  }

  try {
    const response = await fetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id,
        user_id: userId,
        stall_id,
        Rating: parseInt(ratingSelect.value),
        Comment: commentInput.value,
      }),
    });

    if (response.status === 201) {
      const data = await response.json();
      messageDiv.textContent = `Feedback submitted, thank you! You earned ${data.pointsEarned} loyalty points.`;
      messageDiv.style.color = "green";
      feedbackForm.reset();
      loadMyFeedback();
    } else {
      const data = await response.json();
      messageDiv.textContent = data.error;
      messageDiv.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Failed to submit feedback";
    messageDiv.style.color = "red";
  }
});

window.addEventListener("load", () => {
  loadEligibleOrders();
  loadMyFeedback();
});