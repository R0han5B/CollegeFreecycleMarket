import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800">
              College Freecycling Market
            </span>
          </div>

          <div className="text-sm text-gray-600 text-center">
            <p>© 2026 College Freecycling Market. All rights reserved.</p>
            <p className="mt-1">A sustainable marketplace for students</p>
          </div>

          <div className="text-sm text-gray-500">
            Made for campus sustainability
          </div>
        </div>
      </div>
    </footer>
  );
}
