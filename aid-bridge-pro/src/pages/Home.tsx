import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Bell, Search, Filter, LogOut, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Helper: deterministic color pair from string
  const nameToColorPair = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const c1 = `#${((hash >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`;
    const c2 = `#${((~hash >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`;
    return [c1, c2];
  };

  // Generate simple SVG avatar data URL with initials and gradient
  const generateAvatarDataUrl = (name = "") => {
    const initials = getUserInitials(name || "U");
    const [c1, c2] = nameToColorPair(name);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='${c1}' />
          <stop offset='1' stop-color='${c2}' />
        </linearGradient>
      </defs>
      <rect width='128' height='128' rx='20' fill='url(#g)'/>
      <text x='50%' y='54%' font-family='Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' font-size='48' fill='#ffffff' font-weight='600' text-anchor='middle' dominant-baseline='middle'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // professional background texture (embedded SVG data URL)
  const professionalBgSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop offset='0' stop-color='#ffffff' stop-opacity='0.06'/>
          <stop offset='1' stop-color='#e6f2ff' stop-opacity='0.04'/>
        </linearGradient>
        <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
          <rect width='100%' height='100%' fill='transparent'/>
          <path d='M40 0 L0 0 0 40' stroke='rgba(255,255,255,0.03)' stroke-width='1'/>
        </pattern>
        <pattern id='dots' width='16' height='16' patternUnits='userSpaceOnUse'>
          <circle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.05)'/>
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <rect width='100%' height='100%' fill='url(#grid)' opacity='0.6'/>
      <rect width='100%' height='100%' fill='url(#dots)' opacity='0.8'/>
    </svg>`
  )}`;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchQuery, categoryFilter, sortBy]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔐 Home auth check:', { token, userData });
    
    if (!token || !userData) {
      console.log('❌ No auth found, redirecting to /auth');
      navigate("/auth");
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      // ensure avatar exists for frontend display
      if (!userObj.avatar) {
        userObj.avatar = generateAvatarDataUrl(userObj.name || userObj.username || 'User');
      }
      setUser(userObj);
      
      // Verify token is still valid by calling /api/auth/me
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        const remoteUser = userData.data.user;
        if (remoteUser && !remoteUser.avatar) {
          remoteUser.avatar = generateAvatarDataUrl(remoteUser.name || remoteUser.username || 'User');
        }
        setUser(remoteUser);
        await fetchPosts();
      } else {
        // Token invalid, clear storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/auth");
      }
    } catch (error) {
      console.error('Auth validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/auth");
    }
  };

  const generateMockPosts = () => {
    return [
      {
        _id: '1',
        title: 'Urgent Blood Donation Needed - O+',
        description: 'My father needs O+ blood for surgery tomorrow. Any help would be greatly appreciated. Location: City Hospital',
        category: 'blood',
        user: {
          name: 'Priya Sharma',
          verified: true,
          avatar: null
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        mediaUrl: null,
        mediaType: 'text',
        urgency: 'high'
      },
      {
        _id: '2',
        title: 'Winter Clothes Donation Drive',
        description: 'Collecting warm clothes for homeless shelters. We need sweaters, jackets, blankets, and socks. Drop-off locations available across the city.',
        category: 'clothes',
        user: {
          name: 'Helping Hands NGO',
          verified: true,
          avatar: null
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        mediaUrl: null,
        mediaType: 'text',
        urgency: 'medium'
      },
      {
        _id: '3',
        title: 'Community Food Distribution',
        description: 'Free food packets available for families in need. Vegetarian meals prepared with hygiene. Come to Community Center between 12-2 PM.',
        category: 'food',
        user: {
          name: 'Community Kitchen',
          verified: true,
          avatar: null
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        mediaUrl: null,
        mediaType: 'text',
        urgency: 'low'
      },
      {
        _id: '4',
        title: 'Book Donation for School Library',
        description: 'Looking for educational books for underprivileged children. We need storybooks, textbooks, and educational materials for ages 6-15.',
        category: 'books',
        user: {
          name: 'Sunrise Public School',
          verified: true,
          avatar: null
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        mediaUrl: null,
        mediaType: 'text',
        urgency: 'low'
      },
      {
        _id: '5',
        title: 'Emergency: Blankets Needed',
        description: 'Cold wave alert! We need blankets immediately for street dwellers. Any spare blankets would save lives tonight.',
        category: 'blankets',
        user: {
          name: 'Night Shelter Trust',
          verified: true,
          avatar: null
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        mediaUrl: null,
        mediaType: 'text',
        urgency: 'high'
      }
    ];
  };

  const fetchPosts = async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      console.log('🔄 Fetching posts from API...');

      let dbPosts = [];
      
      // Try to fetch from database
      try {
        const res = await fetch(`${API_URL}/api/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          dbPosts = data.data?.posts || data.posts || [];
          console.log('✅ Database posts fetched:', dbPosts.length);
        } else {
          console.log('📝 No database posts found');
        }
      } catch (dbError) {
        console.log('📝 Database fetch failed, continuing with mock data');
      }

      // Always generate mock posts
      const mockPosts = generateMockPosts();
      console.log('🎭 Mock posts generated:', mockPosts.length);

      // Combine database posts + mock posts
      const allPosts = [...dbPosts, ...mockPosts];
      console.log('📊 Total posts (DB + Mock):', allPosts.length);

      // ensure each post has a user.avatar (generate from user.name or title)
      const normalized = allPosts.map((p: any) => {
        const userName = p?.user?.name || p?.user?.username || p?.title || 'User';
        return {
          ...p,
          user: {
            ...p.user,
            avatar: p.user?.avatar || generateAvatarDataUrl(userName),
            name: p.user?.name || userName
          }
        };
      });

      // Sort by creation date (newest first)
      const sortedPosts = normalized.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

      setPosts(sortedPosts);

    } catch (error: any) {
      console.log('💥 Error in fetchPosts:', error.message);
      // Fallback to only mock data (normalized)
      const mockPosts = generateMockPosts().map((p: any) => ({
        ...p,
        user: {
          ...p.user,
          avatar: p.user?.avatar || generateAvatarDataUrl(p.user?.name || p.title || 'User')
        }
      }));
      setPosts(mockPosts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "urgent":
          // Prioritize by urgency level and blood posts
          const urgencyOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aUrgency = a.urgency || (a.category === 'blood' ? 'high' : 'low');
          const bUrgency = b.urgency || (b.category === 'blood' ? 'high' : 'low');
          return urgencyOrder[bUrgency] - urgencyOrder[aUrgency];
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  };

  const handleSignOut = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      // Call logout endpoint to clear cookies
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
      // Clear frontend storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/auth");
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
    toast.success("Posts refreshed!");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      blood: '🩸',
      food: '🍲',
      clothes: '👕',
      books: '📚',
      blankets: '🛏️',
      general: '💬'
    };
    return icons[category as keyof typeof icons] || '💬';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-6 w-6 text-primary/60" />
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground">Loading Community</p>
            <p className="text-sm text-muted-foreground mt-1">Getting the latest posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // professional layered background: soft gradient, radial accent, subtle SVG texture
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundImage: [
          // base soft gradient
          "linear-gradient(180deg, #f7fbff 0%, #eef6fb 60%, #f1f7fb 100%)",
          // gentle radial accent top-right
          "radial-gradient(800px 400px at 90% 10%, rgba(59,130,246,0.08), transparent 20%)",
          // subtle vignette to focus center
          "radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.6), rgba(255,255,255,0.95) 60%)",
          // SVG texture overlay
          `url("${professionalBgSvg}")`
        ].join(", "),
        backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
        backgroundSize: "cover, 800px 400px, cover, auto",
        backgroundBlendMode: "normal, overlay, normal, multiply",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        // keep background fixed for a stable professional feel
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Community Connect
                </h1>
                <p className="text-xs text-muted-foreground">Helping hands, united</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notifications")}
                className="relative hover:bg-slate-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarImage src={user?.avatar || generateAvatarDataUrl(user?.name || 'User')} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs">
                    {getUserInitials(user?.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts, categories, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-white/50 backdrop-blur-sm border-slate-200/60 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4 animate-slide-up backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                <AvatarImage src={user?.avatar || generateAvatarDataUrl(user?.name || 'User')} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-medium">
                  {getUserInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">Welcome back, {user?.name}! 👋</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {filteredPosts.length > 0 
                    ? `${filteredPosts.length} posts need your help` 
                    : 'Ready to help your community today?'}
                </p>
              </div>
            </div>
            <Button 
              onClick={refreshPosts}
              variant="outline" 
              size="sm"
              disabled={refreshing}
              className="border-slate-200/60 hover:bg-white shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-200/60">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1 bg-white border-slate-200/60">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Category</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="blood">
                <div className="flex items-center gap-2">
                  <span>🩸</span>
                  <span>Blood</span>
                </div>
              </SelectItem>
              <SelectItem value="food">
                <div className="flex items-center gap-2">
                  <span>🍲</span>
                  <span>Food</span>
                </div>
              </SelectItem>
              <SelectItem value="clothes">
                <div className="flex items-center gap-2">
                  <span>👕</span>
                  <span>Clothes</span>
                </div>
              </SelectItem>
              <SelectItem value="books">
                <div className="flex items-center gap-2">
                  <span>📚</span>
                  <span>Books</span>
                </div>
              </SelectItem>
              <SelectItem value="blankets">
                <div className="flex items-center gap-2">
                  <span>🛏️</span>
                  <span>Blankets</span>
                </div>
              </SelectItem>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>General</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-white border-slate-200/60">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between px-1">
          <div className="text-sm text-muted-foreground">
            {searchQuery || categoryFilter !== 'all' ? (
              <span>
                Showing {filteredPosts.length} results
                {searchQuery && ` for "${searchQuery}"`}
                {categoryFilter !== 'all' && ` in ${getCategoryIcon(categoryFilter)} ${categoryFilter}`}
              </span>
            ) : (
              <span>Total {filteredPosts.length} active posts</span>
            )}
          </div>
          
          {categoryFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setCategoryFilter('all')}
            >
              Clear
            </Badge>
          )}
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery || categoryFilter !== 'all' ? 'No posts found' : 'No posts available'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Be the first to create a post and help your community.'}
            </p>
            <Button 
              variant={searchQuery || categoryFilter !== 'all' ? "outline" : "default"}
              onClick={() => {
                if (searchQuery || categoryFilter !== 'all') {
                  setSearchQuery('');
                  setCategoryFilter('all');
                } else {
                  navigate('/create-post');
                }
              }}
              className="shadow-sm"
            >
              {searchQuery || categoryFilter !== 'all' ? 'Clear Filters' : 'Create First Post'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onRequestSent={fetchPosts}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;