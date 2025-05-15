# Eco Admin Panel

A modern, responsive admin panel for managing vendors, products, retailers, and customer questions for the Eco e-commerce platform.

## Features

- Dashboard with key metrics and statistics
- Vendor management with product listings
- Product catalog with sorting and filtering
- Retailer management with block/unblock functionality
- Customer question management with response system
- Modern UI with Tailwind CSS
- Responsive design for all screen sizes

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd Services/Frontend/adminpanel
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:

```
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:

```
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build:

```
npm run preview
```

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components for each section of the admin panel
- `src/assets/` - Static assets like images
- `src/App.jsx` - Main application component with routing
- `src/main.jsx` - Application entry point

## API Integration

The admin panel is currently using mock data for demonstration purposes. To connect to a real API:

1. Update the API endpoints in each page component
2. Replace the mock data fetching with actual API calls
3. Handle authentication and authorization as needed

## License

This project is licensed under the MIT License. 