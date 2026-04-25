// TutorNotifs.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CalendarClock,
  MessageSquare,
  UserCheck,
  Star,
  BellRing,
  Check,
  CheckCircle,
  Trash2,
  Clock,
  PhilippinePeso,
  AlertCircle,
  Settings,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import axios from "axios";
import { CustomTooltip } from "../../components/CustomTooltip";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TutorNotifs = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });

      setNotifications(response.data.notifications || []);
      setStats({
        total: response.data.total || 0,
        unread: response.data.unreadCount || 0,
      });
      console.log(notifications)
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshNotifications = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setStats((prev) => ({ ...prev, unread: 0 }));

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notificationToDelete = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));

      setStats((prev) => ({
        total: prev.total - 1,
        unread: notificationToDelete?.isRead
          ? prev.unread
          : Math.max(0, prev.unread - 1),
      }));

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
      setStats({ total: 0, unread: 0 });

      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing all:", error);
      toast.error("Failed to clear notifications");
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "bookings") return notification.type.includes("booking");
    if (filter === "system")
      return ["payment_received", "new_review", "system_alert"].includes(
        notification.type
      );
    return true;
  });

  // Group notifications by date
  const groupNotificationsByDate = (notifs) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    notifs.forEach((notif) => {
      const notificationDate = new Date(notif.createdAt);

      if (notificationDate >= today) {
        groups.today.push(notif);
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notif);
      } else if (notificationDate >= oneWeekAgo) {
        groups.thisWeek.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_request":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "booking_confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "booking_cancelled":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "booking_completed":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "booking_reminder":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "payment_received":
        return <PhilippinePeso className="h-4 w-4 text-green-600" />;
      case "new_review":
        return <Star className="h-4 w-4 text-yellow-600" />;
      case "new_message":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <BellRing className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get notification action button
  const getNotificationAction = (notification) => {
    const actions = {
      booking_request: {
        text: "Review Request",
        icon: <UserCheck className="h-3 w-3" />,
        href: `/bookings/${
          notification.bookingId?._id || notification.data?.bookingId
        }`,
      },
      booking_confirmed: {
        text: "View Session",
        icon: <CalendarClock className="h-3 w-3" />,
        href: `/bookings/${
          notification.bookingId?._id || notification.data?.bookingId
        }`,
      },
      booking_cancelled: {
        text: "View Details",
        icon: <AlertCircle className="h-3 w-3" />,
        href: `/bookings/${
          notification.bookingId?._id || notification.data?.bookingId
        }`,
      },
      booking_completed: {
        text: "View Session",
        icon: <Calendar className="h-3 w-3" />,
        href: `/bookings/${
          notification.bookingId?._id || notification.data?.bookingId
        }`,
      },
      booking_reminder: {
        text: "View Session",
        icon: <Clock className="h-3 w-3" />,
        href: `/bookings/${
          notification.bookingId?._id || notification.data?.bookingId
        }`,
      },
      payment_received: {
        text: "View Details",
        icon: <DollarSign className="h-3 w-3" />,
        href: `/earnings`,
      },
      new_review: {
        text: "View Review",
        icon: <Star className="h-3 w-3" />,
        href: `/reviews`,
      },
      new_message: {
        text: "Read Message",
        icon: <MessageSquare className="h-3 w-3" />,
        href: `/messages/${notification.relatedUserId}`,
      },
    };

    const action = actions[notification.type];
    if (!action) return null;

    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => (window.location.href = action.href)}
        className="gap-1"
      >
        {action.icon}
        {action.text}
      </Button>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  // Render notification item
  const renderNotificationItem = (notification) => (
    <div
      key={notification._id}
      className={`flex items-start gap-4 rounded-md p-4 transition-colors hover:bg-muted/50 ${
        !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {getNotificationIcon(notification.type)}
        </div>
        {!notification.isRead && (
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-blue-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{notification.title}</p>
              {notification.isImportant && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 text-xs"
                >
                  Important
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>

            {/* Additional data display */}
            {notification.data && (
              <div className="mt-2 text-xs text-muted-foreground">
                {notification.data.studentName && (
                  <p>
                    Student:{" "}
                    <span className="font-medium">
                      {notification.data.studentName}
                    </span>
                  </p>
                )}
                {notification.data.topic && (
                  <p>
                    Topic:{" "}
                    <span className="font-medium">
                      {notification.data.topic}
                    </span>
                  </p>
                )}
                {notification.data.date && notification.data.time && (
                  <p>
                    Time:{" "}
                    <span className="font-medium">
                      {notification.data.date} at {notification.data.time}
                    </span>
                  </p>
                )}
                {notification.data.rating && (
                  <p>
                    Rating:{" "}
                    <span className="font-medium">
                      {notification.data.rating} stars
                    </span>
                  </p>
                )}
                {notification.data.price && (
                  <p>
                    Amount:{" "}
                    <span className="font-medium">
                      ₱{notification.data.price}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              {/* {getNotificationAction(notification)} */}
              {!notification.isRead && (
                <CustomTooltip
                  content="Mark this notification as read"
                  position="right"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notification._id)}
                    className="h-7 px-2"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </CustomTooltip>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteNotification(notification._id)}
                className="h-7 px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(notification.createdAt)}
            </p>
            {/* {notification.relatedUser && (
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                       `${BASE_URL}/uploads/${notification.relatedUser.profileImage}`||
                      "/placeholder.svg"
                    }
                    alt={notification.relatedUser.name}
                  />
                  <AvatarFallback>
                    {notification.relatedUser.name
                      ?.substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {notification.relatedUser.name}
                </span>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );

  // Render grouped notifications
  const renderGroupedNotifications = (groupName, groupNotifications) => {
    if (groupNotifications.length === 0) return null;

    return (
      <Card key={groupName} className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg capitalize">{groupName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {groupNotifications.map(renderNotificationItem)}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Card className="border-1 border-[#3b2762]">
        <CardContent className="p-6">
          {/* Header with stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-muted-foreground">
                {stats.unread} unread of {stats.total} total notifications
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshNotifications}
                disabled={refreshing}
                className="gap-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {stats.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" onClick={() => setFilter("all")}>
                All
                {filteredNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                onClick={() => setFilter("bookings")}
              >
                Bookings
                {filteredNotifications.filter((n) => n.type.includes("booking"))
                  .length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      filteredNotifications.filter((n) =>
                        n.type.includes("booking")
                      ).length
                    }
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="system" onClick={() => setFilter("system")}>
                System
                {filteredNotifications.filter((n) =>
                  ["payment_received", "new_review", "system_alert"].includes(
                    n.type
                  )
                ).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      filteredNotifications.filter((n) =>
                        [
                          "payment_received",
                          "new_review",
                          "system_alert",
                        ].includes(n.type)
                      ).length
                    }
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All Tab */}
            <TabsContent value="all" className="mt-6 space-y-6">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {renderGroupedNotifications(
                    "today",
                    groupedNotifications.today
                  )}
                  {renderGroupedNotifications(
                    "yesterday",
                    groupedNotifications.yesterday
                  )}
                  {renderGroupedNotifications(
                    "thisWeek",
                    groupedNotifications.thisWeek
                  )}
                  {renderGroupedNotifications(
                    "older",
                    groupedNotifications.older
                  )}
                </>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="mt-6">
              {filteredNotifications.filter((n) => n.type.includes("booking"))
                .length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No booking notifications
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    You'll see booking-related notifications here.
                  </p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Notifications</CardTitle>
                    <CardDescription>
                      Updates about your session bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredNotifications
                      .filter((n) => n.type.includes("booking"))
                      .map(renderNotificationItem)}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="mt-6">
              {filteredNotifications.filter((n) =>
                ["payment_received", "new_review", "system_alert"].includes(
                  n.type
                )
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No system notifications
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    You'll see system updates, payments, and reviews here.
                  </p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>System Notifications</CardTitle>
                    <CardDescription>
                      Updates about the platform and your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredNotifications
                      .filter((n) =>
                        [
                          "payment_received",
                          "new_review",
                          "system_alert",
                        ].includes(n.type)
                      )
                      .map(renderNotificationItem)}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Empty state for all tabs */}
          {filteredNotifications.length === 0 && (
            <div className="mt-6 text-center text-muted-foreground">
              <p>No notifications match your current filter.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorNotifs;
