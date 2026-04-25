import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  BellRing,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { CustomTooltip } from "../../components/CustomTooltip";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DashboardSidebar({ isOpen }) {
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const audioRef = useRef(null);
  const originalTitleRef = useRef(document.title);
  const titleIntervalRef = useRef(null);
  const [isTabFocused, setIsTabFocused] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  const expanded = isOpen || hovered;

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabFocused(!document.hidden);
      if (!document.hidden) {
        // Reset title when user comes back to tab
        updatePageTitle(unreadCount, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track window focus/blur
    const handleFocus = () => {
      setIsTabFocused(true);
      updatePageTitle(unreadCount, true);
    };
    
    const handleBlur = () => {
      setIsTabFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearTitleAnimation();
    };
  }, []);

  // Update page title based on unread count
  useEffect(() => {
    updatePageTitle(unreadCount, false);
    
    // Clear animation when count goes to 0
    if (unreadCount === 0) {
      clearTitleAnimation();
    }
    
    // Play sound and animate when new notifications arrive
    if (unreadCount > lastCount && lastCount > 0) {
      playNotificationSound();
      triggerNotificationAnimation();
    }
    setLastCount(unreadCount);
    
    return () => {
      // Reset title when component unmounts
      document.title = originalTitleRef.current;
    };
  }, [unreadCount]);

  // Fetch unread notification count
  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCount = response.data.unreadCount || 0;
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update page title with notification count
  const updatePageTitle = (count, forceReset = false) => {
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    const originalTitle = originalTitleRef.current;
    
    // If tab is focused and forceReset is true, or count is 0, show original title
    if ((isTabFocused && forceReset) || count === 0) {
      document.title = originalTitle;
      clearTitleAnimation();
      return;
    }

    // If tab is not focused and we have notifications, update title
    if (!isTabFocused && count > 0) {
      document.title = `(${count}) ${originalTitle}`;
      startTitleAnimation(count);
    } else if (count > 0) {
      // Tab is focused but we still want to show count briefly
      document.title = `(${count}) ${originalTitle}`;
      clearTitleAnimation();
    }
  };

  // Animate page title (blink between count and original)
  const startTitleAnimation = (count) => {
    clearTitleAnimation();
    
    const originalTitle = originalTitleRef.current;
    let isCountVisible = true;
    
    titleIntervalRef.current = setInterval(() => {
      document.title = isCountVisible 
        ? `(${count}) ${originalTitle}`
        : originalTitle;
      isCountVisible = !isCountVisible;
    }, 1000); // Blink every second
  };

  const clearTitleAnimation = () => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
    }
  };

  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('../../../public/sound-1.mp3');
        audioRef.current.volume = 0.2;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Notification sound error:', error);
    }
  };

  const triggerNotificationAnimation = () => {
    // Trigger a subtle animation on the notification icon
    const notificationItem = document.querySelector('[data-notification-item]');
    if (notificationItem) {
      notificationItem.classList.add('notification-pulse');
      setTimeout(() => {
        notificationItem.classList.remove('notification-pulse');
      }, 1000);
    }
  };

  const handleNotificationClick = () => {
    // Clear animations when clicked
    const notificationItem = document.querySelector('[data-notification-item]');
    if (notificationItem) {
      notificationItem.classList.remove('notification-pulse');
    }
    
    // Reset page title when user clicks on notifications
    updatePageTitle(unreadCount, true);
    navigate('notifications');
  };

  const getNotificationTooltip = () => {
    if (loading) return "Loading notifications...";
    if (unreadCount === 0) return "No new notifications";
    if (unreadCount === 1) return "1 new notification - Click to view";
    return `${unreadCount} new notifications - Click to view`;
  };

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes notification-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .notification-pulse .notification-icon {
        animation: notification-pulse 0.5s ease-in-out 2;
        color: #efc940;
      }
      @keyframes badge-pulse {
        0%, 100% { 
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        70% { 
          box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
      }
      .badge-pulse {
        animation: badge-pulse 2s infinite;
      }
      .sidebar-item-highlight {
        position: relative;
      }
      .sidebar-item-highlight::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 70%;
        background: #efc940;
        border-radius: 0 4px 4px 0;
        animation: slide-in 0.3s ease-out;
      }
      @keyframes slide-in {
        from {
          transform: translateY(-50%) translateX(-10px);
          opacity: 0;
        }
        to {
          transform: translateY(-50%) translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const isNotificationsPage = location.pathname.includes('notifications');

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-[#3b2762] text-white transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4 border-b border-white/10">
        {expanded ? (
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>TutorConnect</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h1>
        ) : (
          <div className="h-8 flex items-center justify-center">
            <div className="text-lg font-bold">TC</div>
          </div>
        )}
      </div>

      <nav className="space-y-4 px-2 py-4">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="overview"
          expanded={expanded}
        />
        <SidebarItem
          icon={<BookOpen size={20} />}
          label="My Sessions"
          to="my-sessions"
          expanded={expanded}
        />
        <SidebarItem
          icon={<Search size={20} />}
          label="Find Tutor"
          to="find-tutor"
          expanded={expanded}
        />
        <SidebarItem
          icon={unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          label="Notifications"
          to="notifications"
          expanded={expanded}
          onClick={handleNotificationClick}
          badge={
            <NotificationBadge 
              count={unreadCount} 
              loading={loading}
              expanded={expanded}
              hasUnread={unreadCount > 0}
            />
          }
          tooltip={!expanded ? getNotificationTooltip() : null}
          highlight={isNotificationsPage && unreadCount > 0}
          dataNotificationItem={true}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          to="settings"
          expanded={expanded}
        />
        <AlertDialog
          open={isLogoutDialogOpen}
          onOpenChange={setIsLogoutDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <div className="w-full mt-auto pt-4 border-t border-white/10">
              <button
                className={`
                  flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer w-full
                  hover:bg-[#efc94033] transition-all
                `}
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <span className="text-white">
                  <LogOut size={20} />
                </span>
                {expanded && (
                  <span className="text-white transition-opacity duration-300">
                    Logout
                  </span>
                )}
              </button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-[#3b2762] hover:bg-[#513687] hover:cursor-pointer"
              >
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </nav>
    </aside>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  to, 
  expanded, 
  onClick, 
  badge, 
  tooltip, 
  highlight,
  dataNotificationItem,
  ...props 
}) {
  const content = (
    <div className="relative w-full">
      <NavLink
        to={to}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={({ isActive }) => `
          flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer
          hover:bg-[#efc94033] transition-all relative
          ${isActive || highlight ? "bg-[#efc94033] font-medium sidebar-item-highlight" : ""}
          ${dataNotificationItem ? 'notification-item' : ''}
        `}
        data-notification-item={dataNotificationItem}
        {...props}
      >
        <span className={`text-white notification-icon ${dataNotificationItem ? 'notification-icon' : ''}`}>
          {icon}
        </span>
        {expanded && (
          <span className="text-white transition-opacity duration-300 flex-1">
            {label}
          </span>
        )}
        {badge}
      </NavLink>
    </div>
  );

  if (!expanded && tooltip) {
    return (
      <CustomTooltip content={tooltip} side="right">
        {content}
      </CustomTooltip>
    );
  }

  return content;
}

function NotificationBadge({ count, loading, expanded, hasUnread }) {
  if (loading) {
    return (
      <div className={`${expanded ? 'ml-auto' : 'absolute -top-1 -right-1'}`}>
        <div className="h-5 w-5 rounded-full bg-gray-400 animate-pulse"></div>
      </div>
    );
  }

  if (count === 0) return null;

  const getBadgeStyle = () => {
    let baseStyle = "text-xs font-bold transition-all duration-300 ";
    
    if (count > 9) {
      baseStyle += "bg-gradient-to-r from-red-600 to-red-800 text-white badge-pulse ";
    } else if (count > 0) {
      baseStyle += "bg-gradient-to-r from-red-500 to-red-600 text-white ";
    }
    
    if (hasUnread) {
      baseStyle += "ring-2 ring-red-300 ring-offset-2 ring-offset-[#3b2762] ";
    }
    
    return baseStyle;
  };

  const badgeContent = count > 9 ? "9+" : count.toString();
  const badgeSize = count > 9 ? "h-6 min-w-6" : "h-5 min-w-5";

  return (
    <div className={`${expanded ? 'ml-auto' : 'absolute -top-1 -right-1'}`}>
      <div className={`
        ${badgeSize} px-1 rounded-full flex items-center justify-center
        ${getBadgeStyle()}
        shadow-lg
      `}>
        {badgeContent}
      </div>
    </div>
  );
}