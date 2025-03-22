
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          department: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: string;
          department?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          department?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_requests: {
        Row: {
          id: string;
          user_id: string;
          request_type: string;
          department: string;
          number_of_rooms: number;
          start_date: string;
          end_date: string;
          reason: string;
          status: string;
          spoc_name: string;
          spoc_email: string;
          reception_note: string | null;
          admin_note: string | null;
          priority: number | null;
          documents: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: string;
          department: string;
          number_of_rooms: number;
          start_date: string;
          end_date: string;
          reason: string;
          status?: string;
          spoc_name: string;
          spoc_email: string;
          reception_note?: string | null;
          admin_note?: string | null;
          priority?: number | null;
          documents?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_type?: string;
          department?: string;
          number_of_rooms?: number;
          start_date?: string;
          end_date?: string;
          reason?: string;
          status?: string;
          spoc_name?: string;
          spoc_email?: string;
          reception_note?: string | null;
          admin_note?: string | null;
          priority?: number | null;
          documents?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      room_inventory: {
        Row: {
          id: string;
          total_rooms: number;
          available_rooms: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          total_rooms: number;
          available_rooms: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          total_rooms?: number;
          available_rooms?: number;
          last_updated?: string;
        };
      };
    };
  };
};

// Export booking request type for easier use in components
export interface BookingRequest {
  id: string;
  requestType: string;
  department: string;
  numberOfRooms: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  spoc: {
    name: string;
    email: string;
  };
  receptionNote?: string;
  adminNote?: string;
  priority?: number;
  documents?: string;
  createdAt: Date;
  updatedAt: Date;
}
