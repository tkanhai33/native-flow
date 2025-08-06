import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    'Emergency Repair',
    'Water Heater Repair',
    'Water Heater Installation',
    'Drain Cleaning',
    'Pipe Repair',
    'Pipe Installation',
    'Heating System Repair',
    'Heating System Installation',
    'Bathroom Renovation',
    'Kitchen Plumbing',
    'Leak Detection',
    'General Plumbing',
    'Other'
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        user_id: user?.id || null
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      toast({
        title: "Appointment booked successfully!",
        description: "We'll contact you within 24 hours to confirm your appointment.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        description: ''
      });

      // Navigate to appointments page if user is logged in
      if (user) {
        navigate('/my-appointments');
      }
    } catch (error) {
      toast({
        title: "Error booking appointment",
        description: "Please try again later or call us directly",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Schedule your plumbing or heating service with Native Flow
          </p>
        </div>

        {/* Quick Contact for Emergencies */}
        <Card className="mb-8 border-destructive bg-destructive/5">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-destructive">Emergency Service?</h3>
              <p className="text-sm text-muted-foreground">
                For urgent plumbing issues, call us immediately for 24/7 emergency service
              </p>
              <Button variant="destructive" asChild>
                <a href="tel:+16041234567">Call Emergency Line: (604) 123-4567</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Your Service</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Contact Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(604) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Service Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Complete address where service is needed"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="service_type">Type of Service *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => handleSelectChange('service_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of service needed" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please describe the issue or service needed in detail..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Preferred Schedule</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Date *</Label>
                    <Input
                      id="preferred_date"
                      name="preferred_date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={handleInputChange}
                      required
                      min={getTomorrowDate()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_time">Preferred Time *</Label>
                    <Select
                      value={formData.preferred_time}
                      onValueChange={(value) => handleSelectChange('preferred_time', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  * We'll contact you to confirm your appointment time based on availability
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Booking Appointment...' : 'Book Appointment'}
              </Button>
            </form>

            {!user && (
              <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Want to track your appointments? 
                  <a href="/auth" className="text-primary hover:underline ml-1">
                    Create an account
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}