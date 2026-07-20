# Student Assessment Platform - Frontend

A modern, production-ready frontend application for the Student Assessment Platform built with React 18, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.3+
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: Headless UI + Hero Icons
- **State Management**: Zustand 4.5+
- **Routing**: React Router v6.24+
- **API Client**: Axios 1.7+
- **Form Management**: React Hook Form 7.52+ with Zod validation
- **Data Fetching**: React Query 3.39+
- **Charts**: Recharts 2.12+
- **Testing**: Jest 29+ with React Testing Library
- **Code Quality**: ESLint + Prettier + Husky

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Getting Started

### 1. Installation

```bash
# Clone the repository (if applicable)
git clone <repository-url>
cd frontend

# Install dependencies
npm install
```

### 2. Environment Setup

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the environment variables in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_AUTH_TOKEN_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token
VITE_TOKEN_EXPIRY_KEY=token_expiry
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_API=false
VITE_APP_NAME=Student Assessment Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### 3. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests with coverage (CI) |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # React components
│   │   ├── common/        # Reusable components (buttons, inputs, etc.)
│   │   ├── layout/        # Layout components (header, sidebar, footer)
│   │   └── features/      # Feature-specific components
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── student/       # Student pages
│   │   ├── admin/         # Admin pages
│   │   └── errors/        # Error pages (404, 403, etc.)
│   ├── services/          # API service layer
│   │   ├── api.ts         # Axios instance with interceptors
│   │   ├── authService.ts # Authentication API calls
│   │   ├── assessmentService.ts
│   │   └── submissionService.ts
│   ├── store/             # Zustand state management
│   │   ├── authStore.ts   # Authentication state
│   │   └── uiStore.ts     # UI state (sidebar, theme, etc.)
│   ├── hooks/             # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useWindowSize.ts
│   │   ├── useCountdown.ts
│   │   └── useOnlineStatus.ts
│   ├── utils/             # Utility functions
│   │   ├── helpers.ts     # General helper functions
│   │   └── validation.ts  # Zod validation schemas
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All type definitions
│   ├── styles/            # Global styles
│   │   └── index.css      # Tailwind + custom CSS
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Application entry point
│   └── vite-env.d.ts      # Vite environment types
├── .env                   # Environment variables (gitignored)
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── index.html             # HTML entry point
├── jest.config.ts         # Jest configuration
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Vite
└── vite.config.ts         # Vite configuration
```

## Key Features

### 🎨 Design System

The application uses a comprehensive design system with:
- Custom color palette (primary, secondary, success, warning, error, info)
- Typography scale with Inter font
- Consistent spacing and sizing
- Dark mode support
- Accessible components

### 🔐 Authentication

- JWT-based authentication
- Token refresh mechanism
- Protected routes based on user roles
- Persistent authentication state

### 🛣️ Routing

- Role-based routing (Student/Admin)
- Protected routes with authentication guards
- Lazy-loaded pages for optimal performance
- Smooth navigation with React Router v6

### 📡 API Layer

- Centralized API client with Axios
- Request/response interceptors
- Automatic token injection
- Error handling and retry logic
- Token refresh on 401 errors

### 🎯 State Management

- Zustand for global state
- React Query for server state
- Persistent auth state
- UI state management (theme, sidebar, modals)

### ✅ Form Handling

- React Hook Form for performance
- Zod schema validation
- Type-safe forms
- Reusable validation schemas

### 🎨 Styling

- Tailwind CSS utility-first approach
- Custom design tokens
- Responsive design
- Dark mode support
- Custom component classes

### 🧪 Testing

- Jest as test runner
- React Testing Library for component tests
- Coverage reporting
- Test utilities and mocks

## Coding Conventions

### TypeScript

- Use strict TypeScript settings
- Define types in `src/types/index.ts`
- Avoid `any` type when possible
- Use proper type inference

### Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing with TypeScript

### Naming

- Components: PascalCase (`UserProfile.tsx`)
- Files: camelCase for utilities, PascalCase for components
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS Classes: kebab-case (Tailwind utilities)

### File Organization

- Group related files in feature folders
- Keep index files for easy imports
- Separate business logic from UI components
- Co-locate tests with components (`ComponentName.test.tsx`)

### Git Workflow

- Use conventional commits
- Keep commits atomic and focused
- Write descriptive commit messages
- Pre-commit hooks run lint and format

## API Integration

The frontend expects a REST API at the configured `VITE_API_BASE_URL`. Expected endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Assessments
- `GET /api/assessments` - List assessments
- `GET /api/assessments/:id` - Get assessment
- `POST /api/assessments` - Create assessment (admin)
- `PUT /api/assessments/:id` - Update assessment (admin)
- `DELETE /api/assessments/:id` - Delete assessment (admin)

### Submissions
- `GET /api/submissions/me` - Student submissions
- `GET /api/assessments/:id/submissions` - Assessment submissions (admin)
- `POST /api/submissions` - Start assessment
- `PUT /api/submissions/:id/answers` - Save answers
- `POST /api/submissions/:id/submit` - Submit assessment
- `POST /api/submissions/:id/grade` - Grade submission (admin)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_AUTH_TOKEN_KEY` | LocalStorage key for access token | `auth_token` |
| `VITE_REFRESH_TOKEN_KEY` | LocalStorage key for refresh token | `refresh_token` |
| `VITE_ENABLE_DEBUG` | Enable debug logging | `false` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the coding conventions
2. Write tests for new features
3. Run linting and formatting before committing
4. Keep commits atomic and well-described

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Run type checking
npm run type-check
```

## Performance Optimization

- Code splitting with lazy loading
- Route-based code splitting
- Manual chunks for vendors
- Tree shaking enabled
- CSS purging in production
- Asset optimization

## Security

- XSS protection via React
- CSRF token handling
- Secure token storage
- HTTP-only cookies (backend)
- Content Security Policy headers (backend)

## License

[Your License Here]

## Support

For issues and questions, please contact [your-email@example.com]
