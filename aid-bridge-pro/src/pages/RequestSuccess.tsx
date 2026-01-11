// src/pages/RequestSuccess.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Share2 } from "lucide-react";

export function RequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestType = location.state?.requestType || 'help';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-4xl">
                {requestType === 'donate' ? '🩸' : '✅'}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {requestType === 'donate' ? 'Thank You!' : 'Request Sent!'}
          </h1>
          
          <p className="text-lg text-gray-600">
            {requestType === 'donate' 
              ? 'Your donation registration is complete'
              : 'Your help request has been received'}
          </p>
        </div>

        {/* Details Card */}
        <Card className="border-2 border-green-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-primary/5">
            <CardTitle className="text-center">What's Next?</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">We're reviewing your request</p>
                  <p className="text-xs text-muted-foreground mt-1">Our team is checking details</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Expect a call within 2 hours</p>
                  <p className="text-xs text-muted-foreground mt-1">On the number you provided</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Coordinate meeting details</p>
                  <p className="text-xs text-muted-foreground mt-1">Time and location will be confirmed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">💡 Keep Your Phone Handy</p>
          <p className="text-xs text-blue-800">
            Make sure your phone is reachable. Our team will contact you with next steps and any questions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/home')}
            className="w-full py-6 text-lg"
          >
            Back to Home
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            onClick={() => {
              // Share functionality
              const text = requestType === 'donate' 
                ? '🩸 I just registered to donate blood on Community Connect! Join and help save lives!'
                : '🤝 I just offered help on Community Connect! It\'s a great platform for community service!';
              
              if (navigator.share) {
                navigator.share({
                  title: 'Community Connect',
                  text: text,
                  url: window.location.origin
                });
              }
            }}
            variant="outline"
            className="w-full py-6"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>

        {/* Badges Section */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-700">You earned:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge className="bg-yellow-100 text-yellow-800">
              ⭐ Helper Badge
            </Badge>
            {requestType === 'donate' && (
              <Badge className="bg-red-100 text-red-800">
                🩸 Lifesaver Badge
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
