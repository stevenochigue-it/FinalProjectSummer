import { Outlet, Link, useLocation } from 'react-router';
import { Home, Bed, Calendar, Phone, HelpCircle } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Premium Glassmorphic Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group hover:opacity-95 transition-opacity">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E73BE]/20 shadow-md group-hover:border-[#1E73BE] transition-colors bg-white flex items-center justify-center">
                <img src="/logo.jpg" alt="Marian Hotel Logo" className="w-full h-full object-cover scale-[1.05]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-0.5">Marian Hotel</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">HMP SRCB</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-[#1E73BE] text-white shadow-md shadow-[#1E73BE]/25'
                    : 'text-slate-600 hover:text-[#1E73BE] hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Home</span>
              </Link>
              <Link
                to="/rooms"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/rooms') || isActive('/room')
                    ? 'bg-[#1E73BE] text-white shadow-md shadow-[#1E73BE]/25'
                    : 'text-slate-600 hover:text-[#1E73BE] hover:bg-slate-50'
                }`}
              >
                <Bed className="w-4 h-4" />
                <span>Rooms</span>
              </Link>
              <Link
                to="/reservation"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/reservation')
                    ? 'bg-[#1E73BE] text-white shadow-md shadow-[#1E73BE]/25'
                    : 'text-slate-600 hover:text-[#1E73BE] hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Reservation</span>
              </Link>
              <Link
                to="/contact"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/contact')
                    ? 'bg-[#1E73BE] text-white shadow-md shadow-[#1E73BE]/25'
                    : 'text-slate-600 hover:text-[#1E73BE] hover:bg-slate-50'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </Link>
              <Link
                to="/help"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/help')
                    ? 'bg-[#1E73BE] text-white shadow-md shadow-[#1E73BE]/25'
                    : 'text-slate-600 hover:text-[#1E73BE] hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-white flex items-center justify-center">
                  <img src="/logo.jpg" alt="Marian Hotel Logo" className="w-full h-full object-cover scale-[1.05]" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">Marian Hotel</span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wide">HOSPITALITY MANAGEMENT PROGRAM</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Experience unparalleled comfort and student-driven excellence at our premier educational hotel setup.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="hover:text-[#1E73BE] transition-colors">Home</Link></li>
                <li><Link to="/rooms" className="hover:text-[#1E73BE] transition-colors">Rooms & Suites</Link></li>
                <li><Link to="/reservation" className="hover:text-[#1E73BE] transition-colors">Book a Stay</Link></li>
                <li><Link to="/contact" className="hover:text-[#1E73BE] transition-colors">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-[#1E73BE] transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Info</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <span className="font-semibold text-slate-300 block mb-0.5">Phone Support:</span>
                  +1 (555) 123-4567
                </li>
                <li>
                  <span className="font-semibold text-slate-300 block mb-0.5">Email Inquiries:</span>
                  info@marianhotel.com
                </li>
                <li>
                  <span className="font-semibold text-slate-300 block mb-0.5">Location:</span>
                  St. Rita's College of Balingasag Balingasag, Misamis Oriental 9005 Philippines
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>&copy; 2026 Marian Hotel. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-[#1E73BE] transition-colors">Terms of Service</Link>
              <span className="text-slate-700">|</span>
              <Link to="/privacy" className="hover:text-[#1E73BE] transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
