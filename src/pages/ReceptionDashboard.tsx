
import React, { useState } from 'react';
import { 
  Award,
  BookMarked, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Filter, 
  PieChart, 
  Search, 
  User, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlurredCard from '@/components/ui/BlurredCard';
import FadeIn from '@/components/animations/FadeIn';
import { useAuth } from '@/context/AuthContext';
import { useBooking, BookingRequest } from '@/context/BookingContext';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ReceptionDashboard = () => {
  const { user } = useAuth();
  const { bookingRequests, bookingStats, updateRequestStatus } = useBooking();
  const { toast } = useToast();
  
  // State for request review dialog
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter requests that are pending or approved by reception (not yet reviewed by admin)
  const filteredRequests = bookingRequests.filter(request => {
    // First apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && request.status !== 'pending') return false;
      if (statusFilter === 'approved' && request.status !== 'reception-approved') return false;
    } else {
      // For 'all' tab, only show pending and reception-approved
      if (request.status !== 'pending' && request.status !== 'reception-approved') return false;
    }
    
    // Then apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        request.userName.toLowerCase().includes(search) ||
        request.department.toLowerCase().includes(search) ||
        request.reason.toLowerCase().includes(search)
      );
    }
    
    return true;
  });
  
  // Handle request approval by reception
  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await updateRequestStatus(
        selectedRequest.id, 
        'reception-approved', 
        reviewNote, 
        selectedPriority
      );
      
      toast({
        title: 'Request Approved',
        description: 'The request has been approved and sent to admin for final review.',
      });
      
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNote('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle request rejection by reception
  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await updateRequestStatus(
        selectedRequest.id, 
        'rejected', 
        reviewNote
      );
      
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected.',
      });
      
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNote('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date range for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };
  
  // Calculate days between two dates
  const getDaysBetween = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reception-approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved by Reception</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Low Priority</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium Priority</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-2">
            Reception Dashboard
          </h1>
          <p className="text-academic-text/70">
            Welcome back, {user?.name}. Manage hostel booking requests here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Stats */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <BlurredCard>
                <h2 className="font-serif font-bold text-lg text-academic mb-4">
                  Hostel Statistics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-academic-light/10 p-2 rounded-full mr-3">
                        <Building className="h-5 w-5 text-academic" />
                      </div>
                      <span className="text-sm text-academic-text/70">Total Rooms</span>
                    </div>
                    <span className="font-semibold">{bookingStats.totalRooms}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm text-academic-text/70">Available</span>
                    </div>
                    <span className="font-semibold">{bookingStats.availableRooms}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-academic-gold/10 p-2 rounded-full mr-3">
                        <BookMarked className="h-5 w-5 text-academic-gold" />
                      </div>
                      <span className="text-sm text-academic-text/70">Pending</span>
                    </div>
                    <span className="font-semibold">{bookingStats.pendingRequests}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-academic-light/10 p-2 rounded-full mr-3">
                        <User className="h-5 w-5 text-academic" />
                      </div>
                      <span className="text-sm text-academic-text/70">Occupied</span>
                    </div>
                    <span className="font-semibold">{bookingStats.approvedRequests}</span>
                  </div>
                </div>
              </BlurredCard>
              
              <BlurredCard>
                <h2 className="font-serif font-bold text-lg text-academic mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <PieChart className="mr-2 h-4 w-4" />
                    View Booking Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Room Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Request History
                  </Button>
                </div>
              </BlurredCard>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {bookingRequests.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Room Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-academic-light mr-2" />
                    <span className="text-2xl font-bold">
                      {Math.round((bookingStats.availableRooms / bookingStats.totalRooms) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {bookingRequests.filter(r => r.priority === 'high' && (r.status === 'pending' || r.status === 'reception-approved')).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <BlurredCard className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, department, or reason..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-academic-text/70" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved by Reception</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </BlurredCard>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-white">
                <TabsTrigger value="all" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  All Requests
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="priority" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  High Priority
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <BlurredCard key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Request details */}
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-academic">
                                {request.userName}
                              </h3>
                              <p className="text-academic-text/70 text-sm">
                                {request.department}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-2 h-4 w-4 text-academic-light" />
                              <span>{formatDateRange(request.startDate, request.endDate)}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-academic-text/70">{getDaysBetween(request.startDate, request.endDate)} days</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Rooms:</span> {request.numberOfRooms}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">SPOC:</span> {request.spoc.name} ({request.spoc.email})
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Request Type:</span> {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {request.reason.length > 100 ? `${request.reason.substring(0, 100)}...` : request.reason}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex md:flex-col justify-between md:justify-center gap-2">
                          <Button
                            variant="default"
                            className="bg-academic hover:bg-academic/90"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedPriority(request.priority);
                              setShowReviewDialog(true);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </BlurredCard>
                  ))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">All Caught Up!</h3>
                    <p className="text-academic-text/70">There are no requests pending review at this time.</p>
                  </BlurredCard>
                )}
              </TabsContent>
              
              <TabsContent value="pending">
                {/* Similar content as 'all' but filtered only for pending */}
                {filteredRequests.filter(r => r.status === 'pending').length > 0 ? (
                  filteredRequests.filter(r => r.status === 'pending').map((request) => (
                    <BlurredCard key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Same card content as above */}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-academic">
                                {request.userName}
                              </h3>
                              <p className="text-academic-text/70 text-sm">
                                {request.department}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-2 h-4 w-4 text-academic-light" />
                              <span>{formatDateRange(request.startDate, request.endDate)}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-academic-text/70">{getDaysBetween(request.startDate, request.endDate)} days</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Rooms:</span> {request.numberOfRooms}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">SPOC:</span> {request.spoc.name} ({request.spoc.email})
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Request Type:</span> {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {request.reason.length > 100 ? `${request.reason.substring(0, 100)}...` : request.reason}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col justify-between md:justify-center gap-2">
                          <Button
                            variant="default"
                            className="bg-academic hover:bg-academic/90"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedPriority(request.priority);
                              setShowReviewDialog(true);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </BlurredCard>
                  ))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">All Caught Up!</h3>
                    <p className="text-academic-text/70">There are no pending requests at this time.</p>
                  </BlurredCard>
                )}
              </TabsContent>
              
              <TabsContent value="priority">
                {/* Similar content but filtered for high priority */}
                {filteredRequests.filter(r => r.priority === 'high').length > 0 ? (
                  filteredRequests.filter(r => r.priority === 'high').map((request) => (
                    <BlurredCard key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Same card content as above */}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-academic">
                                {request.userName}
                              </h3>
                              <p className="text-academic-text/70 text-sm">
                                {request.department}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-2 h-4 w-4 text-academic-light" />
                              <span>{formatDateRange(request.startDate, request.endDate)}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-academic-text/70">{getDaysBetween(request.startDate, request.endDate)} days</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Rooms:</span> {request.numberOfRooms}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">SPOC:</span> {request.spoc.name} ({request.spoc.email})
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Request Type:</span> {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {request.reason.length > 100 ? `${request.reason.substring(0, 100)}...` : request.reason}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col justify-between md:justify-center gap-2">
                          <Button
                            variant="default"
                            className="bg-academic hover:bg-academic/90"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedPriority(request.priority);
                              setShowReviewDialog(true);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </BlurredCard>
                  ))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">No High Priority Requests</h3>
                    <p className="text-academic-text/70">There are no high priority requests at this time.</p>
                  </BlurredCard>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FadeIn>
      
      {/* Review Request Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Booking Request</DialogTitle>
            <DialogDescription>
              Review the request details and set a priority level. You can either approve or reject this request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-2">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-sm text-academic-text/70">Requester</p>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-academic-text/70">Department</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-sm text-academic-text/70">Date Range</p>
                  <p className="font-medium">{formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-academic-text/70">Number of Rooms</p>
                  <p className="font-medium">{selectedRequest.numberOfRooms}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-academic-text/70 mb-1">Reason</p>
                <p className="text-sm border rounded-md p-2 bg-gray-50">{selectedRequest.reason}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Set Priority Level</label>
                  <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reception Notes</label>
                  <Textarea 
                    placeholder="Add notes about room availability or other information..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                setShowReviewDialog(false);
                setSelectedRequest(null);
                setReviewNote('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="flex-1 gap-2"
              onClick={handleRejectRequest}
              disabled={isSubmitting}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button 
              className="flex-1 gap-2 bg-academic hover:bg-academic/90"
              onClick={handleApproveRequest}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionDashboard;
