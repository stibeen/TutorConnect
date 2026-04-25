import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

const NoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-gray-800 opacity-10 absolute inset-0">404</h1>
          <div className="relative z-10">
            <div className="w-48 h-48 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-700">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Lost in Space?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for seems to have drifted off into the digital cosmos. 
          Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Home size={20} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Fun Facts */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 italic">
            💡 Did you know? 404 errors are named after Room 404 at CERN where the web was invented!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoPage;