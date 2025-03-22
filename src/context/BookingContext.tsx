
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookingRequest } from '@/types/database.types';

interface BookingContextType {
  userRequests: BookingRequest[];
  allRequests: BookingRequest[];
  isLoading: boolean;
  createBookingRequest: (bookingData: Omit<BookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBookingStatus: (id: string, status: string, note?: string, priority?: number) => Promise<void>;
  uploadDocuments: (id: string, documentsUrl: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRequests, setUserRequests] = useState<BookingRequest[]>([]);
  const [allRequests, setAllRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to convert database booking to frontend format
  const mapBookingFromDB = (booking: any): BookingRequest => ({
    id: booking.id,
    requestType: booking.request_type,
    department: booking.department,
    numberOfRooms: booking.number_of_rooms,
    startDate: new Date(booking.start_date),
    endDate: new Date(booking.end_date),
    reason: booking.reason,
    status: booking.status,
    spoc: {
      name: booking.spoc_name,
      email: booking.spoc_email,
    },
    receptionNote: booking.reception_note,
    adminNote: booking.admin_note,
    priority: booking.priority,
    documents: booking.documents,
    createdAt: new Date(booking.created_at),
    updatedAt: new Date(booking.updated_at),
  });

  // Fetch user-specific booking requests
  const fetchUserBookings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get all bookings based on role
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }
      
      if (data) {
        const mappedBookings = data.map(mapBookingFromDB);
        
        // Filter bookings based on user role
        if (user.role === 'student') {
          const userBookings = mappedBookings.filter(booking => 
            booking.spoc.email === user.email
          );
          setUserRequests(userBookings);
          setAllRequests([]);
        } else {
          // For reception and admin, show all bookings but track user's own bookings separately
          setUserRequests(mappedBookings.filter(booking => 
            booking.spoc.email === user.email
          ));
          setAllRequests(mappedBookings);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserBookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings whenever the user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    } else {
      setUserRequests([]);
      setAllRequests([]);
    }
  }, [user]);

  // Create a new booking request
  const createBookingRequest = async (bookingData: Omit<BookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('User must be logged in to create a booking');
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('booking_requests')
        .insert({
          user_id: user.id,
          request_type: bookingData.requestType,
          department: bookingData.department,
          number_of_rooms: bookingData.numberOfRooms,
          start_date: bookingData.startDate.toISOString(),
          end_date: bookingData.endDate.toISOString(),
          reason: bookingData.reason,
          status: 'pending',
          spoc_name: bookingData.spoc.name,
          spoc_email: bookingData.spoc.email,
        })
        .select();
        
      if (error) {
        toast({
          title: 'Error creating booking',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        toast({
          title: 'Booking created',
          description: 'Your booking request has been submitted successfully',
        });
        
        // Refresh the bookings list
        await fetchUserBookings();
        
        return data[0].id;
      }
      
      throw new Error('Failed to create booking');
    } catch (error) {
      console.error('Error in createBookingRequest:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id: string, status: string, note?: string, priority?: number): Promise<void> => {
    if (!user) throw new Error('User must be logged in to update a booking');
    
    try {
      setIsLoading(true);
      
      const updateData: any = { status };
      
      // Based on role, update different fields
      if (user.role === 'reception') {
        if (note) updateData.reception_note = note;
        if (typeof priority === 'number') updateData.priority = priority;
      } else if (user.role === 'admin') {
        if (note) updateData.admin_note = note;
      }
      
      const { error } = await supabase
        .from('booking_requests')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        toast({
          title: 'Error updating booking',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Booking updated',
        description: `Booking status changed to ${status}`,
      });
      
      // Refresh the bookings list
      await fetchUserBookings();
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload documents for a booking
  const uploadDocuments = async (id: string, documentsUrl: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to upload documents');
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('booking_requests')
        .update({ documents: documentsUrl })
        .eq('id', id);
        
      if (error) {
        toast({
          title: 'Error uploading documents',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Documents uploaded',
        description: 'Your documents have been uploaded successfully',
      });
      
      // Refresh the bookings list
      await fetchUserBookings();
    } catch (error) {
      console.error('Error in uploadDocuments:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh bookings data
  const refreshBookings = async (): Promise<void> => {
    await fetchUserBookings();
  };

  return (
    <BookingContext.Provider
      value={{
        userRequests,
        allRequests,
        isLoading,
        createBookingRequest,
        updateBookingStatus,
        uploadDocuments,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Using export type for re-exporting types
export type { BookingRequest };
