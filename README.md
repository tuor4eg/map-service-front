# Map Service Frontend

A modern web application for viewing and managing camera feeds on a map interface. Built with Nuxt.js and Vue.js.

## Features

- Interactive Yandex Maps integration
- Camera management and monitoring
- User authentication and authorization
- Responsive UI with Vuetify
- Multi-language support (i18n)
- Starred cameras functionality

## Tech Stack

- **Framework**: Nuxt.js 3
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Maps**: Yandex Maps API
- **Styling**: SASS
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

```bash
# Build and start containers
docker-compose up -d
```

## Project Structure

- `/components` - Reusable Vue components
- `/pages` - Application pages and routes
- `/services` - API and external service integrations
- `/stores` - Pinia state management
- `/composables` - Reusable Vue composition functions
- `/middleware` - Nuxt middleware for authentication, etc.
- `/locales` - Internationalization files
- `/styles` - Global SASS styles

## Environment Variables

Key environment variables:

- `NUXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NUXT_PUBLIC_YANDEX_MAPS_APIKEY` - Yandex Maps API key

See `.env.example` for all available options.
