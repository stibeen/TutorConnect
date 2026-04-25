import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, DollarSign, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TutorStats({ bookings: localBookings, tutor, groupBookings }) {
  const { user } = useAuth();

  const confirmedBookings = localBookings.filter(
    (b) => b.status === "confirmed" && 
           !(b.sessionType === "group" || b.groupSession?.isGroup)
  );

  const allUpcomingSessions = [
    ...confirmedBookings,
    ...groupBookings
      .filter((groupBooking) => groupBooking.status === "open")
      .map((groupBooking) => ({
        ...groupBooking,
        sessionType: "group",
      })),
  ]
  // const upcomingSessions = localBookings.filter((b) => {
  //   return b.tutor._id === user.id && b.status === "confirmed";
  // });

  const bookingRequests = localBookings.filter((b) => {
    return b.tutor._id === user.id && b.status === "pending"  && b.sessionType !== "group";
  });
  
  const subjectsLength = tutor.expertise.length; // Display number of subject the tutor teaches

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-[#3b2762]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#efc940]  p-2">
              <Clock className="h-6 w-6 text-[#3b2762]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium leading-none">
                Upcoming Sessions
              </p>
              <p className="text-2xl text-white font-bold">
                {allUpcomingSessions.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#3b2762]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#efc940] p-2">
              <Users className="h-6 w-6 text-[#3b2762]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium leading-none">
                Booking Requests
              </p>
              <p className="text-2xl text-white font-bold">{bookingRequests.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#3b2762]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#efc940] p-2">
              <BookOpen className="h-6 w-6 text-[#3b2762]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium leading-none">
                Subjects
              </p>
              <p className="text-2xl text-white font-bold">{subjectsLength}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
