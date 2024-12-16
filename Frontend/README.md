# Admin Dashboard Frontend

This is the frontend application for the Forms Generator admin dashboard. It provides a modern and intuitive interface for managing forms, users, and monitoring form responses.

## Features

- User authentication and authorization
- Form creation and management
- Real-time form response monitoring
- User activity tracking
- Security alerts and notifications
- Interactive data visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=ws://localhost:8000/ws
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── api/            # API client and services
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   ├── redux/          # Redux store and slices
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── vite-env.d.ts   # Vite type declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Testing

The project uses Vitest for testing. Run tests with:
```bash
npm run test
```

For coverage report:
```bash
npm run test:coverage
```

## Building for Production

1. Build the project:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

## Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks (pre-commit, pre-push)

## Dependencies

- React 18
- Material-UI
- Redux Toolkit
- React Query
- Axios
- Socket.io Client
- Recharts
- Leaflet
- TypeScript
- Vite

## Browser Support

The application supports the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
