
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BlurredCard from '@/components/ui/BlurredCard';
import FadeIn from '@/components/animations/FadeIn';
import { BookOpen, Building, CheckCircle, Coffee, LogIn, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  // Hero image - BITS Pilani Rotunda
  const rotundaImage = 'https://www.bits-pilani.ac.in/Uploads/University/Pilani/Content/20220214022953-BITS_Pilani_Pilani_Campus_.jpg';

  // Features list
  const features = [
    {
      icon: Building,
      title: 'Quality Accommodations',
      description: 'Modern rooms with essential amenities for a comfortable academic stay.',
    },
    {
      icon: Users,
      title: 'Academic Community',
      description: 'Live among peers in a scholarly environment conducive to learning.',
    },
    {
      icon: Coffee,
      title: 'Campus Facilities',
      description: 'Access to campus dining, libraries, and recreational facilities.',
    },
    {
      icon: MapPin,
      title: 'Prime Location',
      description: 'Located in the heart of the academic campus with easy access to departments.',
    },
  ];

  // Stats
  const stats = [
    { value: '1000+', label: 'Rooms' },
    { value: '5,000+', label: 'Students Accommodated Yearly' },
    { value: '24/7', label: 'Support Services' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "The hostel booking process was seamless, and the accommodation perfectly met my academic needs during my visiting professorship.",
      author: "Dr. Rajesh Kumar",
      role: "Visiting Professor, IIT Delhi",
    },
    {
      quote: "As an international student, I found the BITS hostel facilities to be exceptional and the booking system streamlined the entire process.",
      author: "Maria Chen",
      role: "Exchange Student, MIT",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-academic bg-opacity-50 backdrop-blur-sm"></div>
          <img 
            src={rotundaImage} 
            alt="BITS Pilani Rotunda" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn delay={200} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4">
              BITS Pilani Academic Hostel Booking
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-xl">
              Secure comfortable accommodation for academic visits, exchanges, and student housing with our streamlined booking system.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-academic-gold text-academic hover:bg-academic-gold/90 btn-transition">
                  <Link to={
                    user?.role === 'student' ? "/student" :
                    user?.role === 'reception' ? "/reception" :
                    user?.role === 'admin' ? "/admin" : "/"
                  }>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-academic hover:bg-white/90 btn-transition">
                    <Link to="/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 btn-transition">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-4">
                Academic Accommodation Excellence
              </h2>
              <p className="text-academic-text/70 text-lg">
                Designed specifically for academic needs, our hostel facilities provide the perfect environment for scholarly pursuits.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FadeIn key={index} delay={200 + index * 100}>
                <BlurredCard hoverEffect glowEffect className="h-full">
                  <feature.icon className="h-12 w-12 text-academic-light mb-4" />
                  <h3 className="text-xl font-serif font-semibold text-academic mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-academic-text/70">
                    {feature.description}
                  </p>
                </BlurredCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-academic">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={150 * index}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                    {stat.value}
                  </p>
                  <p className="text-academic-light/80 uppercase tracking-wider text-sm">
                    {stat.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-academic-bg">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-4">
                Simple Booking Process
              </h2>
              <p className="text-academic-text/70 text-lg">
                Our streamlined approval system ensures that your accommodation requests are processed efficiently.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FadeIn delay={200}>
              <div className="relative">
                <div className="absolute -right-4 top-12 hidden md:block z-10">
                  <div className="w-8 h-0.5 bg-academic-light"></div>
                </div>
                <BlurredCard className="relative h-full">
                  <div className="bg-academic-light/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="h-6 w-6 text-academic" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-academic mb-3">1. Submit Request</h3>
                  <p className="text-academic-text/70">
                    Fill out the booking request form with your accommodation details and academic purpose.
                  </p>
                </BlurredCard>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="relative">
                <div className="absolute -right-4 top-12 hidden md:block z-10">
                  <div className="w-8 h-0.5 bg-academic-light"></div>
                </div>
                <BlurredCard className="relative h-full">
                  <div className="bg-academic-light/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-6 w-6 text-academic" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-academic mb-3">2. Reception Review</h3>
                  <p className="text-academic-text/70">
                    Hostel reception staff reviews your request and checks room availability.
                  </p>
                </BlurredCard>
              </div>
            </FadeIn>

            <FadeIn delay={600}>
              <BlurredCard className="h-full">
                <div className="bg-academic-light/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-academic" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-academic mb-3">3. Final Approval</h3>
                <p className="text-academic-text/70">
                  Administration approves the request and you receive confirmation for your stay.
                </p>
              </BlurredCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-academic mb-4">
                What Academics Say
              </h2>
              <p className="text-academic-text/70 text-lg">
                Feedback from scholars and students who have used our accommodation services.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={index} delay={200 + index * 200}>
                <BlurredCard className="h-full">
                  <div className="mb-6">
                    <svg className="h-8 w-8 text-academic-light/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-academic-text/80 text-lg italic mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-medium text-academic">{testimonial.author}</p>
                    <p className="text-academic-text/60 text-sm">{testimonial.role}</p>
                  </div>
                </BlurredCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-academic">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Ready to Book Your Academic Accommodation?
            </h2>
            <p className="text-academic-light/80 text-lg max-w-2xl mx-auto mb-8">
              Login to your account to start the booking process or contact us for more information.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-academic hover:bg-white/90 btn-transition">
                <Link to="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login to Begin
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 btn-transition">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Index;
