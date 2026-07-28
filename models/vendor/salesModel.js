// ============================================================
// Sales Model
// Handles the database queries and third-party chart generation
// for the Sales Analytics Dashboard feature.
// ============================================================

const sql = require("mssql");
const dbConfig = require("../../dbConfig");
const axios = require("axios");

// Get the top 5 best-selling menu items for a stall, ranked by
// total quantity sold across all of that stall's orders.
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

// Get the number of orders placed at each hour of the day for a
// stall, used to identify the stall's peak business hours.
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

// Get the total revenue and total number of orders for a stall,
// used for the summary cards at the top of the dashboard.
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

// Build a bar chart of the stall's top-selling items and send it
// to the QuickChart third-party API, which returns a hosted image
// URL that the front-end can display directly in an <img> tag.
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
        // Force whole-number ticks on the Y axis so small values
        // don't render as decimals like 0.2, 0.4
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