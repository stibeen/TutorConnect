import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Calendar, MessageCircle, User } from "lucide-react";
("use client");

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TutorCard({ tutor, onBookSession }) {
  // Calculate average rating (fallback to 0 if no reviews)
  const averageRating = tutor.averageRating?.toFixed(1) || "0.0";
  const reviewCount = tutor.reviewCount || 0;
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Use the provided tutor or fallback to default
  const tutorData = tutor;
  const handleBookSession = () => {
    // Just call the provided callback
    if (onBookSession) {
      onBookSession(tutorData._id);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 max-w-sm",
        isHovered && "shadow-xl translate-y-[-8px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {tutor.profileImage ? (
          <img
            src={`${BASE_URL}/uploads/${tutor.profileImage}`}
            alt={`Tutor ${tutor.name}`}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            {/* Replace with your preferred icon component */}
            <User className="h-8 w-8 text-gray-400 w-full h-64" />
          </div>
        )}

        <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-medium">
            {averageRating}
            <span className="text-muted-foreground text-xs">
              {" "}
              ({reviewCount})
            </span>
          </span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h2 className="font-bold text-xl text-foreground">{tutor.name}</h2>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2">
          {tutor.expertise.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button onClick={handleBookSession} className="w-full" size="lg">
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}
