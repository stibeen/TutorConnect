import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingCalendar } from "../../components/Tutee Dashboard/BookingCalendar";
import { Mail, Phone, Star } from "lucide-react";
import { RiMessengerLine } from "react-icons/ri";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default function TutorProfile() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [tutor, setTutor] = useState(null);
  const { tutorId } = useParams();
  // Add this state
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Add this effect
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/bookings/tutor/${tutorId}/reviews`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [tutorId]);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/tutors/${tutorId}`
        );
        setTutor(response.data);
      } catch (error) {
        console.error("Failed to fetch tutor data:", error);
      }
    };

    fetchTutor();
  }, [tutorId]);

  // Get all days that have available time slots
  const getAvailableDays = () => {
    if (!tutor || !tutor.schedule) return [];

    return Object.entries(tutor.schedule)
      .filter(([day, slots]) => slots && slots.length > 0)
      .map(([day]) => day);
  };

  // Reset selected time slot when day changes
  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [selectedDay]);

  if (!tutor) {
    return <div className="text-center mt-10">Loading tutor profile...</div>;
  }

  // Set default selected day to first available day if current selection has no slots
  const availableDays = getAvailableDays();
  if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
    setSelectedDay(availableDays[0]);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Main layout container */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Left column - Tutor info and About */}
        <div className="flex flex-col gap-6 lg:w-2/3">
          {/* Tutor header with avatar and name */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={`${BASE_URL}/uploads/${tutor.profileImage}`} alt={tutor.name} />
              <AvatarFallback>
                {tutor.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{tutor.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">
                    {tutor.averageRating?.toFixed(1) || "0.0"}
                    <span className="text-muted-foreground text-xs">
                      {" "}
                      ({tutor.reviewCount || 0})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{tutor.description}</p>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {tutor.expertise?.map((skill, index) => (
                    <Badge
                      variant="outline"
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking calendar card */}
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>
                Select a date and time to book a session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Contact info */}
        <div className="flex flex-col gap-6 mt-6 lg:mt-0 lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <span>{tutor.contactInfo?.contactEmail || tutor.email}</span>
                </div>
              </div>
              {tutor.contactInfo?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <span>{tutor.contactInfo.phone}</span>
                  </div>
                </div>
              )}
              {tutor.contactInfo?.messenger && (
                <div className="flex items-start gap-3">
                  <RiMessengerLine className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Messenger</p>
                    <a
                      href={tutor.contactInfo.messenger}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {tutor.contactInfo.messenger.replace("https://m.me/", "")}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <CardDescription>
                {reviews.length > 0
                  ? `Average rating: ${tutor.averageRating?.toFixed(1)} (${
                      reviews.length
                    } reviews)`
                  : "No reviews yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
              {isLoadingReviews ? (
                <div className="text-center py-4">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((booking) => (
                  <div
                    key={booking._id}
                    className="border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={booking.student?.profileImage} />
                        <AvatarFallback>
                          {booking.student?.name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {booking.student?.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < booking.review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {new Date(
                              booking.review.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm pl-12">
                      {booking.review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
