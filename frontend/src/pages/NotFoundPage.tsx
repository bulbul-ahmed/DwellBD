import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        {/* Error Animation */}
        <div className="mb-8">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Search className="h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
          <h2 className="mb-2 text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="mb-8 text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="mb-4 text-sm text-gray-600">Can't find what you're looking for?</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/properties"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Browse Properties
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Contact Support
            </Link>
            <Link
              to="/help"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
