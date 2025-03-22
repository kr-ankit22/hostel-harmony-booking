
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookMarked, Clock, FileText, MoreHorizontal, Plus, Upload } from 'lucide-react';
import BlurredCard from '@/components/ui/BlurredCard';
import FadeIn from '@/components/animations/FadeIn';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRequests } = useBooking();

  // Filter requests by status
  const pendingRequests = userRequests.filter(req => 
    ['pending', 'reception-approved'].includes(req.status)
  );
  const approvedRequests = userRequests.filter(req => req.status === 'approved');
  const rejectedRequests = userRequests.filter(req => 
    ['rejected', 'reconsidered'].includes(req.status)
  );

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reception-approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reception Approved</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'reconsidered':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date range
  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  // Render request card
  const renderRequestCard = (request: any) => (
    <Card key={request.id} className="mb-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-serif">{request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Room</CardTitle>
            <CardDescription>{request.department}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(request.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {request.status === 'approved' && !request.documents && (
                  <DropdownMenuItem onClick={() => navigate(`/document-upload/${request.id}`)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-academic-text/70">
            <Clock className="mr-2 h-4 w-4" />
            {formatDateRange(request.startDate, request.endDate)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Contact:</span> {request.spoc.name} ({request.spoc.email})
          </div>
          <div className="text-sm">
            <span className="font-medium">Rooms:</span> {request.numberOfRooms}
          </div>
          {(request.receptionNote || request.adminNote) && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
              {request.receptionNote && (
                <p><span className="font-medium">Reception Note:</span> {request.receptionNote}</p>
              )}
              {request.adminNote && (
                <p className="mt-1"><span className="font-medium">Admin Note:</span> {request.adminNote}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 pb-1">
        {request.status === 'approved' && !request.documents ? (
          <Button 
            variant="outline" 
            className="text-academic w-full" 
            onClick={() => navigate(`/document-upload/${request.id}`)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Required Documents
          </Button>
        ) : request.status === 'approved' ? (
          <div className="w-full text-center text-sm text-green-600">
            ✓ All documents uploaded
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-8 md:flex md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-2">
              Student Dashboard
            </h1>
            <p className="text-academic-text/70">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              asChild 
              className="bg-academic hover:bg-academic/90 btn-transition"
            >
              <Link to="/booking-request">
                <Plus className="mr-2 h-4 w-4" />
                New Booking Request
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlurredCard>
              <div className="mb-6">
                <h2 className="font-serif font-bold text-lg text-academic mb-2">
                  Your Bookings
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-academic-text/70">Pending</span>
                    <span className="font-medium">{pendingRequests.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-academic-text/70">Approved</span>
                    <span className="font-medium">{approvedRequests.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-academic-text/70">Rejected</span>
                    <span className="font-medium">{rejectedRequests.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif font-bold text-lg text-academic mb-2">
                  Quick Links
                </h2>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/booking-request">
                      <BookMarked className="mr-2 h-4 w-4" />
                      New Request
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Booking History
                  </Button>
                </div>
              </div>
            </BlurredCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {userRequests.length > 0 ? (
                  userRequests.map(request => renderRequestCard(request))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <BookMarked className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">No Requests Yet</h3>
                    <p className="text-academic-text/70 mb-6">You haven't made any hostel booking requests yet.</p>
                    <Button 
                      asChild 
                      className="bg-academic hover:bg-academic/90 btn-transition"
                    >
                      <Link to="/booking-request">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Request
                      </Link>
                    </Button>
                  </BlurredCard>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map(request => renderRequestCard(request))
                ) : (
                  <BlurredCard className="text-center py-6">
                    <p className="text-academic-text/70">No pending requests found.</p>
                  </BlurredCard>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {approvedRequests.length > 0 ? (
                  approvedRequests.map(request => renderRequestCard(request))
                ) : (
                  <BlurredCard className="text-center py-6">
                    <p className="text-academic-text/70">No approved requests found.</p>
                  </BlurredCard>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedRequests.length > 0 ? (
                  rejectedRequests.map(request => renderRequestCard(request))
                ) : (
                  <BlurredCard className="text-center py-6">
                    <p className="text-academic-text/70">No rejected requests found.</p>
                  </BlurredCard>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default StudentDashboard;
