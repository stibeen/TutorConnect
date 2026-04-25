import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Function to generate email from first and last name
  const generateEmail = (firstName, lastName) => {
    // Clean and format names
    const cleanFirstName = firstName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_") // Replace spaces with underscores for multiple first names
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const cleanLastName = lastName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const domain = "student.tutorconnect.com";

    return `${cleanFirstName}.${cleanLastName}@${domain}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value,
      };

      // Auto-generate email when first name or last name changes
      if ((name === "firstName" || name === "lastName") && 
          newData.firstName.trim() && newData.lastName.trim()) {
        newData.email = generateEmail(newData.firstName, newData.lastName);
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    // Ensure email is generated if names are provided
    if (!formData.email && formData.firstName && formData.lastName) {
      setFormData(prev => ({
        ...prev,
        email: generateEmail(prev.firstName, prev.lastName)
      }));
    }

    try {
      setLoading(true);
      const result = await register(formData, "student");

      if (result.success) {
        navigate("/dashboard/overview");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or Brand Icon */}
        <div className="mx-auto h-16 w-16 rounded-full bg-[#3b2762] flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#efc940"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-[#3b2762]">
          Create student account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our learning platform and start your educational journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-6 p-3 bg-red-50 rounded-md border border-red-200">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium leading-6 text-[#3b2762]"
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium leading-6 text-[#3b2762]"
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-[#3b2762]"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your-email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm bg-gray-50"
                  readOnly
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email is automatically generated from your first and last name
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-[#3b2762]"
              >
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6 text-[#3b2762]"
              >
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#3b2762] hover:bg-[#4c3580] focus:ring-[#efc940]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-[#3b2762] hover:text-[#efc940] hover:underline transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-4 flex justify-center">
          <span className="inline-block h-1 w-12 bg-[#efc940] rounded-full"></span>
          <span className="mx-1 inline-block h-1 w-4 bg-[#3b2762] rounded-full"></span>
          <span className="inline-block h-1 w-2 bg-[#efc940] rounded-full"></span>
        </div>
      </div>
    </div>
  );
}