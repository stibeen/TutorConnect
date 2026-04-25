import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Calendar, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaUmbrellaBeach } from "react-icons/fa";

const VacationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <FaUmbrellaBeach className="h-16 w-16 text-amber-500" />
              <Sun className="h-8 w-8 text-yellow-400 absolute -top-2 -right-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Enjoy Your Vacation!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Your Peer Tutors are on break
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">
                We'll be back soon with new sessions
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              While we're away, take this time to relax, explore new interests,
              and recharge for the upcoming term.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center justify-center gap-2">
              <Sun className="h-4 w-4" />
              What you can do meanwhile:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1 text-left">
              <li>• Review past session materials</li>
              <li>• Explore online learning resources</li>
              <li>• Prepare questions for next term</li>
              <li>• Take a well-deserved break!</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationPage;
