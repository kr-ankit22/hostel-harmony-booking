
import React, { useState } from 'react';
import { 
  Award, 
  BookMarked,
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Filter, 
  MessageSquare, 
  Search, 
  Settings,
  User, 
  Users, 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { bookingRequests, bookingStats, updateRequestStatus } = useBooking();
  const { toast } = useToast();
  
  // State for request approval dialog
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  
  // Filter requests for admin review (reception-approved)
  const getFilteredRequests = () => {
    let requests = bookingRequests;
    
    // Apply status filter
    if (statusFilter === 'pending') {
      requests = requests.filter(r => r.status === 'reception-approved');
    } else if (statusFilter === 'approved') {
      requests = requests.filter(r => r.status === 'approved');
    } else if (statusFilter === 'rejected') {
      requests = requests.filter(r => r.status === 'rejected' || r.status === 'reconsidered');
    }
    
    // Apply search filter if any
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      requests = requests.filter(r => 
        r.userName.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search) ||
        r.reason.toLowerCase().includes(search)
      );
    }
    
    return requests;
  };
  
  const filteredRequests = getFilteredRequests();
  
  // Handle final approval by admin
  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await updateRequestStatus(
        selectedRequest.id, 
        'approved', 
        adminNote
      );
      
      toast({
        title: 'Request Approved',
        description: 'The hostel booking request has been approved.',
      });
      
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setAdminNote('');
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
  
  // Handle reconsideration by admin
  const handleReconsiderRequest = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await updateRequestStatus(
        selectedRequest.id, 
        'reconsidered', 
        adminNote
      );
      
      toast({
        title: 'Request Needs Reconsideration',
        description: 'The request has been marked for reconsideration.',
      });
      
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setAdminNote('');
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
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
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

  // Get counts
  const pendingCount = bookingRequests.filter(r => r.status === 'reception-approved').length;
  const approvedCount = bookingRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = bookingRequests.filter(r => ['rejected', 'reconsidered'].includes(r.status)).length;
  const totalCount = bookingRequests.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-2">
            Admin Dashboard
          </h1>
          <p className="text-academic-text/70">
            Welcome back, {user?.name}. Review and manage hostel booking requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <BlurredCard>
                <h2 className="font-serif font-bold text-lg text-academic mb-4">
                  Request Overview
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-academic-text/70">Pending Approval</span>
                    </div>
                    <span className="font-semibold">{pendingCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm text-academic-text/70">Approved</span>
                    </div>
                    <span className="font-semibold">{approvedCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <span className="text-sm text-academic-text/70">Rejected</span>
                    </div>
                    <span className="font-semibold">{rejectedCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-academic-light/10 p-2 rounded-full mr-3">
                        <BookMarked className="h-5 w-5 text-academic" />
                      </div>
                      <span className="text-sm text-academic-text/70">Total Requests</span>
                    </div>
                    <span className="font-semibold">{totalCount}</span>
                  </div>
                </div>
              </BlurredCard>
              
              <BlurredCard>
                <h2 className="font-serif font-bold text-lg text-academic mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Announcement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </div>
              </BlurredCard>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 bg-opacity-40"></div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold">{pendingCount}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-50 bg-opacity-40"></div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {bookingRequests.filter(r => r.priority === 'high' && r.status === 'reception-approved').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-academic-light/5"></div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium">Room Utilization</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-academic-light mr-2" />
                    <span className="text-2xl font-bold">
                      {Math.round((bookingStats.approvedRequests / bookingStats.totalRooms) * 100)}%
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
                    placeholder="Search requests..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-academic-text/70" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter requests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected/Reconsidered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </BlurredCard>
            
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4 bg-white">
                <TabsTrigger value="pending" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  Pending Approval
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-academic data-[state=active]:text-white">
                  Rejected
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
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
                            
                            {request.receptionNote && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                <span className="font-medium">Reception Note:</span> {request.receptionNote}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex md:flex-col justify-between md:justify-center gap-2">
                          <Button
                            variant="default"
                            className="bg-academic hover:bg-academic/90"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalDialog(true);
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
                    <p className="text-academic-text/70">There are no requests waiting for final approval.</p>
                  </BlurredCard>
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <BlurredCard key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Similar content as pending tab */}
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
                            
                            {request.receptionNote && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                <span className="font-medium">Reception Note:</span> {request.receptionNote}
                              </div>
                            )}
                            
                            {request.adminNote && (
                              <div className="mt-2 p-3 bg-green-50 rounded-md text-sm">
                                <span className="font-medium">Admin Note:</span> {request.adminNote}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="md:pl-4 md:border-l md:border-gray-200">
                          <div className="text-sm text-academic-text/70">
                            <div className="mb-2">
                              <span className="font-medium">Approval Date:</span> {format(new Date(), 'MMM d, yyyy')}
                            </div>
                            <div>
                              <span className="font-medium">Documents:</span> {request.documents ? 'Uploaded' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </BlurredCard>
                  ))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">No Approved Requests</h3>
                    <p className="text-academic-text/70">There are no approved requests to display.</p>
                  </BlurredCard>
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <BlurredCard key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Similar content as pending tab */}
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
                            
                            {request.receptionNote && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                <span className="font-medium">Reception Note:</span> {request.receptionNote}
                              </div>
                            )}
                            
                            {request.adminNote && (
                              <div className="mt-2 p-3 bg-red-50 rounded-md text-sm">
                                <span className="font-medium">Admin Note:</span> {request.adminNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </BlurredCard>
                  ))
                ) : (
                  <BlurredCard className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-academic-light/50 mb-4" />
                    <h3 className="text-lg font-medium text-academic mb-2">No Rejected Requests</h3>
                    <p className="text-academic-text/70">There are no rejected or reconsidered requests to display.</p>
                  </BlurredCard>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FadeIn>
      
      {/* Final Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Final Approval Decision</DialogTitle>
            <DialogDescription>
              Review the booking request and make a final decision on approval.
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
              
              {selectedRequest.receptionNote && (
                <div className="mb-4">
                  <p className="text-sm text-academic-text/70 mb-1">Reception Note</p>
                  <p className="text-sm border rounded-md p-2 bg-blue-50">{selectedRequest.receptionNote}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea 
                  placeholder="Add notes or comments about this approval decision..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                setShowApprovalDialog(false);
                setSelectedRequest(null);
                setAdminNote('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={handleReconsiderRequest}
              disabled={isSubmitting}
            >
              <MessageSquare className="h-4 w-4" />
              Reconsider
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

export default AdminDashboard;
