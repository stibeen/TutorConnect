import { Link as RouterLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NavbarDefault = () => {
  const location = useLocation();

  // Define the navigation links
  const navLinks = [
    { name: "Find tutor", to: "/signup" },
    { name: "Become a tutor", to: "/tutor-steps" },
  ];

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <RouterLink to="/">
              <h1 className="text-2xl font-bold text-indigo-600">
                TutorConnect
              </h1>
            </RouterLink>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((item) => (
                <RouterLink
                  key={item.to}
                  to={item.to}
                  className="inline-flex items-center px-1 pt-1 text-m font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                >
                  {item.name}
                </RouterLink>
              ))}
            </div>
          </div>

          {/* Login Button */}
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
};

export default NavbarDefault;
