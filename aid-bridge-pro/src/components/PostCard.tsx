// components/PostCard.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";


interface PostCardProps {
  post: {
    _id: string;
    title: string;
    description: string;
    category: string;
    user: {
      name: string;
      verified: boolean;
      avatar?: string;
    };
    createdAt: string;
    expiresAt?: string;
    status: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'text';
    urgency?: string;
  };
  currentUserId?: string;
  onRequestSent?: () => void;
}

export const PostCard = ({ post, currentUserId, onRequestSent }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      blood: '🩸',
      food: '🍲',
      clothes: '👕',
      books: '📚',
      blankets: '🛏️',
      general: '💬',
      community_service: '🤝',
      achievement: '🏆'
    };
    return icons[category] || '💬';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleHelp = async () => {
    // Implement help request logic here
    console.log('Help requested for post:', post._id);
    // You can add API call to send help request
    toast.success("Help request sent!");
    if (onRequestSent) onRequestSent();
  };

  const isBloodPost = post.category === 'blood';
  const isExpired = post.expiresAt && new Date(post.expiresAt) < new Date();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20">
      <CardContent className="p-0">
        {/* User Info Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-sm">
              {post.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{post.user.name}</h3>
              {post.user.verified && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  ✅
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {isBloodPost && post.expiresAt && (
                <>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
                    <Clock className="h-3 w-3" />
                    {isExpired ? 'Expired' : `Expires ${formatDistanceToNow(new Date(post.expiresAt))}`}
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {getCategoryIcon(post.category)} {post.category.toUpperCase()}
          </Badge>
        </div>

        {/* Media Display - IMAGE/VISIBLE IN HOME PAGE */}
        {post.mediaUrl && post.mediaType === 'image' && (
          <div className="relative">
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => setShowFullImage(true)}
            />
            <div className="absolute top-2 right-2">
              <Badge className={getUrgencyColor(post.urgency || 'low')}>
                {post.urgency || 'low'}
              </Badge>
            </div>
          </div>
        )}

        {/* Video Display */}
        {post.mediaUrl && post.mediaType === 'video' && (
          <div className="relative">
            <video
              src={post.mediaUrl}
              className="w-full h-64 object-cover"
              controls
            />
            <div className="absolute top-2 right-2">
              <Badge className={getUrgencyColor(post.urgency || 'low')}>
                {post.urgency || 'low'}
              </Badge>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="p-4 space-y-3">
          <div>
            <h2 className="font-bold text-lg mb-2">{post.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likesCount}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Comment</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                <Share className="h-4 w-4" />
                <span className="text-xs">Share</span>
              </Button>
            </div>

            <Button 
              onClick={handleHelp}
              size="sm"
              className="gradient-primary text-white"
              disabled={isBloodPost && isExpired}
            >
              {isBloodPost ? 'Donate' : 'Help'}
            </Button>
          </div>
        </div>

        {/* Blood Post Urgent Banner */}
        {isBloodPost && !isExpired && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-red-700">
                <span>🩸</span>
                <span className="font-medium">URGENT BLOOD NEED</span>
              </div>
              <div className="text-red-600 text-xs">
                Expires {formatDistanceToNow(new Date(post.expiresAt!))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Full Image Modal */}
      {showFullImage && post.mediaUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowFullImage(false)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </Card>
  );
};