import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { Calendar, MapPin, Clock, Users, Search, Plus, DollarSign, Globe, Mail, Phone } from "lucide-react";
import type { Event } from "@shared/schema";

// Form schema for creating events
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be 2000 characters or less"),
  location: z.string().min(1, "Location is required").max(200, "Location must be 200 characters or less"),
  eventDate: z.string().min(1, "Event date is required"),
  endDate: z.string().optional(),
  price: z.string().optional(),
  maxAttendees: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    select: (data: Event[]) => data || [],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const eventData = {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        website: data.website || null,
        endDate: data.endDate || null,
      };
      
      return apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  // Form setup
  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      eventDate: "",
      endDate: "",
      price: "",
      maxAttendees: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      tags: "",
      status: "published",
    },
  });

  // Filter events based on search and status
  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch = searchTerm === "" || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group events by date for calendar view
  const groupedEvents = filteredEvents.reduce((acc: { [key: string]: Event[] }, event) => {
    const dateKey = format(new Date(event.eventDate), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  const onSubmit = (data: CreateEventFormData) => {
    createEventMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <div style={{flex: 1, backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2" data-testid="events-title">
                Oddities Events
              </h1>
              <p className="text-xl text-foreground/70" data-testid="events-subtitle">
                Discover and host gatherings for collectors and enthusiasts
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-700 hover:bg-red-800 text-white"
                  data-testid="button-create-event"
                >
                  <Plus className="mr-2" size={16} />
                  Host Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter event title" data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe your event, what attendees can expect, what to bring, etc."
                              className="min-h-[100px]"
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Event venue or address" data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date & Time *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="datetime-local" 
                                data-testid="input-event-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date & Time</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="datetime-local"
                                data-testid="input-end-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                data-testid="input-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxAttendees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Attendees</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="Unlimited"
                                data-testid="input-max-attendees"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contact@example.com" data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-contact-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com" data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma-separated)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="taxidermy, specimens, victorian, antiques"
                              data-testid="input-tags"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createEventMutation.isPending}
                        className="bg-red-700 hover:bg-red-800"
                        data-testid="button-submit"
                      >
                        {createEventMutation.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search events by title, description, location, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar View */}
          <div className="space-y-8" data-testid="events-calendar">
            {sortedDates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to host an oddities event!"
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-red-700 hover:bg-red-800"
                      data-testid="button-create-first-event"
                    >
                      <Plus className="mr-2" size={16} />
                      Host the First Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-red-600" size={24} />
                    <h2 className="text-2xl font-serif font-bold" data-testid={`date-header-${date}`}>
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </h2>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  <div className="grid gap-6">
                    {groupedEvents[date].map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-serif font-bold mb-2" data-testid={`event-title-${event.id}`}>
                                  {event.title}
                                </h3>
                                <Badge 
                                  variant={event.status === 'published' ? 'default' : 'secondary'}
                                  data-testid={`event-status-${event.id}`}
                                >
                                  {event.status}
                                </Badge>
                              </div>
                              
                              <p className="text-foreground/80 mb-4" data-testid={`event-description-${event.id}`}>
                                {event.description}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/70">
                                <div className="flex items-center space-x-2">
                                  <MapPin size={16} className="text-red-600" />
                                  <span data-testid={`event-location-${event.id}`}>{event.location}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock size={16} className="text-red-600" />
                                  <span data-testid={`event-time-${event.id}`}>
                                    {format(new Date(event.eventDate), "h:mm a")}
                                    {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                                  </span>
                                </div>
                                
                                {event.price && (
                                  <div className="flex items-center space-x-2">
                                    <DollarSign size={16} className="text-red-600" />
                                    <span data-testid={`event-price-${event.id}`}>${parseFloat(event.price).toFixed(2)}</span>
                                  </div>
                                )}
                                
                                {event.maxAttendees && (
                                  <div className="flex items-center space-x-2">
                                    <Users size={16} className="text-red-600" />
                                    <span data-testid={`event-attendees-${event.id}`}>
                                      {event.currentAttendees || 0} / {event.maxAttendees}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {event.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs" data-testid={`event-tag-${event.id}-${index}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {/* Contact Information */}
                              {(event.contactEmail || event.contactPhone || event.website) && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {event.contactEmail && (
                                      <div className="flex items-center space-x-2">
                                        <Mail size={14} className="text-red-600" />
                                        <a 
                                          href={`mailto:${event.contactEmail}`} 
                                          className="hover:text-red-600 transition-colors"
                                          data-testid={`event-email-${event.id}`}
                                        >
                                          {event.contactEmail}
                                        </a>
                                      </div>
                                    )}
                                    {event.contactPhone && (
                                      <div className="flex items-center space-x-2">
                                        <Phone size={14} className="text-red-600" />
                                        <a 
                                          href={`tel:${event.contactPhone}`} 
                                          className="hover:text-red-600 transition-colors"
                                          data-testid={`event-phone-${event.id}`}
                                        >
                                          {event.contactPhone}
                                        </a>
                                      </div>
                                    )}
                                    {event.website && (
                                      <div className="flex items-center space-x-2">
                                        <Globe size={14} className="text-red-600" />
                                        <a 
                                          href={event.website} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="hover:text-red-600 transition-colors"
                                          data-testid={`event-website-${event.id}`}
                                        >
                                          Visit Website
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}