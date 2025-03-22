
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, LineChart, Cell, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import { format } from 'date-fns';
import { FileText, AlertCircle, ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBooking, BookingRequest } from '@/context/BookingContext';

// Reception dashboard
const ReceptionDashboard = () => {
  const { toast } = useToast();
  const { allRequests, updateBookingStatus, isLoading } = useBooking();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Handle open update dialog
  const handleOpenUpdate = (request: BookingRequest) => {
    setActiveRequestId(request.id);
    setStatusNote(request.receptionNote || '');
    setNewStatus(request.status);
    setPriority(request.priority || 0);
    setOpenDialog(true);
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!activeRequestId || !newStatus) return;

    try {
      setIsSubmitting(true);
      await updateBookingStatus(activeRequestId, newStatus, statusNote, priority);
      setOpenDialog(false);
      toast({
        title: "Status Updated",
        description: `Request status has been changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the booking status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get request statistics
  const getRequestStats = () => {
    const pendingCount = allRequests.filter(r => r.status === 'pending').length;
    const approvedCount = allRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;
    const inReviewCount = allRequests.filter(r => r.status === 'in review').length;

    const totalRooms = allRequests.reduce((sum, req) => 
      req.status === 'approved' ? sum + req.numberOfRooms : sum, 0);

    return [
      { name: 'Pending', value: pendingCount, color: '#fbbf24' },
      { name: 'In Review', value: inReviewCount, color: '#60a5fa' },
      { name: 'Approved', value: approvedCount, color: '#34d399' },
      { name: 'Rejected', value: rejectedCount, color: '#f87171' },
      { name: 'Rooms Booked', value: totalRooms, color: '#8b5cf6' },
    ];
  };

  // Get request data by department
  const getDepartmentData = () => {
    const departments = [...new Set(allRequests.map(req => req.department))];
    return departments.map(dept => {
      const deptRequests = allRequests.filter(req => req.department === dept);
      return {
        name: dept,
        total: deptRequests.length,
        approved: deptRequests.filter(req => req.status === 'approved').length,
        pending: deptRequests.filter(req => req.status === 'pending').length,
        rejected: deptRequests.filter(req => req.status === 'rejected').length,
      };
    });
  };

  // Generate mock trend data (in a real app, this would come from the database)
  const getTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      requests: Math.floor(Math.random() * 50) + 10,
      approvals: Math.floor(Math.random() * 40) + 5,
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-academic" />
          <p className="text-academic font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-serif font-bold text-academic mb-6">Reception Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {getRequestStats().map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>{stat.name}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${Math.min(100, (stat.value / Math.max(...getRequestStats().map(s => s.value))) * 100)}%`, backgroundColor: stat.color }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="requests" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>
                Review and manage all booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rooms</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date Range</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SPOC</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allRequests.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                          No booking requests found
                        </td>
                      </tr>
                    ) : (
                      allRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">{request.id.slice(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm">{request.requestType}</td>
                          <td className="px-4 py-3 text-sm">{request.department}</td>
                          <td className="px-4 py-3 text-sm">{request.numberOfRooms}</td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-col">
                              <span>{request.spoc.name}</span>
                              <span className="text-xs text-muted-foreground">{request.spoc.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {request.priority || 0}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleOpenUpdate(request)}
                            >
                              <ClipboardCheck className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requests by Status</CardTitle>
                <CardDescription>
                  Distribution of requests by their current status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getRequestStats().slice(0, 4)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count">
                      {getRequestStats().slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Request Trends</CardTitle>
                <CardDescription>
                  Monthly trends of requests and approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Total Requests" />
                    <Line type="monotone" dataKey="approvals" stroke="#82ca9d" name="Approvals" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Requests by Department</CardTitle>
                <CardDescription>
                  Distribution of requests across different departments
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDepartmentData()} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" name="Pending" fill="#fbbf24" />
                    <Bar dataKey="approved" stackId="a" name="Approved" fill="#34d399" />
                    <Bar dataKey="rejected" stackId="a" name="Rejected" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for updating status */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Review and update the status of this booking request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Select 
                value={priority.toString()} 
                onValueChange={(value) => setPriority(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Set priority" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(11)].map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i} - {i === 0 ? 'Lowest' : i === 10 ? 'Highest' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Reception Note</Label>
              <Textarea
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add notes about this request..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isSubmitting}
              className="bg-academic hover:bg-academic/90 btn-transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionDashboard;
