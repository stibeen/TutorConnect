import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import toast from "react-hot-toast";
import axios from "axios";
import { ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignupTutor = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    expertise: [],
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  });

  const [error, setError] = useState("");
  const [expandedDays, setExpandedDays] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [loadingExpertise, setLoadingExpertise] = useState(true);

  // Add these state variables with your existing useState declarations
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Available time slots
  const timeSlots = [
    "7:30 AM",
    "8:30 AM",
    "9:30 AM",
    "10:30 AM",
    "11:30 AM",
    "12:30 PM",
    "1:30 PM",
    "2:30 PM",
    "3:30 PM",
    "4:30 PM",
    "5:30 PM",
  ];

  // Fetch expertise options from API
  useEffect(() => {
    const fetchExpertiseOptions = async () => {
      try {
        setLoadingExpertise(true);
        const response = await axios.get(`${BASE_URL}/api/expertise/options`);
        // Extract just the names from the expertise objects
        const expertiseNames = response.data.map((item) => item.name);
        setExpertiseOptions(expertiseNames);
      } catch (error) {
        console.error("Error fetching expertise options:", error);
        toast.error("Failed to load expertise options. Please try again.");
        // Fallback to empty array if API fails
        setExpertiseOptions([]);
      } finally {
        setLoadingExpertise(false);
      }
    };

    fetchExpertiseOptions();
  }, []);

  // Filter expertise options based on search query
  const filteredExpertiseOptions = expertiseOptions.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDayExpansion = (day) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExpertiseToggle = (expertise) => {
    setFormData((prevData) => {
      if (prevData.expertise.includes(expertise)) {
        return {
          ...prevData,
          expertise: prevData.expertise.filter((item) => item !== expertise),
        };
      } else {
        return {
          ...prevData,
          expertise: [...prevData.expertise, expertise],
        };
      }
    });
  };

  const handleTimeSlotToggle = (day, timeSlot) => {
    setFormData((prevData) => {
      const updatedSchedule = { ...prevData.schedule };

      if (updatedSchedule[day].includes(timeSlot)) {
        updatedSchedule[day] = updatedSchedule[day].filter(
          (time) => time !== timeSlot
        );
      } else {
        updatedSchedule[day] = [...updatedSchedule[day], timeSlot].sort(
          (a, b) => {
            return timeSlots.indexOf(a) - timeSlots.indexOf(b);
          }
        );
      }

      return {
        ...prevData,
        schedule: updatedSchedule,
      };
    });
  };

  const removeExpertise = (expertise) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((item) => item !== expertise),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      expertise,
      schedule,
    } = formData;

    const role = "tutor";

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (expertise.length === 0) {
      setError("Please select at least one area of expertise.");
      toast.error("Please select at least one area of expertise.");
      return;
    }

    // Schedule validation: At least one time slot across the week must be filled
    const hasValidSchedule = Object.values(schedule).some(
      (daySlots) => Array.isArray(daySlots) && daySlots.length > 0
    );

    if (!hasValidSchedule) {
      setError(
        "Please provide at least one available time slot in your schedule."
      );
      toast.error(
        "Please provide at least one available time slot in your schedule."
      );
      return;
    }

    try {
      const requestData = {
        firstName,
        lastName,
        email,
        password,
        role,
        expertise: JSON.stringify(expertise),
        schedule: JSON.stringify(schedule),
      };

      const response = await axios.post(
        `${BASE_URL}/api/tutors/registerTutor`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        toast.success(`Tutor ${response.data.user.name} Created!`, {
          duration: 3000,
        });

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          expertise: [],
          schedule: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
          },
        });

        navigate("/login"); // Redirect if needed
      } else {
        setError(response?.data?.error || "Something went wrong. Try again.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Server error. Please try again later.";
      setError(errorMsg);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto border border-gray-200">
      <div className="mx-auto h-16 w-16 rounded-full bg-[#3b2762] flex items-center justify-center shadow-lg mb-6">
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
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2 text-[#3b2762]">
        Join as a Tutor
      </h2>

      <p className="text-center text-gray-600 mb-6">
        Share your knowledge and help students excel in their studies
      </p>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Top Section: Personal Information and Expertise in parallel */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-[#3b2762] flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Personal Information
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3b2762] font-medium mb-1 text-sm">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#3b2762] font-medium mb-1 text-sm">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3b2762] font-medium mb-1 text-sm">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3b2762] font-medium mb-1 text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent pr-10"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                  <label className="block text-[#3b2762] font-medium mb-1 text-sm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b2762] focus:border-transparent pr-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Must be at least 8 characters with a mix of letters, numbers &
                symbols
              </p>
            </div>
          </div>

          {/* Areas of Expertise */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-[#3b2762] flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
              Areas of Expertise
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg p-2.5">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search expertise areas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                {loadingExpertise ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Loading expertise options...
                  </div>
                ) : filteredExpertiseOptions.length > 0 ? (
                  filteredExpertiseOptions.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center p-2.5 hover:bg-gray-100 cursor-pointer text-sm ${
                        formData.expertise.includes(option)
                          ? "bg-[#3b2762]/10"
                          : ""
                      }`}
                      onClick={() => handleExpertiseToggle(option)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(option)}
                        readOnly
                        className="mr-2 accent-[#3b2762]"
                      />
                      <span>{option}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 text-gray-500 text-center text-sm">
                    {expertiseOptions.length === 0
                      ? "No expertise options available. Please contact support."
                      : "No matching expertise found"}
                  </div>
                )}
              </div>

              {formData.expertise.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected expertise:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((item) => (
                      <span
                        key={item}
                        className="bg-[#3b2762]/10 text-[#3b2762] px-3 py-1.5 rounded-full text-sm flex items-center"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeExpertise(item)}
                          className="ml-1.5 text-[#3b2762] hover:text-[#3b2762]/70"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!loadingExpertise && expertiseOptions.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  Unable to load expertise options. Please try refreshing the
                  page or contact support.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Schedule Availability spanning full width */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-[#3b2762] flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
              />
            </svg>
            Schedule Availability
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            Select your available time slots for each day. Students will be able
            to book sessions during these times.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(formData.schedule).map((day) => (
              <div
                key={day}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${
                    expandedDays[day]
                      ? "bg-[#3b2762]/5 border-b border-gray-200"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggleDayExpansion(day)}
                >
                  <div className="font-medium text-sm text-[#3b2762]">
                    {day}
                  </div>
                  <div className="flex items-center">
                    {formData.schedule[day].length > 0 && (
                      <span className="text-xs bg-[#efc940] text-[#3b2762] px-2 py-1 rounded-full mr-2 font-medium">
                        {formData.schedule[day].length}
                      </span>
                    )}
                    {expandedDays[day] ? (
                      <ChevronUp size={16} className="text-[#3b2762]" />
                    ) : (
                      <ChevronDown size={16} className="text-[#3b2762]" />
                    )}
                  </div>
                </div>

                {expandedDays[day] && (
                  <div className="p-3 bg-white border-t border-gray-100 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            formData.schedule[day].includes(time)
                              ? "bg-[#3b2762] text-white shadow-sm"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          onClick={() => handleTimeSlotToggle(day, time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#3b2762] text-white p-4 rounded-lg hover:bg-[#4c3580] transition duration-300 hover:cursor-pointer font-medium flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-[#efc940] focus:ring-offset-2 text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Complete Registration
        </button>
      </form>

      {/* Decorative element */}
      <div className="mt-8 flex justify-center">
        <span className="inline-block h-1 w-12 bg-[#efc940] rounded-full"></span>
        <span className="mx-1 inline-block h-1 w-4 bg-[#3b2762] rounded-full"></span>
        <span className="inline-block h-1 w-2 bg-[#efc940] rounded-full"></span>
      </div>
    </div>
  );
};

export default SignupTutor;
