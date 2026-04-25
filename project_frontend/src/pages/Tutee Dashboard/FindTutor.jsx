import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorCard from "../../components/Tutee Dashboard/TutorCard";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FindTutor = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState("all");

  const handleBookSession = (tutorId) => {
    navigate(`/dashboard/tutor-profile/${tutorId}`);
  };

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/tutors`);
        const allTutors = res.data;
        const readyToTeachTutors = allTutors.filter((tutor)=> tutor.isReadyToTeach && tutor.isActive);
        setTutors(readyToTeachTutors);
        setFilteredTutors(readyToTeachTutors); // Initialize filtered tutors with all tutors
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching tutors:", err);
        setError("Failed to load tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Fetch expertise options
  useEffect(() => {
    const fetchExpertiseOptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/expertise/options`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setExpertiseOptions(response.data);
      } catch (error) {
        console.error("Error fetching expertise options:", error);
      }
    };

    fetchExpertiseOptions();
  }, []);

  // Filter tutors when selectedExpertise changes
  useEffect(() => {
    if (selectedExpertise === "all") {
      setFilteredTutors(tutors);
    } else {
      const filtered = tutors.filter(tutor => 
        tutor.expertise && tutor.expertise.some(skill => 
          skill.toLowerCase() === selectedExpertise.toLowerCase()
        )
      );
      setFilteredTutors(filtered);
    }
  }, [selectedExpertise, tutors]);

  const handleExpertiseChange = (value) => {
    setSelectedExpertise(value);
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Filter by expertise:</span>
          <Select value={selectedExpertise} onValueChange={handleExpertiseChange}>
            <SelectTrigger className="w-[380px] border-[#3b2762]">
              <SelectValue placeholder="Select expertise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Expertise</SelectItem>
              {Array.from(
                new Set(
                  expertiseOptions
                    .map((e) => e.name)
                    .filter(Boolean)
                )
              ).map((expertise) => (
                <SelectItem key={expertise} value={expertise}>
                  {expertise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="text-sm text-gray-600">
          Showing {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
          {selectedExpertise !== 'all' && ` in ${selectedExpertise}`}
        </div>
      )}

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))
        ) : error ? (
          // Error message
          <div className="col-span-full text-center text-red-500 py-10">
            {error}
          </div>
        ) : filteredTutors.length === 0 ? (
          // Empty state when no tutors match the filter
          <div className="col-span-full text-center py-10">
            {selectedExpertise === "all" 
              ? "No tutors available at the moment." 
              : `No tutors found for "${selectedExpertise}". Try selecting a different expertise.`
            }
          </div>
        ) : (
          // Tutors list
          filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor._id}
              tutor={tutor}
              onBookSession={() => handleBookSession(tutor._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FindTutor;