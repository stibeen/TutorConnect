// import React from "react";
// import SessionCard from "../../components/Tutee Dashboard/SessionCard";
import { useEffect, useState } from "react";
import axios from "axios";
// import { Calendar, Clock, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionsList } from "../../components/Tutee Dashboard/SessionsList";
import { CalendarDays, Clock, Search } from "lucide-react";
// import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MySessions = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/bookings/my-bookings`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookings();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    // <div className="max-w-4xl mx-auto p-4">
    //   {bookings.length === 0 ? (
    //     <p>You have no bookings yet.</p>
    //   ) : (
    //     <div className="space-y-4">
    //       {bookings.map((booking) => (
    //         <div key={booking._id} className="bg-white p-4 rounded-lg shadow">
    //           <div className="flex items-center mb-2">
    //             <User className="h-5 w-5 mr-2" />
    //             <span className="font-medium">
    //               {user.role === "tutor"
    //                 ? `Student: ${booking.student?.name}`
    //                 : `Tutor: ${booking.tutor?.name}`}
    //             </span>
    //           </div>
    //           <div className="flex items-center">
    //             <Calendar className="h-5 w-5 mr-2" />
    //             <span>{booking.day}</span>
    //           </div>
    //           <div className="flex items-center">
    //             <Clock className="h-5 w-5 mr-2" />
    //             <span>{booking.time}</span>
    //           </div>
    //           <div className="mt-2">
    //             <span
    //               className={`px-2 py-1 rounded text-sm ${
    //                 booking.status === "confirmed"
    //                   ? "bg-green-100 text-green-800"
    //                   : "bg-yellow-100 text-yellow-800"
    //               }`}
    //             >
    //               {booking.status}
    //             </span>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Card className="border-1 border-[#3b2762] ">
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-4 border-1 border-[#3b2762]">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              <SessionsList status="upcoming" bookings={bookings}/>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <SessionsList status="completed" bookings={bookings}/>
            </TabsContent>
            <TabsContent value="cancelled" className="mt-4">
              <SessionsList status="cancelled" bookings={bookings}/>
            </TabsContent>
            <TabsContent value="requests" className="mt-4">
              <SessionsList status="requests" bookings={bookings}/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MySessions;
