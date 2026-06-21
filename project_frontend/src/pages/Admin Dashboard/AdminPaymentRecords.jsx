"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  MoreHorizontal,
  Printer,
  Receipt,
  Search,
  XCircle,
  User,
  Clock,
  MapPin,
  Star,
  MessageSquare,
  CalendarDays,
  BarChart3,
  PhilippinePeso,
} from "lucide-react";
import { FaReceipt } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CustomTooltip } from "../../components/CustomTooltip";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminPaymentRecords = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialogId, setOpenDialogId] = useState(null);
  const [viewDetailsId, setViewDetailsId] = useState(null);

  // Report states
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportRange, setReportRange] = useState("monthly");
  const [reportData, setReportData] = useState(null);

  // Add these to your existing state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeType, setDateRangeType] = useState("preset"); // "preset" or "custom"

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Add these to your existing state
  const [selectedTutor, setSelectedTutor] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  // Add this to your existing state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  // Add this state for the dialog
  const [reportConfigOpen, setReportConfigOpen] = useState(false);

  // Add responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [signatories, setSignatories] = useState({
    administrator: { name: '', title: '' },
    dean: { name: '', title: '' }
  });

  useEffect(() => {
    fetchBookings();
    fetchSignatories(); // Add this line
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

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
        // const completedBookings = data.filter((booking) => booking.isPayable);
        // setBookings(completedBookings);\
        setBookings(data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch signatories:
  const fetchSignatories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/signatories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Transform array to object
      const signatoriesObj = {};
      response.data.forEach(sig => {
        signatoriesObj[sig.role] = { name: sig.name, title: sig.title };
      });

      setSignatories(signatoriesObj);
    } catch (error) {
      console.error("Error fetching signatories:", error);
      // Set default values
      setSignatories({
        administrator: { name: 'Julie Bitasolo, PhD', title: 'Administrator' },
        dean: { name: 'Shella Olaguir, PhD', title: 'CCIS Dean' }
      });
    }
  };

  const handleMarkAsPaid = async (bookingId) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/bookings/${bookingId}/mark-paid`,
        { paymentStatus: "paid", adminName: user.name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedBooking = response.data;
      setBookings(
        bookings.map((booking) =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );

      toast.success(response.data?.message || "Session marked as paid");
      fetchBookings();
      return true;
    } catch (err) {
      setError(err.message || "Failed to update payment status");
      toast.error("Failed to mark as paid");
      return false;
    }
  };

  // Find the booking details for viewing
  const getBookingDetails = (bookingId) => {
    return bookings.find((booking) => booking._id === bookingId);
  };

  // Search functionality with enhanced filtering
  const filteredPaymentRecords = () => {
    let filtered = paymentRecords;

    // Filter by tab (existing)
    if (activeTab === "paid") {
      filtered = filtered.filter((payment) => payment.status === "Paid");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((payment) => payment.status === "Pending");
    }

    // Filter by search term (existing)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.student.toLowerCase().includes(term) ||
          payment.tutor.toLowerCase().includes(term) ||
          payment.session.toLowerCase().includes(term) ||
          payment.amount.toLowerCase().includes(term) ||
          payment.id.toLowerCase().includes(term)
      );
    }

    // NEW: Filter by payment status
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(
        (payment) =>
          payment.status.toLowerCase() === paymentStatusFilter.toLowerCase()
      );
    }

    // Filter by tutor
    if (selectedTutor !== "all") {
      filtered = filtered.filter((payment) => payment.tutor === selectedTutor);
    }

    // Filter by amount
    if (amountFilter !== "all") {
      filtered = filtered.filter((payment) => {
        const amount = parseFloat(payment.amount.replace("₱", ""));
        switch (amountFilter) {
          case "under_30":
            return amount < 30;
          case "exactly_30":
            return amount === 30;
          case "over_30":
            return amount > 30;
          default:
            return true;
        }
      });
    }

    // Filter by session type (individual/group)
    if (sessionTypeFilter !== "all") {
      filtered = filtered.filter((payment) => {
        const booking = getBookingDetails(payment.id);
        return booking?.sessionType === sessionTypeFilter;
      });
    }

    // Filter by modality (online/face-to-face)
    if (modalityFilter !== "all") {
      filtered = filtered.filter((payment) => {
        const booking = getBookingDetails(payment.id);
        return booking?.modality === modalityFilter;
      });
    }

    return filtered;
  };

  // Generate Report Function
  const generateReport = async () => {
    // Validate custom date range
    if (dateRangeType === "custom") {
      if (!startDate || !endDate) {
        toast.error("Please select both start and end dates");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error("Start date cannot be after end date");
        return;
      }
    }

    setGeneratingReport(true);
    try {
      const rangeToUse = dateRangeType === "custom" ? "custom" : reportRange;
      const report = generateReportData(
        bookings,
        rangeToUse,
        dateRangeType === "custom" ? startDate : null,
        dateRangeType === "custom" ? endDate : null
      );
      setReportData(report);
      await generatePDF(report);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Report generation error:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Generate report data from bookings with custom date range support
  const generateReportData = (
    bookings,
    range,
    customStart = null,
    customEnd = null
  ) => {
    let startDate, endDate;

    if (range === "custom" && customStart && customEnd) {
      // Use custom date range - set start to beginning of day and end to end of day
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0); // Start of the day

      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else {
      // Use preset ranges (your existing code)
      const now = new Date();
      switch (range) {
        case "weekly":
          startDate = new Date(now.setDate(now.getDate() - 7));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
      }
    }

    // Apply the same filters that are used in the UI
    let filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const bookingDateOnly = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );
      const startDateOnly = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const endDateOnly = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      return bookingDateOnly >= startDateOnly && bookingDateOnly <= endDateOnly;
    });

    // Apply additional filters from the UI
    if (paymentStatusFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.paymentStatus === paymentStatusFilter
      );
    }

    if (selectedTutor !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.tutor?.name === selectedTutor
      );
    }

    if (amountFilter !== "all") {
      filteredBookings = filteredBookings.filter((booking) => {
        const amount = booking.price || 0;
        switch (amountFilter) {
          case "under_30":
            return amount < 30;
          case "exactly_30":
            return amount === 30;
          case "over_30":
            return amount > 30;
          default:
            return true;
        }
      });
    }

    if (sessionTypeFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.sessionType === sessionTypeFilter
      );
    }

    if (modalityFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.modality === modalityFilter
      );
    }

    // Calculate metrics (your existing code)
    const totalRevenue = filteredBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, booking) => sum + (booking.price || 0), 0);

    const pendingRevenue = filteredBookings
      .filter((b) => b.paymentStatus === "pending")
      .reduce((sum, booking) => sum + (booking.price || 0), 0);

    const totalSessions = filteredBookings.length;
    const paidSessions = filteredBookings.filter(
      (b) => b.paymentStatus === "paid"
    ).length;
    const pendingSessions = filteredBookings.filter(
      (b) => b.paymentStatus === "pending"
    ).length;

    // Get the detailed bookings data for the table and sort by date (newest first)
    const bookingsData = filteredBookings
      .map((booking) => ({
        id: booking._id,
        student: booking.student?.name || "Unknown Student",
        session: booking.topic,
        tutor: booking.tutor?.name || "Unknown Tutor",
        amount: booking.price ? `₱${booking.price.toFixed(2)}` : "₱30.00",
        date: new Date(booking.date),
        formattedDate: new Date(booking.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        status: booking.paymentStatus === "paid" ? "Paid" : "Pending",
        rawDate: booking.date,
      }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

    return {
      range: range === "custom" ? "custom" : reportRange,
      period: {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString(),
        isCustom: range === "custom",
      },
      financial: {
        totalRevenue,
        pendingRevenue,
        averageSessionPrice:
          totalSessions > 0 ? totalRevenue / totalSessions : 0,
      },
      sessions: {
        total: totalSessions,
        paid: paidSessions,
        pending: pendingSessions,
        byModality: {
          faceToFace: filteredBookings.filter(
            (b) => b.modality === "face-to-face"
          ).length,
          online: filteredBookings.filter((b) => b.modality === "online")
            .length,
        },
        byType: {
          individual: filteredBookings.filter(
            (b) => b.sessionType === "individual"
          ).length,
          group: filteredBookings.filter((b) => b.sessionType === "group")
            .length,
        },
      },
      bookingsData: bookingsData,
    };
  };

  // Alternative: Simple table format for filters
  const generateFiltersHTML = (report) => {
    const filters = [];

    // Always show date range
    filters.push(`
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Date Range</td>
      <td style="padding: 6px 8px; border: 1px solid #ddd;">${report.period.start} to ${report.period.end}</td>
    </tr>
  `);

    // Payment Status
    if (paymentStatusFilter !== "all") {
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Payment Status</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd; text-transform: capitalize;">${paymentStatusFilter}</td>
      </tr>
    `);
    }

    // Tutor
    if (selectedTutor !== "all") {
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Tutor</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd;">${selectedTutor}</td>
      </tr>
    `);
    }

    // Amount
    if (amountFilter !== "all") {
      const amountLabels = {
        under_30: "Under ₱30",
        exactly_30: "Exactly ₱30",
        over_30: "Over ₱30",
      };
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Amount</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd;">${amountLabels[amountFilter]}</td>
      </tr>
    `);
    }

    // Session Type
    if (sessionTypeFilter !== "all") {
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Session Type</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd; text-transform: capitalize;">${sessionTypeFilter}</td>
      </tr>
    `);
    }

    // Modality
    if (modalityFilter !== "all") {
      const modalityLabels = {
        online: "Online",
        "face-to-face": "Face-to-Face",
      };
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Modality</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd;">${modalityLabels[modalityFilter]}</td>
      </tr>
    `);
    }

    // Search Term
    if (searchTerm) {
      filters.push(`
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Search Term</td>
        <td style="padding: 6px 8px; border: 1px solid #ddd;">"${searchTerm}"</td>
      </tr>
    `);
    }

    return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tbody>
        ${filters.join("")}
      </tbody>
    </table>
  `;
  };

  // Generate PDF Function
  const generatePDF = async (report) => {
    const printWindow = window.open("", "_blank");
    // Get current date for the report
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TutorConnect Report</title>
        <style>
          body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header { 
          display: flex; 
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          border-bottom: 2px solid #3b2762;
          padding-bottom: 15px;
        }
        .left-section {
          display: flex;
          align-items: flex-start;
          flex: 1;
        }
        .logos-right {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-left: 20px;
        }
        .logo { 
          height: 70px; 
          margin-right: 12px;
        }
        .right-logo {
          height: 50px;
        }
        .header-content {
          flex: 1;
        }
        .header-line1 {
          font-family: Arial, sans-serif;
          font-size: 11px;
          margin: 0;
        }
        .header-line2 {
          font-family: Arial, sans-serif;
          font-size: 12px;
          font-weight: bold;
          margin: 2px 0;
        }
        .header-line3 {
          font-family: Arial, sans-serif;
          font-size: 10px;
          margin: 2px 0;
        }
        .header-line4 {
          font-family: Arial, sans-serif;
          font-size: 10px;
          margin: 2px 0;
        }
        .header-line5 {
          font-family: "Times New Roman", serif;
          font-size: 10px;
          font-style: italic;
          margin: 5px 0 0 0;
        }
        .header-line5 span {
          font-weight: bold;
        }
        .report-info {
          margin-bottom: 20px;
        }
        .report-title {
          font-size: 18px;
          font-weight: bold;
          color: #3b2762;
          margin-bottom: 5px;
        }
        .report-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 10px;
          font-size: 12px;
        }
        .report-detail-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .report-detail-label {
          font-weight: bold;
          color: #666;
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section-title { 
          color: #3b2762; 
          border-bottom: 1px solid #ddd;
          padding-bottom: 6px;
          margin-bottom: 12px;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #3b2762;
        }
        .total-revenue {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 2px solid #3b2762;
          text-align: right;
          font-size: 14px;
        }
        .total-revenue-label {
          font-weight: bold;
          color: #666;
          margin-right: 10px;
        }
        .total-revenue-amount {
          font-size: 18px;
          font-weight: bold;
          color: #3b2762;
        }
        .signatories {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature-box {
          width: 45%;
          text-align: center;
        }
        .signature-line {
          margin-top: 40px;
          border-top: 1px solid #333;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        .signature-name {
          margin-top: 5px;
          font-weight: bold;
          margin-top: 40px;
          border-bottom: 1px solid #333;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        .signature-title {
          font-size: 11px;
          color: #666;
        }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- BISU University Header -->
      <div class="header">
        <div class="left-section">
          <img src="https://github.com/stibeen/TutorConnect/blob/main/project_frontend/images/bisu-logo.png?raw=true" alt="BISU Logo" class="logo">
          <div class="header-content">
            <p class="header-line1">Republic of the Philippines</p>
            <p class="header-line2">BOHOL ISLAND STATE UNIVERSITY</p>
            <p class="header-line3">Magsija, Balilihan, 6342, Bohol, Philippines</p>
            <p class="header-line4">Office of the College of Computing and Information Sciences</p>
            <p class="header-line5">
              <span>B</span>alance | <span>I</span>ntegrity | <span>S</span>tewardship | <span>U</span>prightness
            </p>
          </div>
        </div>
        
        <div class="logos-right">
          <img src="/images/bagong-pilipinas-logo.png" alt="Bagong Pilipinas Logo" class="right-logo">
          <img src="/images/ccis-logo.png" alt="CCIS Logo" class="right-logo">
        </div>
      </div>

      <!-- Report Information -->
      <div class="report-info">
        <div class="report-title">PAYMENT RECORDS REPORT</div>
        <div class="report-details">
          <div class="report-detail-item">
            <span class="report-detail-label">Report Period:</span>
            <span>${report.period.start} to ${report.period.end}</span>
          </div>
          <div class="report-detail-item">
            <span class="report-detail-label">Report Date:</span>
            <span>${currentDate}</span>
          </div>
          <div class="report-detail-item">
            <span class="report-detail-label">Range Type:</span>
            <span>${report.range.charAt(0).toUpperCase() + report.range.slice(1)
      }</span>
          </div>
        </div>
      </div>

      <!-- Report Filters Section -->
      <div class="section">
        <h2 class="section-title">Report Filters Applied</h2>
        ${generateFiltersHTML(report)}
      </div>

      <!-- Session Details Table -->
      <div class="section">
        <h2 class="section-title">Session Details</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Session</th>
            <th>Tutor</th>
            <th>Amount</th>
            <th>Session Date</th>
            <th>Status</th>
          </tr>
          ${report.bookingsData
        .map(
          (booking) => `
            <tr>
              <td>${booking.id.slice(-6).toUpperCase()}</td>
              <td>${booking.student}</td>
              <td>${booking.session}</td>
              <td>${booking.tutor}</td>
              <td>${booking.amount}</td>
              <td>${booking.formattedDate}</td>
              <td>${booking.status}</td>
            </tr>
          `
        )
        .join("")}
        </table>
      </div>

      <!-- Simple Total Revenue -->
      <div class="total-revenue">
        <span class="total-revenue-label">TOTAL REVENUE:</span>
        <span class="total-revenue-amount">₱${report.financial.totalRevenue.toFixed(
          2
        )}</span>
      </div>

      <!-- Signatories Section -->
      <div class="signatories">
        <div class="signature-box">
          <div class="signature-title">Prepared by:</div>
          <div class="signature-name">${signatories.administrator.name || 'Julie Bitasolo, PhD'}</div>
          <div class="signature-title">${signatories.administrator.title || 'Administrator'}</div>
        </div>
        
        <div class="signature-box">
          <div class="signature-title">Approved by:</div>
          <div class="signature-name">${signatories.dean.name || 'Shella Olaguir, PhD'}</div>
          <div class="signature-title">${signatories.dean.title || 'CCIS Dean'}</div>
        </div>
      </div>

      <div class="no-print" style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3b2762; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print Report
        </button>
      </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedTutor("all");
    setAmountFilter("all");
    setSessionTypeFilter("all");
    setModalityFilter("all");
    setPaymentStatusFilter("all"); // Add this line
    setSearchTerm("");
  };

  const payableBookings = bookings.filter((booking) => booking.isPayable)
  // Transform bookings into payment records format
  const paymentRecords = payableBookings
    .map((booking) => ({
      id: booking._id,
      student: booking.student?.name || "Unknown Student",
      amount: booking.price ? `₱${booking.price.toFixed(2)}` : "₱30.00",
      session: booking.topic,
      tutor: booking.tutor?.name || "Unknown Tutor",
      status: booking.paymentStatus === "paid" ? "Paid" : "Pending",
      date: new Date(booking.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      receiptNo: booking.receiptNo || null,
      paidAt: booking.paidAt
        ? new Date(booking.paidAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        : "N/A",
      receiver: booking.payReceiver || "Admin",
      rawDate: booking.date,
    }))
    .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  const currentRecords = filteredPaymentRecords();

  if (loading) {
    return <div>Loading payment records...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-4 max-w-full overflow-x-hidden">
      {/* Search and Results Section */}
      <Card className="border border-[#3b2762] w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Generate Report */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student, tutor, session, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#3b2762] w-full"
                />
              </div>

              {/* Generate Report Button that opens the configuration dialog */}
              <Dialog
                open={reportConfigOpen}
                onOpenChange={setReportConfigOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#3b2762] hover:bg-[#2d1f4a] w-full sm:w-auto">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configure Report</DialogTitle>
                    <DialogDescription>
                      Set your report parameters and filters
                    </DialogDescription>
                  </DialogHeader>

                  {/* Report Configuration Form */}
                  <div className="space-y-6 py-4">
                    {/* Date Range Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Date Range</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            Report Type:
                          </span>
                          <Select
                            value={dateRangeType}
                            onValueChange={setDateRangeType}
                          >
                            <SelectTrigger className="w-[135px] border-[#3b2762]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preset">
                                Preset Range
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom Dates
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Preset Range */}
                        {dateRangeType === "preset" && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Period:</span>
                            <Select
                              value={reportRange}
                              onValueChange={setReportRange}
                            >
                              <SelectTrigger className="w-[130px] border-[#3b2762]">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Custom Date Range */}
                        {dateRangeType === "custom" && (
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">From:</span>
                              <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-[#3b2762] w-full"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">To:</span>
                              <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border-[#3b2762] w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Advanced Filters Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Advanced Filters</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Payment Status Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Payment Status
                          </label>
                          <Select
                            value={paymentStatusFilter}
                            onValueChange={setPaymentStatusFilter}
                          >
                            <SelectTrigger className="border-[#3b2762]">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tutor Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tutor</label>
                          <Select
                            value={selectedTutor}
                            onValueChange={setSelectedTutor}
                          >
                            <SelectTrigger className="border-[#3b2762]">
                              <SelectValue placeholder="All Tutors" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tutors</SelectItem>
                              {Array.from(
                                new Set(
                                  bookings
                                    .map((b) => b.tutor?.name)
                                    .filter(Boolean)
                                )
                              ).map((tutor) => (
                                <SelectItem key={tutor} value={tutor}>
                                  {tutor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Amount Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Amount</label>
                          <Select
                            value={amountFilter}
                            onValueChange={setAmountFilter}
                          >
                            <SelectTrigger className="border-[#3b2762]">
                              <SelectValue placeholder="All Amounts" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Amounts</SelectItem>
                              <SelectItem value="under_30">
                                Under ₱30
                              </SelectItem>
                              <SelectItem value="exactly_30">
                                Exactly ₱30
                              </SelectItem>
                              <SelectItem value="over_30">Over ₱30</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Session Type Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Session Type
                          </label>
                          <Select
                            value={sessionTypeFilter}
                            onValueChange={setSessionTypeFilter}
                          >
                            <SelectTrigger className="border-[#3b2762]">
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="individual">
                                Individual
                              </SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modality Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Modality
                          </label>
                          <Select
                            value={modalityFilter}
                            onValueChange={setModalityFilter}
                          >
                            <SelectTrigger className="border-[#3b2762]">
                              <SelectValue placeholder="All Modalities" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Modalities
                              </SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="face-to-face">
                                Face-to-Face
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          clearAllFilters();
                          setPaymentStatusFilter("all");
                        }}
                        className="border-[#3b2762] text-[#3b2762] hover:bg-[#3b2762] hover:text-white w-full sm:w-auto"
                      >
                        Clear All Filters
                      </Button>

                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setReportConfigOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            setReportConfigOpen(false);
                            generateReport();
                          }}
                          disabled={
                            dateRangeType === "custom" &&
                            (!startDate || !endDate)
                          }
                          className="bg-[#3b2762] hover:bg-[#2d1f4a] w-full sm:w-auto"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Results Counter */}
            <div className="text-sm text-muted-foreground">
              Showing {currentRecords.length} of {paymentRecords.length}{" "}
              payments
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTutor !== "all" && ` • Tutor: ${selectedTutor}`}
              {amountFilter !== "all" &&
                ` • Amount: ${amountFilter.replace("_", " ")}`}
              {sessionTypeFilter !== "all" && ` • Type: ${sessionTypeFilter}`}
              {modalityFilter !== "all" && ` • Modality: ${modalityFilter}`}
              {paymentStatusFilter !== "all" &&
                ` • Status: ${paymentStatusFilter}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 border border-[#3b2762]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        {/* All Payments Tab */}
        <TabsContent value="all">
          <PaymentRecordsTable
            payments={currentRecords}
            onMarkAsPaid={handleMarkAsPaid}
            viewDetailsId={viewDetailsId}
            onViewDetails={setViewDetailsId}
            getBookingDetails={getBookingDetails}
            openDialogId={openDialogId}
            setOpenDialogId={setOpenDialogId}
            isMobile={isMobile}
          />
        </TabsContent>

        {/* Paid Payments Tab */}
        <TabsContent value="paid">
          <Card className="border border-[#3b2762] w-full">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[80px]">ID</TableHead>
                      <TableHead className="min-w-[120px]">Student</TableHead>
                      <TableHead className="min-w-[150px]">Session</TableHead>
                      <TableHead className="min-w-[120px]">Tutor</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[120px]">
                        Payment Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell className="truncate max-w-[120px]">
                          {payment.student}
                        </TableCell>
                        <CustomTooltip
                          content={`${payment.session}`}
                          position="top"
                        >
                          <TableCell className="truncate max-w-[150px]">
                            {payment.session}
                          </TableCell>
                        </CustomTooltip>
                        <TableCell className="truncate max-w-[120px]">
                          {payment.tutor}
                        </TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.paidAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentRecords.length} payments
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pending Payments Tab */}
        <TabsContent value="pending">
          <Card className="border border-[#3b2762] w-full">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[80px]">ID</TableHead>
                      <TableHead className="min-w-[120px]">Student</TableHead>
                      <TableHead className="min-w-[150px]">Session</TableHead>
                      <TableHead className="min-w-[120px]">Tutor</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell className="truncate max-w-[120px]">
                          {payment.student}
                        </TableCell>
                        <CustomTooltip
                          content={`${payment.session}`}
                          position="right"
                        >
                          <TableCell className="truncate max-w-[150px]">
                            {payment.session}
                          </TableCell>
                        </CustomTooltip>
                        <TableCell className="truncate max-w-[120px]">
                          {payment.tutor}
                        </TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Dialog
                            open={openDialogId === payment.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setOpenDialogId(payment.id);
                              } else {
                                setOpenDialogId(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full sm:w-auto">
                                Mark as Paid
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mark Payment as Paid</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to mark this payment as
                                  paid?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="grid gap-3">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      Student:
                                    </span>
                                    <span>{payment.student}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      Session:
                                    </span>
                                    <span>{payment.session}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Tutor:</span>
                                    <span>{payment.tutor}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Amount:</span>
                                    <span className="font-semibold">
                                      {payment.amount}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span>{payment.date}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenDialogId(null)}
                                  className="w-full sm:w-auto"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={async () => {
                                    await handleMarkAsPaid(payment.id);
                                  }}
                                  className="w-full sm:w-auto"
                                >
                                  Confirm Payment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentRecords.length} pending payments
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate component for the main payment records table with actions
const PaymentRecordsTable = ({
  payments,
  onMarkAsPaid,
  viewDetailsId,
  onViewDetails,
  getBookingDetails,
  openDialogId,
  setOpenDialogId,
  isMobile,
}) => (
  <Card className="border border-[#3b2762] w-full">
    <CardContent className="pt-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">ID</TableHead>
              <TableHead className="min-w-[120px]">Student</TableHead>
              {!isMobile && (
                <TableHead className="min-w-[150px]">Session</TableHead>
              )}
              <TableHead className="min-w-[120px]">Tutor</TableHead>
              <TableHead className="min-w-[100px]">Amount</TableHead>
              <TableHead className="min-w-[120px]">Session Date</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.id.slice(-6).toUpperCase()}
                </TableCell>
                <TableCell className="truncate max-w-[120px]">
                  {payment.student}
                </TableCell>
                {!isMobile && (
                  <CustomTooltip
                    content={`${payment.session}`}
                    position="right"
                  >
                    <TableCell className="truncate max-w-[150px]">
                      {payment.session}
                    </TableCell>
                  </CustomTooltip>
                )}
                <TableCell className="truncate max-w-[120px]">
                  {payment.tutor}
                </TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {payment.status === "Paid" ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-green-500">Paid</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="text-amber-500">Pending</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <PaymentActions
                    payment={payment}
                    onMarkAsPaid={onMarkAsPaid}
                    viewDetailsId={viewDetailsId}
                    onViewDetails={onViewDetails}
                    getBookingDetails={getBookingDetails}
                    openDialogId={openDialogId}
                    setOpenDialogId={setOpenDialogId}
                    isMobile={isMobile}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {payments.length} booking records
      </div>
    </CardFooter>
  </Card>
);

// Separate component for payment actions dropdown
const PaymentActions = ({
  payment,
  onMarkAsPaid,
  viewDetailsId,
  onViewDetails,
  getBookingDetails,
  openDialogId,
  setOpenDialogId,
  isMobile,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Actions</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <SessionDetailsDialog
        payment={payment}
        viewDetailsId={viewDetailsId}
        onViewDetails={onViewDetails}
        getBookingDetails={getBookingDetails}
      />

      {payment.status === "Pending" && (
        <MarkAsPaidDialog
          payment={payment}
          onMarkAsPaid={onMarkAsPaid}
          openDialogId={openDialogId}
          setOpenDialogId={setOpenDialogId}
        />
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

// Separate component for session details dialog
const SessionDetailsDialog = ({
  payment,
  viewDetailsId,
  onViewDetails,
  getBookingDetails,
}) => (
  <Dialog
    open={viewDetailsId === payment.id}
    onOpenChange={(open) => {
      if (open) {
        onViewDetails(payment.id);
      } else {
        onViewDetails(null);
      }
    }}
  >
    <DialogTrigger asChild>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <FileText className="mr-2 h-4 w-4" />
        View Session Details
      </DropdownMenuItem>
    </DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Session Details</DialogTitle>
        <DialogDescription>
          Complete information about the tutoring session
        </DialogDescription>
      </DialogHeader>
      <SessionDetailsContent bookingDetails={getBookingDetails(payment.id)} />
    </DialogContent>
  </Dialog>
);

// Separate component for session details content
const SessionDetailsContent = ({ bookingDetails }) => {

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!bookingDetails) return null;

  return (
    <div className="space-y-6 py-4">
      {/* Basic Session Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Student</p>
              <p className="text-sm text-muted-foreground">
                {bookingDetails.student?.name || "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tutor</p>
              <p className="text-sm text-muted-foreground">
                {bookingDetails.tutor?.name || "Unknown"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Session Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(bookingDetails.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(bookingDetails.startTime)} - {formatTime(bookingDetails.endTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Session Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Topic</p>
            <p className="text-muted-foreground">{bookingDetails.topic}</p>
          </div>
          <div>
            <p className="font-medium">Modality</p>
            <Badge variant="outline" className="capitalize">
              {bookingDetails.modality}
            </Badge>
          </div>
          <div>
            <p className="font-medium">Session Type</p>
            <Badge variant="outline" className="capitalize">
              {bookingDetails.sessionType}
            </Badge>
          </div>
          <div>
            <p className="font-medium">Price</p>
            <p className="text-muted-foreground">
              ₱{bookingDetails.price?.toFixed(2) || "30.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Location Details */}
      {bookingDetails.modality === "face-to-face" &&
        bookingDetails.locationDetails && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Location</h4>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {bookingDetails.locationDetails}
              </p>
            </div>
          </div>
        )}

      {/* Special Instructions */}
      {bookingDetails.specialInstructions && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Special Instructions</h4>
          <p className="text-sm text-muted-foreground">
            {bookingDetails.specialInstructions}
          </p>
        </div>
      )}

      {/* Review */}
      {bookingDetails.review && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Student Review</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {bookingDetails.review.rating}/5
              </span>
            </div>
            {bookingDetails.review.comment && (
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {bookingDetails.review.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proof of Completion */}
      {bookingDetails.proofOfCompletion && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Proof of Completion</h4>
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-muted/50">
              <img
                src={`${BASE_URL}/uploads/${bookingDetails.proofOfCompletion}`}
                alt="Proof of completion"
                className="max-w-full max-h-64 object-contain mx-auto rounded"
                onError={(e) => {
                  console.error("Failed to load proof image");
                  e.target.alt = "Proof image not available";
                  e.target.className = "hidden";
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-muted-foreground truncate">
                {bookingDetails.proofOfCompletion}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `${BASE_URL}/uploads/${bookingDetails.proofOfCompletion}`,
                    "_blank"
                  );
                }}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Separate component for mark as paid dialog
const MarkAsPaidDialog = ({
  payment,
  onMarkAsPaid,
  openDialogId,
  setOpenDialogId,
}) => (
  <Dialog
    open={openDialogId === payment.id}
    onOpenChange={(open) => {
      if (open) {
        setOpenDialogId(payment.id);
      } else {
        setOpenDialogId(null);
      }
    }}
  >
    <DialogTrigger asChild>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Mark as Paid
      </DropdownMenuItem>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Mark Payment as Paid</DialogTitle>
        <DialogDescription>
          Are you sure you want to mark this payment as paid?
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="grid gap-3">
          <div className="flex justify-between">
            <span className="font-medium">Student:</span>
            <span>{payment.student}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Session:</span>
            <span>{payment.session}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tutor:</span>
            <span>{payment.tutor}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span className="font-semibold">{payment.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{payment.date}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setOpenDialogId(null)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await onMarkAsPaid(payment.id);
            setOpenDialogId(null);
          }}
          className="w-full sm:w-auto"
        >
          Confirm Payment
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default AdminPaymentRecords;
