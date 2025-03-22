
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface RequestContact {
  name: string;
  email: string;
}

export interface BookingRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  startDate: Date;
  endDate: Date;
  numberOfRooms: number;
  spoc: RequestContact;
  requestType: 'single' | 'shared' | 'family' | 'guest';
  reason: string;
  status: 'pending' | 'reception-approved' | 'approved' | 'rejected' | 'reconsidered';
  receptionNote?: string;
  adminNote?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  documents?: string[];
  profileImage?: string;
}

interface BookingStats {
  totalRooms: number;
  availableRooms: number;
  pendingRequests: number;
  approvedRequests: number;
}

interface BookingContextType {
  bookingRequests: BookingRequest[];
  userRequests: BookingRequest[];
  bookingStats: BookingStats;
  addRequest: (request: Omit<BookingRequest, 'id' | 'userId' | 'userName' | 'status' | 'createdAt'>) => Promise<void>;
  updateRequestStatus: (
    requestId: string, 
    status: BookingRequest['status'], 
    note?: string,
    priority?: BookingRequest['priority']
  ) => Promise<void>;
  uploadDocuments: (requestId: string, documents: string[], profileImage?: string) => Promise<void>;
  getRequestById: (requestId: string) => BookingRequest | undefined;
}

// Initialize context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Initial mock data
const initialRequests: BookingRequest[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Student User',
    department: 'Computer Science',
    startDate: new Date(2023, 8, 1),
    endDate: new Date(2023, 11, 15),
    numberOfRooms: 1,
    spoc: {
      name: 'Dr. Sharma',
      email: 'sharma@bits.ac.in'
    },
    requestType: 'single',
    reason: 'Exchange program accommodation',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(2023, 7, 15),
  },
  {
    id: '2',
    userId: '1',
    userName: 'Student User',
    department: 'Computer Science',
    startDate: new Date(2023, 5, 10),
    endDate: new Date(2023, 6, 20),
    numberOfRooms: 2,
    spoc: {
      name: 'Dr. Patel',
      email: 'patel@bits.ac.in'
    },
    requestType: 'shared',
    reason: 'Summer internship accommodation',
    status: 'reception-approved',
    receptionNote: 'Rooms available for this period',
    priority: 'high',
    createdAt: new Date(2023, 4, 25),
  },
];

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialRequests);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalRooms: 100,
    availableRooms: 65,
    pendingRequests: 10,
    approvedRequests: 35,
  });

  // Filter user's requests
  const userRequests = user
    ? bookingRequests.filter(request => request.userId === user.id)
    : [];

  // Load from localStorage on component mount
  useEffect(() => {
    const storedRequests = localStorage.getItem('bookingRequests');
    const storedStats = localStorage.getItem('bookingStats');
    
    if (storedRequests) {
      // Parse dates correctly
      const parsedRequests = JSON.parse(storedRequests, (key, value) => {
        if (key === 'startDate' || key === 'endDate' || key === 'createdAt') {
          return new Date(value);
        }
        return value;
      });
      setBookingRequests(parsedRequests);
    }
    
    if (storedStats) {
      setBookingStats(JSON.parse(storedStats));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
    localStorage.setItem('bookingStats', JSON.stringify(bookingStats));
  }, [bookingRequests, bookingStats]);

  // Add a new booking request
  const addRequest = async (
    requestData: Omit<BookingRequest, 'id' | 'userId' | 'userName' | 'status' | 'createdAt'>
  ) => {
    if (!user) throw new Error('User must be logged in to create a request');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newRequest: BookingRequest = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      status: 'pending',
      createdAt: new Date(),
      ...requestData,
    };

    setBookingRequests(prev => [...prev, newRequest]);
    setBookingStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests + 1,
    }));

    return;
  };

  // Update request status
  const updateRequestStatus = async (
    requestId: string, 
    status: BookingRequest['status'], 
    note?: string,
    priority?: BookingRequest['priority']
  ) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setBookingRequests(prev => 
      prev.map(request => {
        if (request.id === requestId) {
          const updatedRequest = { ...request, status };
          
          // Update note based on role
          if (user?.role === 'reception') {
            updatedRequest.receptionNote = note || request.receptionNote;
          } else if (user?.role === 'admin') {
            updatedRequest.adminNote = note || request.adminNote;
          }
          
          // Update priority if provided
          if (priority) {
            updatedRequest.priority = priority;
          }
          
          return updatedRequest;
        }
        return request;
      })
    );

    // Update stats based on status change
    if (status === 'approved') {
      setBookingStats(prev => ({
        ...prev,
        availableRooms: prev.availableRooms - 1,
        pendingRequests: prev.pendingRequests - 1,
        approvedRequests: prev.approvedRequests + 1,
      }));
    }

    return;
  };

  // Upload documents
  const uploadDocuments = async (requestId: string, documents: string[], profileImage?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setBookingRequests(prev => 
      prev.map(request => 
        request.id === requestId
          ? { ...request, documents, ...(profileImage && { profileImage }) }
          : request
      )
    );

    return;
  };

  // Get request by ID
  const getRequestById = (requestId: string) => {
    return bookingRequests.find(request => request.id === requestId);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingRequests,
        userRequests,
        bookingStats,
        addRequest,
        updateRequestStatus,
        uploadDocuments,
        getRequestById,
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
