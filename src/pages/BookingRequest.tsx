
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import FadeIn from '@/components/animations/FadeIn';
import BlurredCard from '@/components/ui/BlurredCard';

// Define the departments array
const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Management',
  'Humanities & Social Sciences',
  'Economics & Finance'
];

// Booking request form schema
const bookingFormSchema = z.object({
  requestType: z.string().min(2, { message: "Request type is required" }),
  department: z.string().min(2, { message: "Department is required" }),
  numberOfRooms: z.number().min(1, { message: "At least 1 room is required" }).max(50, { message: "Maximum 50 rooms allowed" }),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(10, { message: "Please provide a detailed reason for booking" }),
  spocName: z.string().min(2, { message: "SPOC name is required" }),
  spocEmail: z.string().email({ message: "Please enter a valid email address" }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBookingRequest } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      requestType: '',
      department: user?.department || '',
      numberOfRooms: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      reason: '',
      spocName: user?.name || '',
      spocEmail: user?.email || '',
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    try {
      setIsSubmitting(true);
      
      const requestId = await createBookingRequest({
        requestType: values.requestType,
        department: values.department,
        numberOfRooms: values.numberOfRooms,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
        spoc: {
          name: values.spocName,
          email: values.spocEmail
        }
      });
      
      toast({
        title: "Booking Request Submitted",
        description: "Your request has been successfully submitted.",
      });
      
      navigate(`/document-upload/${requestId}`);
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-2">
              New Hostel Booking Request
            </h1>
            <p className="text-academic-text/70">
              Please fill in the details below to submit your hostel accommodation request.
            </p>
          </div>

          <BlurredCard>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Request Type */}
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single Occupancy</SelectItem>
                          <SelectItem value="shared">Shared Occupancy</SelectItem>
                          <SelectItem value="family">Family Accommodation</SelectItem>
                          <SelectItem value="guest">Guest Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of accommodation required.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The academic department organizing or sponsoring this stay.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < (form.getValues().startDate || new Date())}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Number of Rooms */}
                <FormField
                  control={form.control}
                  name="numberOfRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Rooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          className="bg-white/50"
                        />
                      </FormControl>
                      <FormDescription>
                        How many rooms do you need? Maximum 10 per request.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SPOC Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="spocName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Department contact person" {...field} className="bg-white/50" />
                        </FormControl>
                        <FormDescription>
                          Single Point of Contact person for this booking.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spocEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@department.edu" {...field} className="bg-white/50" />
                        </FormControl>
                        <FormDescription>
                          Email of the department contact person.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Reason for Booking */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Booking</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about why you need this accommodation..."
                          className="resize-none h-32 bg-white/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the academic purpose of this accommodation request.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/student')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-academic hover:bg-academic/90 btn-transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </BlurredCard>
        </div>
      </FadeIn>
    </div>
  );
};

export default BookingRequest;
