// pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
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
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      // Verify token with backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/auth");
        return;
      }

      const currentUser = await res.json();
      setUser(currentUser.data.user);
      
      // For now, use mock data
      setBadges([]); // No badges yet
      setPosts([]); // No user posts yet
      
    } catch (error) {
      console.error('Profile auth error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 text-black">
      <header className="bg-gradient-hero text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-black">{user?.name}</h1>
                {user?.verified && (
                  <BadgeDisplay icon="✅" name="Verified" size="sm" showLabel={false} />
                )}
              </div>
              <Badge variant="secondary" className="mt-1">
                {user?.role?.toUpperCase()}
              </Badge>
              <p className="text-sm text-white/80 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Badges Section */}
        <Card className="animate-slide-up">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4">My Achievements</h2>
            {badges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No badges earned yet. Start helping others to earn badges!
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {badges.map((badge) => (
                  <BadgeDisplay
                    key={badge.id}
                    icon={badge.icon}
                    name={badge.name}
                    description={badge.description}
                    size="md"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">My Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You haven't created any posts yet
                <Button 
                  onClick={() => navigate('/create-post')} 
                  className="mt-4 gradient-primary"
                >
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} currentUserId={user?._id} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;