// components/PostCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";


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
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const handleLike = async () => {
    setLoadingLike(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isLiked ? 'unlike' : 'like';
      
      console.log('Sending like request to:', `${apiUrl}/posts/${post._id}/${endpoint}`);
      
      const response = await fetch(`${apiUrl}/posts/${post._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Like response:', data);

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(data.likesCount || (isLiked ? likesCount - 1 : likesCount + 1));
        toast.success(isLiked ? 'Unliked' : 'Liked!');
      } else {
        console.error('Like error response:', data);
        toast.error(data.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Error updating like');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleLoadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Loading comments from:', `${apiUrl}/posts/${post._id}/comments`);
      
      const response = await fetch(`${apiUrl}/posts/${post._id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Comments response:', data);

      if (response.ok) {
        setComments(data.comments || []);
      } else {
        console.error('Comments error:', data);
        toast.error(data.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Comments error:', error);
      toast.error('Error loading comments');
    }
    setShowComments(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoadingComment(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Adding comment to post:', post._id);
      
      const response = await fetch(`${apiUrl}/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });

      const data = await response.json();
      console.log('Add comment response:', data);

      if (response.ok) {
        setComments([...comments, data.comment]);
        setNewComment("");
        toast.success('Comment added!');
      } else {
        console.error('Add comment error:', data);
        toast.error(data.error || data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Error adding comment');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${post.title}\n${post.description}\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Share failed');
      }
    }
  };

  const handleHelp = async () => {
    // Navigate to request help page
    navigate(`/request/${post._id}/${post.category === 'blood' ? 'donate' : 'help'}`, {
      state: { post }
    });
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
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={loadingLike}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLoadComments}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{comments.length}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
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

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/20">
                            {comment.userName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 rounded p-2">
                          <div className="font-medium text-xs">{comment.userName || 'Anonymous'}</div>
                          <p className="text-xs mt-1">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={loadingComment || !newComment.trim()}
                  className="gradient-primary text-white"
                >
                  Post
                </Button>
              </div>
            </div>
          )}
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