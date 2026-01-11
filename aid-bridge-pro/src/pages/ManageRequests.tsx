// src/pages/ManageRequests.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Phone, MessageCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Request {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  postId: string;
  requestType: 'help' | 'donate';
  phoneNumber: string;
  message?: string;
  bloodType?: string;
  quantity?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export function ManageRequests() {
  const { postId } = useParams<{ postId: string }>();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [postId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/requests/post/${postId}`);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingId(requestId);
      const response = await axios.put(
        `/api/requests/${requestId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update local state
      setRequests(requests.map(r =>
        r._id === requestId ? { ...r, status: newStatus as any } : r
      ));

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: any } = {
      pending: <Clock className="w-4 h-4 inline mr-1" />,
      contacted: <MessageCircle className="w-4 h-4 inline mr-1" />,
      confirmed: <CheckCircle className="w-4 h-4 inline mr-1" />,
      completed: <CheckCircle className="w-4 h-4 inline mr-1" />,
      cancelled: <XCircle className="w-4 h-4 inline mr-1" />
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Manage Requests</h1>
          <p className="text-muted-foreground">
            {requests.length} {requests.length === 1 ? 'person' : 'people'} have offered help
          </p>
        </div>

        {/* No Requests */}
        {requests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground mb-2">No requests yet</p>
              <p className="text-sm text-muted-foreground">
                When people offer help, they'll appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Requests List */
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={request.userId.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.userId.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {request.userId.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="flex-shrink-0"
                        >
                          {request.requestType === 'donate' ? '🩸 Donor' : '🤝 Helper'}
                        </Badge>
                      </div>

                      {/* Request Details */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${request.phoneNumber}`} className="hover:text-primary">
                            {request.phoneNumber}
                          </a>
                        </div>

                        {request.bloodType && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Blood Type:</span> {request.bloodType}
                            {request.quantity && ` (${request.quantity})`}
                          </p>
                        )}

                        {request.message && (
                          <p className="text-muted-foreground italic">
                            "{request.message}"
                          </p>
                        )}
                      </div>

                      {/* Status Section */}
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>

                        {/* Status Update Buttons */}
                        {request.status !== 'completed' && request.status !== 'cancelled' && (
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === request._id}
                                onClick={() => updateStatus(request._id, 'contacted')}
                              >
                                {updatingId === request._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Contact'
                                )}
                              </Button>
                            )}

                            {(request.status === 'pending' || request.status === 'contacted') && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === request._id}
                                onClick={() => updateStatus(request._id, 'confirmed')}
                              >
                                {updatingId === request._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Confirm'
                                )}
                              </Button>
                            )}

                            {request.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === request._id}
                                onClick={() => updateStatus(request._id, 'completed')}
                              >
                                {updatingId === request._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Complete'
                                )}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={updatingId === request._id}
                              onClick={() => updateStatus(request._id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {(request.status === 'completed' || request.status === 'cancelled') && (
                          <p className="text-xs text-muted-foreground">
                            {request.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        {requests.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">💡 How to manage requests?</h3>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Click "Contact" to mark that you've reached out</li>
                <li>Click "Confirm" once the time/location is set</li>
                <li>Click "Complete" after help/donation is done</li>
                <li>Requesters receive notifications at each step</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
