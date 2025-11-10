// pages/Notifications.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate("/auth");
      return;
    }

    try {
      // For now, use mock notifications
      const mockNotifications = [
        {
          _id: '1',
          message: 'Welcome to Community Connect!',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      
      // Uncomment when you have notifications API:
      /*
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load notifications');
      
      const data = await res.json();
      setNotifications(data.notifications || []);
      */
    } catch (error: any) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Uncomment when you have notifications API:
      /*
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      */
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`cursor-pointer transition-smooth hover:shadow-md ${
                  !notification.read ? "border-primary" : ""
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt || notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;