import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TutorStats } from "../../components/Tutor Dashboard/TutorStats";
import { CalendarClock, CalendarPlus, Clock, DollarSign } from "lucide-react";
import { TutorUpcomingSessions } from "../../components/Tutor Dashboard/TutorUpcomingSessions";
import { RecentRequests } from "../../components/Tutor Dashboard/RecentRequests";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../utils/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TutorHome = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tutor data if user is available
        const tutorResponse = await axios.get(
          `${BASE_URL}/api/tutors/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (tutorResponse.data) {
          setTutor(tutorResponse.data);
        }

        // Fetch bookings
        const bookingsResponse = await axios.get(
         `${BASE_URL}/api/bookings/my-bookings`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (bookingsResponse.data) {
          setBookings(bookingsResponse.data);
        }

        // Fetch group bookings
        const groupBookingsResponse = await axios.get(
          `${BASE_URL}/api/group-sessions/tutor/${user.id}`
        );

        if (groupBookingsResponse.data) {
          setGroupBookings(groupBookingsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Pass both bookings and tutor data to TutorStats */}
      <TutorStats bookings={bookings} tutor={tutor} groupBookings={groupBookings}/>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-1 border-[#3b2762]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pass today's sessions to TodaySessions component */}
            <TutorUpcomingSessions bookings={bookings} groupBookings={groupBookings}/>
            <Button
              variant="outline"
              className="w-full mt-4 hover:cursor-pointer bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
              onClick={() => navigate("/dashboardTutor/tutor-sessions")}
            >
              <CalendarClock className="mr-2 h-4 w-4 text-[#efc940]" />
              View All Sessions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-1 border-[#3b2762]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Recent Booking Requests
            </CardTitle>
            <CardDescription>
              New session requests from students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentRequests bookings={bookings} />
            <Button
              variant="outline"
              className="w-full mt-4 hover:cursor-pointer bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
              onClick={() => navigate("/dashboardTutor/tutor-sessions")}
            >
              <Clock className="mr-2 h-4 w-4 text-[#efc940]" />
              View All Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorHome;
