import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error-600">403</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Unauthorized</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          You do not have permission to access this page.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
