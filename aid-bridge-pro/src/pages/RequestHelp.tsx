// src/pages/RequestHelp.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RequestFormData {
  requestType: 'help' | 'donate';
  postId: string;
  phoneNumber: string;
  message: string;
  quantity?: string;
  bloodType?: string;
  address?: string;
  hospital?: string;
  preferredLocation?: string;
}

export function RequestHelp() {
  const navigate = useNavigate();
  const { postId, type } = useParams<{ postId: string; type: 'help' | 'donate' }>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RequestFormData>({
    requestType: type === 'donate' ? 'donate' : 'help',
    postId: postId || '',
    phoneNumber: '',
    message: '',
    quantity: '',
    bloodType: '',
    address: '',
    hospital: '',
    preferredLocation: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    if (formData.requestType === 'donate' && !formData.bloodType) {
      toast.error('Blood type is required for donation');
      return;
    }

    setLoading(true);
    
    try {
      // API call to backend with full URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Submitting donation to:', `${apiUrl}/requests`);
      console.log('Form data:', formData);
      
      const response = await fetch(`${apiUrl}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to submit request');
      }

      toast.success(
        formData.requestType === 'donate' 
          ? '🩸 Donation registered! Thank you for helping!' 
          : '✅ Help request sent! We\'ll connect you soon.'
      );

      // Navigate to success page
      setTimeout(() => {
        navigate('/request-success', { state: { requestType: formData.requestType } });
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDonation = formData.requestType === 'donate';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isDonation ? 'Blood Donation' : 'Help Request'}
          </h1>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              {isDonation ? (
                <>
                  <span className="text-2xl">🩸</span>
                  Register Your Donation
                </>
              ) : (
                <>
                  <span className="text-2xl">🤝</span>
                  Offer Your Help
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Request Type:</strong> {isDonation ? 'Blood Donation' : 'Help'}
                </p>
                {isDonation && (
                  <p className="text-xs text-blue-800 mt-2">
                    ✅ Your donation can save a life. Thank you for stepping forward!
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to contact you for coordination
                </p>
              </div>

              {/* Blood Type (for donations) */}
              {isDonation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Your Blood Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.bloodType === type ? 'default' : 'outline'}
                        onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                        className="w-full"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity (for donations) */}
              {isDonation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    How many units can you donate?
                  </label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select quantity</option>
                    <option value="1">1 Unit (450ml)</option>
                    <option value="2">2 Units (900ml)</option>
                    <option value="3">3 Units (1350ml)</option>
                    <option value="multiple">Multiple donations</option>
                  </select>
                </div>
              )}

              {/* Address (for donations) */}
              {isDonation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Your Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll find nearby hospitals for you
                  </p>
                </div>
              )}

              {/* Hospital Selection (for donations) */}
              {isDonation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preferred Hospital/Blood Bank
                  </label>
                  <select
                    name="hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select or enter hospital</option>
                    <option value="redcross">Red Cross Blood Bank</option>
                    <option value="apollo">Apollo Hospital Blood Bank</option>
                    <option value="fortis">Fortis Hospital Blood Bank</option>
                    <option value="max">Max Healthcare Blood Bank</option>
                    <option value="other">Other (will specify in notes)</option>
                  </select>
                </div>
              )}

              {/* Preferred Location (for donations) */}
              {isDonation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preferred Donation Location
                  </label>
                  <select
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredLocation: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select location preference</option>
                    <option value="hospital">At Hospital</option>
                    <option value="home">At Home (Mobile unit)</option>
                    <option value="bloodbank">At Blood Bank</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isDonation ? 'Additional Information' : 'Message'} (Optional)
                </label>
                <Textarea
                  name="message"
                  placeholder={
                    isDonation 
                      ? 'Any medical conditions or allergies we should know about?'
                      : 'Tell us more about how you can help...'
                  }
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree that the information I provided is accurate and I'm willing to help as mentioned. 
                    {isDonation && ' I understand the donation process and am healthy enough to donate.'}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isDonation ? '🩸 Register Donation' : '✅ Submit Help Request'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>We'll review your {isDonation ? 'donation' : 'help'} request</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>We'll contact you on the provided phone number</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>We'll coordinate logistics and timing</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>You'll make a difference in someone's life! 🌟</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
