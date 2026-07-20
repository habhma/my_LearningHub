import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
