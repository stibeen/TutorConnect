import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
export default function NavbarLanding() {

  return (
    <nav className="bg-white shadow fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-10">
              <h1 className="text-2xl font-bold text-indigo-600">
                TutorConnect
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <RouterLink
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Log in
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
