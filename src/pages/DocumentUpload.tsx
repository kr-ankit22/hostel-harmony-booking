
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderUp, FileText, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useBooking, BookingRequest } from '@/context/BookingContext';

const DocumentUpload = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { allRequests, userRequests, uploadDocuments, refreshBookings } = useBooking();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);

  // Find the booking request from either the user's requests or all requests
  useEffect(() => {
    if (requestId) {
      const foundRequest = [...userRequests, ...allRequests].find(request => request.id === requestId);
      if (foundRequest) {
        setBookingRequest(foundRequest);
      }
      setIsLoading(false);
    }
  }, [requestId, userRequests, allRequests]);

  // Redirect to dashboard if the request doesn't belong to the user
  useEffect(() => {
    if (!isLoading && !bookingRequest && user?.role === 'student') {
      toast({
        title: "Error",
        description: "Booking request not found or you don't have permission to view it.",
        variant: "destructive",
      });
      navigate('/student');
    }
  }, [isLoading, bookingRequest, navigate, user, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !requestId) return;

    try {
      setIsUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${requestId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update booking request with document URL
      await uploadDocuments(requestId, publicUrl);
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
      
      // Refresh booking data
      await refreshBookings();
      
      // Navigate back to student dashboard
      navigate('/student');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-academic" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-20">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-academic">Upload Supporting Documents</CardTitle>
          <CardDescription>
            Upload documents to support your hostel booking request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookingRequest && (
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Request Details</h3>
              <p className="text-sm mb-1">
                <span className="font-medium">Request Type:</span> {bookingRequest.requestType}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span> {bookingRequest.status}
              </p>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please upload any supporting documents for your booking request. 
              This may include authorization letters, event details, or guest information.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document">Upload Document (PDF, DOC, DOCX, Max 5MB)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <FileText className="h-5 w-5 text-academic" />
                <span className="text-sm text-slate-600 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/student')}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="bg-academic hover:bg-academic/90 btn-transition"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FolderUp className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentUpload;
