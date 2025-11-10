// pages/CreatePost.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

const CreatePost = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [postType, setPostType] = useState<"needy" | "organization">("needy");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
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
      
      if (!userObj.verified) {
        toast.error("You must be verified to create posts");
        navigate("/");
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate("/auth");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type - CORRECTED FILE TYPES
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
      const validTypes = [...validImageTypes, ...validVideoTypes];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please select a valid image (JPEG, PNG, GIF, WEBP) or video (MP4, MOV, AVI, WEBM) file");
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    // Reset the file input
    const fileInput = document.getElementById("media") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !category || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('postType', postType);
      
      if (file) {
        formData.append('media', file);
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        formData.append('mediaType', mediaType);
      } else {
        formData.append('mediaType', 'text');
      }

      console.log('Creating post with media:', file ? file.name : 'No media');

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || 'Failed to create post');
      }

      console.log('Post created successfully:', response);
      toast.success("Post created successfully!");
      
      // Clean up and reset form
      handleRemoveFile();
      setTitle("");
      setDescription("");
      setCategory("");
      
      navigate("/");
    } catch (error: any) {
      console.error('Create post error:', error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const categories = postType === "needy"
    ? ["blood", "food", "clothes", "books", "blankets", "general"]
    : ["community_service", "achievement", "blood"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create Post
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Share Your Need or Update</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postType">Post Type</Label>
                <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needy">Needy Post</SelectItem>
                    {user?.role === "organization" && (
                      <SelectItem value="organization">Organization Post</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a clear title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your need or update"
                  rows={4}
                />
              </div>

              {/* File Upload Section - CORRECTED */}
              <div className="space-y-2">
                <Label htmlFor="media">Add Photo or Video</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  {/* CORRECTED FILE TYPES AND SIZE */}
                  Supported: JPEG, PNG, GIF, WEBP, MP4, MOV, AVI, WEBM (Max 10MB)
                </div>
                
                {/* File Input Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 transition-colors hover:border-primary/50">
                  <Input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {!file ? (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop or click to upload
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("media")?.click()}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                          {file.type.startsWith('image/') ? 'Image' : 'Video'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Preview Section */}
                {previewUrl && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Preview:
                    </Label>
                    {file?.type.startsWith("image/") ? (
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={previewUrl}
                          alt="Post preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border">
                        <video
                          src={previewUrl}
                          className="w-full h-64 object-cover"
                          controls
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {category === "blood" && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                  <p className="text-sm text-destructive-foreground">
                    🩸 Blood posts expire in 5 hours and are shown to nearby users
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 gradient-primary" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Post
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default CreatePost;