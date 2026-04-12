import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#4F46E5]">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </div>
        <Link to="/">
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA]">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
