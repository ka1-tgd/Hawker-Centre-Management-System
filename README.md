# HawkerHub - Hawker Center Management System

### Project Description
HawkerHub is a comprehensive web application designed to streamline interactions between **Customers**, **Vendors**, and **NEA Officers**. It provides a digital platform for food ordering, inventory management, and regulatory compliance tracking.

### Color Palette & Design Choice
The project uses a professional and modern color scheme:
*   **Deep Blue (#2b4ba8)**: Used for headers and primary actions. It represents trust, authority (for NEA), and professionalism.
*   **Success Green (#28a745)**: Used for 'OK' statuses and resolved issues to signify safety and completion.
*   **Warning Yellow (#ffc107)**: Used for 'Expiring Soon' or 'Warning' levels to grab attention without causing panic.
*   **Critical Red (#dc3545)**: Used for 'Low Stock' or 'Urgent' alerts to indicate immediate action is required.
*   **Clean White/Light Gray**: Used for backgrounds and cards to ensure high readability and a clean user experience.

---

### Tech Stack
*   **Frontend**: Semantic HTML5, CSS3 (with Media Queries for responsiveness), JavaScript (ES6+).
*   **Backend/Database**: Firebase Realtime Database for live data synchronization.
*   **Icons**: Font Awesome / Boxicons for visual navigation.

---

### Setup & Installation
To run this project locally, follow these steps:

1.  **Download & Extract**: Unzip the project folder to your local machine.
2.  **Firebase Configuration**: 
    *   Ensure you have an active internet connection (the app connects to a live Firebase instance).
    *   The configuration is already set up in `firebase.js`.
3.  **Opening the App**:
    *   Since the project uses ES Modules for JavaScript, you **must** run it through a local server.
    *   **Recommended**: Use the **"Live Server"** extension in VS Code.
    *   Right-click on any HTML file (e.g., `Customer/index.html` or `vendor/pages/inventory.html`) and select **"Open with Live Server"**.
4.  **Accessing Different Portals**:
    *   **Customer**: Navigate to `/Customer/index.html`
    *   **Vendor**: Navigate to `/vendor/pages/inventory.html`
    *   **NEA Officer**: Navigate to `/NEA_Officer_Fixed/nea-dashboard.html`

---

### File & Folder Structure
*   `/Customer`: Contains all files related to the food ordering and checkout system.
*   `/vendor`: Contains the inventory hub, compliance tracking, and vendor dashboards.
*   `/NEA_Officer_Fixed`: Contains the regulatory portal for inspections and complaints.
*   `/assets`: Shared images and the brand logo.
*   `firebase.js`: Central database connection file.

---

### Known Limitations
*   The application requires a stable internet connection to fetch and save data to Firebase.
*   Optimized for Chrome and Edge browsers.

---

### Login test
(Customers)    User:princess                 Password:121212
(Vendor)       User:vendor1@gmail.com        Password:123456
(nea officer)  User:officer.tan@nea.gov.sg   Password:nea12345

---

### Credits
Refer to `credits.html` for full list of external assets and libraries.
