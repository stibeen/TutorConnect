import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Subjects = () => {
  const [expertiseOptions, setExpertiseOptions] = useState([]);

  useEffect(() => {
    const fetchExpertiseOptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/expertise/options`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Extract just the names from the expertise objects
        const expertiseNames = response.data.map((item) => item.name);
        setExpertiseOptions(expertiseNames);
      } catch (error) {
        console.error("Error fetching expertise options:", error);
        toast.error("Failed to load expertise options");
        // Fallback to empty array if API fails
        setExpertiseOptions([]);
      }
    };

    fetchExpertiseOptions();
  },[]);

  return (
    <div>
      {/* Subjects Section */}
      <section className="py-16 px-6 pt-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Subjects We Cover
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center justify-center text-[#3b2762]">
          {expertiseOptions.map((subject, i) => (
            <span
              key={i}
              className="bg-white rounded-2xl px-4 py-2 border border-[#3b2762] shadow-sm hover:bg-[#efc940] transition"
            >
              {subject}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Subjects;
