
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-academic text-white mt-auto py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="font-serif text-academic text-lg font-bold">B</span>
              </div>
              <span className="font-serif text-white text-xl font-semibold">BITS Hostel</span>
            </div>
            <p className="text-academic-light/80 text-sm max-w-xs">
              BITS Pilani provides premium hostel accommodations for students, faculty, and academic visitors.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-academic-light/80 hover:text-white text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-academic-light/80 hover:text-white text-sm transition-colors">About</Link>
              </li>
              <li>
                <Link to="/facilities" className="text-academic-light/80 hover:text-white text-sm transition-colors">Facilities</Link>
              </li>
              <li>
                <Link to="/contact" className="text-academic-light/80 hover:text-white text-sm transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-academic-light shrink-0 mt-0.5" />
                <span className="text-academic-light/80">BITS Pilani, Vidya Vihar Campus, Pilani, Rajasthan 333031</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-academic-light shrink-0" />
                <span className="text-academic-light/80">+91 1596 242090</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-academic-light shrink-0" />
                <span className="text-academic-light/80">hostel@bitspilani.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-academic-light/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-academic-light/60 text-sm">
            © {currentYear} BITS Pilani. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <a href="#" className="text-academic-light/60 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-academic-light/60 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
