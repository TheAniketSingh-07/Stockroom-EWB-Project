# Stockroom — Interactive Product Inventory & Analytics Dashboard

A modern, responsive inventory management dashboard designed to simplify product tracking, inventory valuation, price-based categorization, and financial insights through a clean and intuitive interface.

## Overview

**Stockroom** is a web-based inventory management application that helps users organize products, monitor inventory value, and understand product pricing through an interactive dashboard. It combines a minimalist user interface with JavaScript-based data processing to present inventory information in a clear and accessible format.

The project focuses on applying core JavaScript and modern frontend development concepts to a practical retail inventory management use case.

## Features

- **Inventory Overview:** View total inventory value, product count, and key inventory statistics.
- **Product Management:** Add products and manage product information through an interactive interface.
- **Smart Categorization:** Categorize products automatically according to their prices.
- **Inventory Filtering:** Explore products using category-based filters, including budget, standard, and premium categories.
- **Financial Calculations:** Display adjusted inventory values using configurable tax and discount calculations.
- **Inventory Analytics:** Present useful summaries to help users understand product distribution and inventory performance.
- **Responsive Interface:** Clean dashboard layout designed for convenient use across different screen sizes.
- **Modern UI:** Minimal styling, clear typography, intuitive navigation, and reusable interface components.

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript (ES6+) | Application logic and data processing |
| React | Component-based user interface |
| TanStack Start | Application routing and rendering |
| Vite | Development server and build tooling |
| Tailwind CSS | Responsive styling and UI design |
| HTML5 | Web application structure |
| CSS3 | Layout, visual styling, and presentation |
| npm | Dependency management and project scripts |

## JavaScript Concepts Applied

This project demonstrates practical application of core JavaScript concepts, including:

- Variables, data types, operators, and type conversion
- Conditional statements and decision-making
- Functions, arrow functions, and scope
- Arrays and objects for product data management
- Array methods such as `map()`, `filter()`, and `forEach()`
- Event handling and interactive UI behavior
- Reusable functions for calculations and data transformation

## Getting Started

### Prerequisites

Ensure that the following tools are installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/stockroom-inventory-dashboard.git
```

**2. Navigate to the project directory**

```bash
cd stockroom-inventory-dashboard
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### Production Build

To generate a production build, run:

```bash
npm run build
```

Use the build output and deployment configuration specified by the project when deploying the application.

## Project Structure

```text
stockroom-inventory-dashboard/
├── public/             # Static assets and application icons
├── scripts/            # Build and utility scripts
├── src/                # Application source code
│   └── routes/         # Application routes and root layout
├── package.json        # Dependencies and npm scripts
├── package-lock.json   # Dependency lockfile
├── vite.config.js      # Vite and application configuration
├── .gitignore          # Files excluded from Git
└── README.md           # Project documentation
```

*Note: The structure above highlights the main directories and files; additional files may be present in the repository.*

## Learning Outcomes

Developing Stockroom provided practical experience in JavaScript-driven application development, component-based UI design, frontend tooling, dependency management, and building an interactive dashboard around a real-world business problem.

The project demonstrates how fundamental programming concepts can be combined with modern web technologies to create a useful and visually organized application.

## Future Enhancements

- Persistent storage using a database
- Product search, sorting, and advanced filtering
- Low-stock alerts and inventory notifications
- Product export and downloadable reports
- User authentication and role-based access
- Historical analytics and inventory trend visualizations

## Internship Acknowledgement

**This project was developed as part of my JavaScript Web Development Internship at EWB under the AICTE internship initiative.** It reflects my practical learning and application of JavaScript fundamentals and modern web development technologies in an inventory management project.

---

**Project:** Stockroom — Inventory Management Dashboard  
**Domain:** JavaScript Web Development  
**Internship:** EWB — AICTE Internship Initiative
