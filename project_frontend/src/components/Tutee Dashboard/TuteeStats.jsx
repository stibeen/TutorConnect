import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, DollarSign, Users } from "lucide-react"
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export function TuteeStats({tutors, bookings: localBookings, groupBookings: grpBookings}) {
  
  const { user } = useAuth();
  
  const numberOfTutors = tutors.length;
  const confirmedBookings = localBookings.filter(
    (b) =>
        b.status === "confirmed" ||
        (b.status === "pending" && b.sessionType === "group")
  );

  const allUpcomingSessions = [
    ...confirmedBookings,
    ...grpBookings.filter((groupBooking) => groupBooking.status === "open")
        .map((groupBooking) => ({
          ...groupBooking,
          sessionType: "group",
          // Add any other properties you need for consistent display
        })),
  ]
  
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mb-5">
      <Card className='bg-[#3b2762]'>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#efc940] p-2">
              <Clock className="h-6 w-6 text-[#3b2762]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium leading-none">Upcoming Sessions</p>
              <p className="text-2xl text-white font-bold">{allUpcomingSessions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className='bg-[#3b2762]'>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#efc940] p-2">
              <Users className="h-6 w-6 text-[#3b2762]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium leading-none">Active Tutors</p>
              <p className="text-2xl text-white font-bold">{numberOfTutors}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
