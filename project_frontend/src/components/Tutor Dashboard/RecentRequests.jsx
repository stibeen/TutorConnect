import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarClock } from "lucide-react"
import { convert24to12 } from "../../utils/timeUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function RecentRequests({ bookings }) {
  // Filter and sort bookings - most recent first
  const recentPendingBookings = bookings
    .filter(booking => booking.status === "pending" && booking.sessionType !== "group")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (recentPendingBookings.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No recent requests found
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {recentPendingBookings.map((booking) => (
        <div key={booking._id} className="flex items-start gap-3 rounded-lg border p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={`${BASE_URL}/uploads/${booking.student?.profileImage}` || "/placeholder.svg?height=40&width=40"} 
              alt={booking.student?.name || "Student"} 
            />
            <AvatarFallback>
              {booking.student?.name 
                ? booking.student.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : "ST"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              {booking.student?.name || "Student"}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              <span>
                {booking.formattedDate}, {convert24to12(booking.startTime)} - {convert24to12(booking.endTime)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {booking.topic} : ({booking.modality})
            </p>
            {/* <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Decline
              </Button>
              <Button size="sm" className="h-7 text-xs">
                Accept
              </Button>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
}