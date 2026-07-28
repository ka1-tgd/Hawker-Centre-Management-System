const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["./app.js"];

const doc = {
  info: {
    title: "Hawker Centre Management API",
    description: "API documentation for the BED Assignment - Singapore Hawker Centre Management System",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

swaggerAutogen(outputFile, routes, doc);