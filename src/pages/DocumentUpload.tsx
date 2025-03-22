
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookMarked, Calendar, Check, FileCheck, FileUp, Loader2, Upload, User, X } from 'lucide-react';
import BlurredCard from '@/components/ui/BlurredCard';
import FadeIn from '@/components/animations/FadeIn';
import { format } from 'date-fns';
import { useBooking } from '@/context/BookingContext';

const DocumentUpload = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRequestById, uploadDocuments } = useBooking();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Mock required documents
  const requiredDocuments = [
    'ID Proof',
    'Authorization Letter',
    'Department Approval',
  ];
  
  // Get booking request details
  const bookingRequest = requestId ? getRequestById(requestId) : undefined;
  
  // Redirect if request not found or not approved
  useEffect(() => {
    if (!bookingRequest) {
      toast({
        title: 'Request Not Found',
        description: 'The booking request could not be found.',
        variant: 'destructive',
      });
      navigate('/student');
      return;
    }
    
    if (bookingRequest.status !== 'approved') {
      toast({
        title: 'Not Approved',
        description: 'Only approved booking requests require document uploads.',
        variant: 'destructive',
      });
      navigate('/student');
      return;
    }
    
    // Pre-fill existing documents if any
    if (bookingRequest.documents) {
      setDocuments(bookingRequest.documents);
    }
    
    if (bookingRequest.profileImage) {
      setProfileImage(bookingRequest.profileImage);
    }
  }, [bookingRequest, navigate, toast]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Handle document file change
  const handleDocumentChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const newDocuments = [...documents];
          newDocuments[index] = event.target.result;
          setDocuments(newDocuments);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Remove a document
  const removeDocument = (index: number) => {
    const newDocuments = [...documents];
    newDocuments[index] = '';
    setDocuments(newDocuments);
  };
  
  // Check if form is complete
  const isFormComplete = () => {
    return profileImage && documents.filter(Boolean).length === requiredDocuments.length;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!requestId) return;
    
    setIsUploading(true);
    try {
      await uploadDocuments(
        requestId,
        documents.filter(Boolean),
        profileImage || undefined
      );
      
      toast({
        title: 'Documents Uploaded',
        description: 'Your documents have been successfully uploaded.',
      });
      
      navigate('/student');
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'There was a problem uploading your documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!bookingRequest) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-2">
            Document Upload
          </h1>
          <p className="text-academic-text/70">
            Upload the required documents for your approved hostel booking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details Sidebar */}
          <div className="lg:col-span-1">
            <BlurredCard className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <BookMarked className="h-5 w-5 text-academic" />
                <h2 className="font-serif font-bold text-lg text-academic">
                  Booking Details
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-academic-text/70">Request ID</label>
                  <p className="font-medium">{bookingRequest.id}</p>
                </div>
                
                <div>
                  <label className="text-sm text-academic-text/70">Department</label>
                  <p className="font-medium">{bookingRequest.department}</p>
                </div>
                
                <div>
                  <label className="text-sm text-academic-text/70">Date Range</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-academic-light mr-2" />
                    <p className="font-medium">
                      {formatDate(bookingRequest.startDate)} - {formatDate(bookingRequest.endDate)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-academic-text/70">Number of Rooms</label>
                  <p className="font-medium">{bookingRequest.numberOfRooms}</p>
                </div>
                
                <div>
                  <label className="text-sm text-academic-text/70">Room Type</label>
                  <p className="font-medium capitalize">{bookingRequest.requestType}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm text-academic-text/70">SPOC</label>
                  <p className="font-medium">{bookingRequest.spoc.name}</p>
                  <p className="text-sm text-academic-text/70">{bookingRequest.spoc.email}</p>
                </div>
              </div>
            </BlurredCard>
          </div>

          {/* Document Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  Please upload all the required documents below. All documents must be in PDF, JPG, or PNG format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Upload */}
                <div>
                  <Label htmlFor="profile" className="block mb-2">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="profile"
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={handleProfileImageChange}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a clear profile photo. Max size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Document Uploads */}
                {requiredDocuments.map((doc, index) => (
                  <div key={index}>
                    <Label htmlFor={`doc-${index}`} className="block mb-2">{doc}</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {documents[index] ? (
                          <FileCheck className="h-6 w-6 text-green-500" />
                        ) : (
                          <FileUp className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        {documents[index] ? (
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span className="text-sm font-medium truncate">Document uploaded</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Input
                            id={`doc-${index}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="cursor-pointer"
                            onChange={(e) => handleDocumentChange(index, e)}
                          />
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Upload {doc} document. Accepted formats: PDF, JPG, PNG.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student')}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!isFormComplete() || isUploading}
                  onClick={() => setShowConfirmDialog(true)}
                  className="bg-academic hover:bg-academic/90"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Documents
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </FadeIn>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Document Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit these documents? Please verify that all information is correct and all required documents are uploaded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-academic hover:bg-academic/90">
              <Check className="mr-2 h-4 w-4" />
              Confirm Submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentUpload;
