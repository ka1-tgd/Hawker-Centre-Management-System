// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// 1) get all orders by stall ID
// 2) get order items in an order by order_id
// 3) update CustOrder status to ('Preparing'/'Completed'/'Cancelled')