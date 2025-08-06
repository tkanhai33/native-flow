import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Clock, MapPin, Wrench, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function MyAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      toast({
        title: "Error loading appointments",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirmed':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Appointments</h1>
          <p className="text-xl text-muted-foreground">
            Track and manage your service appointments
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center mb-8">
          <Button asChild>
            <a href="/book-appointment">Book New Appointment</a>
          </Button>
        </div>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Wrench className="h-5 w-5" />
                        <span>{appointment.service_type}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.preferred_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.preferred_time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={getStatusBadgeVariant(appointment.status)}
                      className={`capitalize ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.email}</span>
                      </div>
                    </div>
                    {appointment.description && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Description:</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    Requested on: {new Date(appointment.created_at).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-4">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">No appointments yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't booked any appointments yet. Book your first appointment to get started.
              </p>
              <Button asChild>
                <a href="/book-appointment">Book Your First Appointment</a>
              </Button>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <Card className="mt-12 border-primary">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-primary">Need Emergency Service?</h3>
              <p className="text-muted-foreground">
                For urgent plumbing issues that can't wait, call our 24/7 emergency line
              </p>
              <Button variant="destructive" asChild>
                <a href="tel:+16041234567">Call Emergency Line: (604) 123-4567</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}