import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function RecommendedTutors({ tutors }) {
  const navigate = useNavigate();
  
  const handleBookSession = (tutorId) => {
    navigate(`/dashboard/tutor-profile/${tutorId}`);
  };

  const activeTutors = tutors.filter((tutor) => 
    tutor.isReadyToTeach && tutor.isActive
  )

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {activeTutors.map((tutor) => (
        <div
          key={tutor._id}
          className="flex items-center gap-4 border rounded-lg p-3"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`${BASE_URL}/uploads/${tutor.profileImage}` || "/placeholder.svg?height=40&width=40"}
              alt={tutor.name}
            />
            <AvatarFallback>
              {tutor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{tutor.name}</p>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">
                    {tutor.averageRating?.toFixed(1) || "0.0"}
                    <span className="text-muted-foreground text-xs">
                      {" "}
                      ({tutor.reviewCount || 0})
                    </span>
                  </span>
                {/* Hardcoded for now */}
                <Button
                  onClick={()=> handleBookSession(tutor._id)}
                  size="sm"
                  className="ml-5 h-7 text-xs bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white hover:cursor-pointer"
                >
                  Book
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {tutor.expertise.join(", ")} {/* Display all expertise areas */}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
