import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Phone, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to submit a support request.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          category: formData.category || 'general',
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Your support request has been submitted. We'll respond within 24 hours.",
      });

      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (error) {
      console.error('Support request error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7 Available",
      action: "Start Chat",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24 hours",
      action: "Send Email",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Fri 9AM-6PM EST",
      action: "+1 (555) 123-4567",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/support" 
              className="inline-flex items-center mb-4 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Support
            </Link>
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Contact Support
            </h1>
            <p className="text-muted-foreground">
              Get in touch with our support team. We're here to help you succeed on FIVESOM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-6 text-foreground">
                How would you like to contact us?
              </h2>
              
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center flex-shrink-0`}>
                          <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-foreground">
                            {method.title}
                          </h3>
                          <p className="text-sm mb-2 text-muted-foreground">
                            {method.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs flex items-center text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {method.availability}
                            </span>
                            <span className="text-xs text-primary font-medium">
                              {method.action}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Resources */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Quick Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/support/help-center">
                    <Button variant="outline" className="w-full justify-start">
                      Help Center
                    </Button>
                  </Link>
                  <Link to="/support/trust-safety">
                    <Button variant="outline" className="w-full justify-start">
                      Trust & Safety
                    </Button>
                  </Link>
                  <Link to="/support/community">
                    <Button variant="outline" className="w-full justify-start">
                      Community Forum
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Send us a message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Question</SelectItem>
                            <SelectItem value="account">Account Issues</SelectItem>
                            <SelectItem value="payment">Payment Problems</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="safety">Safety Concerns</SelectItem>
                            <SelectItem value="billing">Billing Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Please provide as much detail as possible about your issue or question..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
