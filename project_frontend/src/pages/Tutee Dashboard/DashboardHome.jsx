import { useState, useEffect } from "react";
import axios from "axios";
import { TuteeStats } from "../../components/Tutee Dashboard/TuteeStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpcomingSessions } from "../../components/Tutee Dashboard/UpcomingSessions";
import { RecommendedTutors } from "../../components/Tutee Dashboard/RecommendedTutors";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Search, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clientUrl } from "../../constant/route";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardHome = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const { user } = useAuth();

  // useEffect(() => {
  //   const fetchTutors = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5000/api/tutors");
  //       setTutors(res.data);
  //     } catch (err) {
  //       console.error("Error fetching tutors:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTutors();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const bookingsResponse = await axios.get(
          `${BASE_URL}/api/bookings/my-bookings`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (bookingsResponse.data) {
          setBookings(bookingsResponse.data);
        }

        const tutorResponse = await axios.get(
          `${BASE_URL}/api/tutors`
        );
        if (tutorResponse.data) {
          setTutors(tutorResponse.data);
        }

        // Fetch group bookings
        const groupBookingsResponse = await axios.get(
          `${BASE_URL}/api/group-sessions/student/my-group-sessions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (groupBookingsResponse.data) {
          setGroupBookings(groupBookingsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <main className="p-2 ml-3">
      <TuteeStats
        tutors={tutors}
        bookings={bookings}
        groupBookings={groupBookings}
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="border-1 border-[#3b2762]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your scheduled learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingSessions
              bookings={bookings}
              groupBookings={groupBookings}
            />
            <Button
              variant="outline"
              className="w-full mt-4 hover:cursor-pointer bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
              onClick={() => navigate("/dashboard/my-sessions")}
            >
              <CalendarClock className="mr-2 h-4 w-4 text-[#efc940]" />
              View All Sessions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-1 border-[#3b2762]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Find Tutors</CardTitle>
            <CardDescription>
              Browse and connect with expert tutors in your subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendedTutors tutors={tutors} />
            <Button
              variant="outline"
              className="w-full mt-4 hover:cursor-pointer bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
              onClick={() => navigate("/dashboard/find-tutor")}
            >
              <Search className="mr-2 h-4 w-4 text-[#efc940]" />
              Browse All Tutors
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardHome;
