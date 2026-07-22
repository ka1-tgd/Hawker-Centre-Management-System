const sql = require("mssql");
const dbConfig = require("../../dbConfig");
const axios = require("axios");

// Get top 5 best-selling menu items for a stall
async function getPopularItems(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 5 mi.item_name, SUM(oi.quantity) AS total_quantity
      FROM OrderItem oi
      INNER JOIN MenuItem mi ON mi.menu_item_id = oi.menu_item_id
      WHERE oi.stall_id = @stallId
      GROUP BY mi.item_name
      ORDER BY total_quantity DESC
    `;
    const request = connection.request();
    request.input("stallId", stallId);
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

// Get order counts grouped by hour of day for a stall
async function getPeakHours(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT DATEPART(HOUR, co.order_date) AS hour_of_day, COUNT(DISTINCT co.order_id) AS order_count
      FROM CustOrder co
      INNER JOIN OrderItem oi ON oi.order_id = co.order_id
      WHERE oi.stall_id = @stallId
      GROUP BY DATEPART(HOUR, co.order_date)
      ORDER BY hour_of_day ASC
    `;
    const request = connection.request();
    request.input("stallId", stallId);
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

// Get total revenue and order count summary for a stall
async function getRevenueSummary(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT SUM(oi.quantity * oi.unit_price) AS total_revenue, COUNT(DISTINCT co.order_id) AS total_orders
      FROM OrderItem oi
      INNER JOIN CustOrder co ON co.order_id = oi.order_id
      WHERE oi.stall_id = @stallId
    `;
    const request = connection.request();
    request.input("stallId", stallId);
    const result = await request.query(query);

    return result.recordset[0];
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

// Generate a bar chart image URL for popular items using QuickChart API
async function generatePopularItemsChart(stallId) {
  try {
    const items = await getPopularItems(stallId);

    const chartConfig = {
      type: "bar",
      data: {
        labels: items.map((item) => item.item_name),
        datasets: [
          {
            label: "Quantity Sold",
            data: items.map((item) => item.total_quantity),
            backgroundColor: "#26a354",
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Top Selling Items",
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          ],
        },
      },
    };

    const response = await axios.post("https://quickchart.io/chart/create", {
      chart: chartConfig,
    });

    return response.data.url;
  } catch (error) {
    console.error("Chart generation error:", error);
    throw error;
  }
}

module.exports = {
  getPopularItems,
  getPeakHours,
  getRevenueSummary,
  generatePopularItemsChart,
};