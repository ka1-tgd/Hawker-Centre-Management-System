// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get a customer's current points and tier.
async function getLoyaltyPoints(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT CurrentPoints, Tier FROM LoyaltyPoints WHERE user_id = @userId";
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    if (result.recordset[0]) {
      return result.recordset[0];
    }

    // No record yet - create one with the table's own defaults
    const insertRequest = connection.request();
    insertRequest.input("userId", userId);
    await insertRequest.query(
      "INSERT INTO LoyaltyPoints (user_id) VALUES (@userId)"
    );

    return { CurrentPoints: 0, Tier: "Bronze" };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get all rewards that are currently active
async function getActiveRewards() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT RewardID, RewardName, PointsRequired, DiscountType, DiscountValue, Description FROM Reward WHERE IsActive = 'Active' ORDER BY PointsRequired ASC";
    const result = await connection.request().query(query);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get a single reward by ID
async function getRewardById(rewardId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Reward WHERE RewardID = @rewardId";
    const request = connection.request();
    request.input("rewardId", rewardId);
    const result = await request.query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Redeem a reward: log it in RedemptionHistory and deduct the points used
async function redeemReward(userId, rewardId, pointsRequired) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Log the redemption
    const insertRequest = connection.request();
    insertRequest.input("userId", userId);
    insertRequest.input("rewardId", rewardId);
    insertRequest.input("pointsUsed", pointsRequired);
    await insertRequest.query(
      "INSERT INTO RedemptionHistory (user_id, RewardID, PointsUsed) VALUES (@userId, @rewardId, @pointsUsed)"
    );

    // Deduct the points used from the customer's balance
    const updateRequest = connection.request();
    updateRequest.input("userId", userId);
    updateRequest.input("pointsRequired", pointsRequired);
    await updateRequest.query(
      "UPDATE LoyaltyPoints SET CurrentPoints = CurrentPoints - @pointsRequired, LastUpdated = GETDATE() WHERE user_id = @userId"
    );

    // Return the updated points so the frontend can refresh the display
    return await getLoyaltyPoints(userId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get a customer's redemption history (their reward claim receipts to show in person)
async function getRedemptionHistory(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT rh.RedemptionID, rh.RewardID, r.RewardName, r.DiscountType, r.DiscountValue, r.Description, rh.PointsUsed, rh.RedeemedDate
      FROM RedemptionHistory rh
      JOIN Reward r ON rh.RewardID = r.RewardID
      WHERE rh.user_id = @userId
      ORDER BY rh.RedeemedDate DESC
    `;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get a single redemption by ID (used to check ownership and get points to refund)
async function getRedemptionById(redemptionId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM RedemptionHistory WHERE RedemptionID = @id";
    const request = connection.request();
    request.input("id", redemptionId);
    const result = await request.query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Cancel a redemption: delete it and refund the points used
async function deleteRedemption(redemptionId, userId, pointsUsed) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const deleteRequest = connection.request();
    deleteRequest.input("id", redemptionId);
    deleteRequest.input("userId", userId);
    const deleteResult = await deleteRequest.query(
      "DELETE FROM RedemptionHistory WHERE RedemptionID = @id AND user_id = @userId"
    );

    if (deleteResult.rowsAffected[0] === 0) {
      return false;
    }

    // Reconnect before the refund update
    connection = await sql.connect(dbConfig);
    const refundRequest = connection.request();
    refundRequest.input("userId", userId);
    refundRequest.input("points", pointsUsed);
    await refundRequest.query(
      "UPDATE LoyaltyPoints SET CurrentPoints = CurrentPoints + @points, LastUpdated = GETDATE() WHERE user_id = @userId"
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get a customer's basic profile info to display on the account page
async function getUserProfile(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT user_id, name, contact_no, email FROM Users WHERE user_id = @userId";
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getLoyaltyPoints,
  getActiveRewards,
  getRewardById,
  redeemReward,
  getRedemptionHistory,
  getRedemptionById,
  deleteRedemption,
  getUserProfile,
};