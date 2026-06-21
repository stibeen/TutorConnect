import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'tutor'
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(email, password, role);
    console.log(result);
    if (result.success && result.userIsActive) {
      navigate(
        role === "tutor" ? "/dashboardTutor/tutor-home" : "/dashboard/overview"
      );
    } else if (result.success && !result.userIsActive) {
      toast.error("Your account was deactivated.");
      setError(
        "Your account was deactivated. Visit SAS Office and find Dr. Bitasolo to activate your account."
      );
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    // This will remain enabled only for students
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle register link click
  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (role === "tutor") {
      setError("Visit SAS Office and find Dr. Bitasolo to Register as Tutor.");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or Brand Icon could go here */}
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
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-[#3b2762]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your details to access your learning journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10 border border-gray-200">
          {/* Role Selection */}
          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-sm font-medium leading-6 text-[#3b2762]"
            >
              I am a:
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  role === "student"
                    ? "bg-[#3b2762] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("tutor")}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  role === "tutor"
                    ? "bg-[#3b2762] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tutor
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-[#3b2762]"
                >
                  Password
                </label>
                {/* <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-[#3b2762] hover:text-[#efc940] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div> */}
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
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
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-[#3b2762] px-3 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#4c3580] focus:outline-none focus:ring-2 focus:ring-[#efc940] focus:ring-offset-2 transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* Google Login - Disabled for tutors */}
          {/* {role === "student" && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => toast.error("Feature coming soon.")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 p-3 rounded-lg bg-gray-100 transition mb-4 hover:cursor-not-allowed"
                >
                  <FcGoogle className="h-5 w-5" />
                  <span className="font-medium text-gray-400">
                    Continue with Google
                  </span>
                </button>
              </div>
            </div>
          )} */}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Not a member?{" "}
              {/* <a
                href={role === "tutor" ? "/signupTutor" : "/signup"}
                className="font-medium text-[#3b2762] hover:text-[#efc940] hover:underline transition-colors"
              >
                {role === "tutor"
                  ? "Register as a tutor"
                  : "Register as a student"}
              </a> */}
              <a
                href={role === "tutor" ? "#" : "/signup"}
                onClick={handleRegisterClick}
                className="font-medium text-[#3b2762] hover:text-[#efc940] hover:underline transition-colors"
              >
                {role === "tutor"
                  ? "Register as a tutor"
                  : "Register as a student"}
              </a>
            </p>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-sm">
              <a 
              href="/loginAdmin"
              className="font-medium text-[#3b2762] hover:text-[#efc940] hover:underline transition-colors"
            >Login as Admin</a> 
            </p>
          </div>
        </div>

        {/* Optional decorative element */}
        <div className="mt-4 flex justify-center">
          <span className="inline-block h-1 w-12 bg-[#efc940] rounded-full"></span>
          <span className="mx-1 inline-block h-1 w-4 bg-[#3b2762] rounded-full"></span>
          <span className="inline-block h-1 w-2 bg-[#efc940] rounded-full"></span>
        </div>
      </div>
    </div>
  );
}
