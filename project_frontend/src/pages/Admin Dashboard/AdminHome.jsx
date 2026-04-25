import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  MoreHorizontal,
  Printer,
  FileText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminHome() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialogId, setOpenDialogId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/bookings/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response) {
          const data = response.data;
          setBookings(data);
          console.log(response);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/tutors/`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        setTutors(res.data);
      } catch (err) {
        console.error("Error fetching tutors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookings/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        const data = response.data;
        const completedBookings = data.filter(
          (booking) => booking.status === "completed"
        );
        setBookings(completedBookings);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tutors/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setTutors(res.data);
    } catch (err) {
      console.error("Error fetching tutors:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = bookings.filter((b) => b.status === "completed");

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, booking) => sum + (booking.price || 0), 0);

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
    },
    {
      title: "Total Tutors",
      value: tutors.length,
      icon: UserCheck,
    },
    {
      title: "Total Sessions Completed",
      value: completedSessions.length,
      icon: Clock,
    },
    {
      title: "Revenue",
      value: `₱${totalRevenue.toFixed(2)}`,
      icon: CreditCard,
      change: "+8% from last month",
    },
  ];

  if (loading) {
    return <div>Loading Admin dashboard...</div>;
  }

  // const paidBookings = bookings.filter(
  //   (booking) =>
  //     booking.status === "completed" && booking.paymentStatus === "paid"
  // );

  const paidBookings = bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid" && booking.isPayable
  );
  // console.log(paidBookings)
  const paymentRecords = paidBookings.map((booking) => ({
    id: booking._id,
    student: booking.student?.name || "Unknown Student",
    amount: booking.price ? `₱${booking.price.toFixed(2)}` : "₱30.00", // Default amount if not set
    session: booking.topic,
    tutor: booking.tutor?.name || "Unknown Tutor",
    status: booking.paymentStatus === "paid" ? "Paid" : "Pending",
    date: new Date(booking.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    receiptNo: booking.receiptNo || null,
    paidAt: new Date(booking.paidAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    receiver: booking.payReceiver || "Admin",
  })).sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt));
  ;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[#3b2762] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[#efc940]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-[#3b2762]">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Manage and track student payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                {/* <TableHead>Received by</TableHead> */}
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRecords.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>{payment.student}</TableCell>
                  <TableCell>{payment.session}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.paidAt}</TableCell>
                  {/* <TableCell>
                    {payment.receiver === user.name
                      ? `${payment.receiver} (You)`
                      : `${payment.receiver}`}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-green-500">Paid</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
