import { Outlet, Link, useLocation } from 'react-router';
import { Hotel, Home, Bed, Calendar, Phone, HelpCircle } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Hotel className="w-8 h-8" style={{ color: '#1E73BE' }} />
              <span className="text-2xl font-semibold" style={{ color: '#1E73BE' }}>Marian Hotel</span>
            </Link>

            <nav className="flex gap-4 sm:gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/') && location.pathname === '/' ? { backgroundColor: '#1E73BE' } : {}}
              >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline">Home</span>
              </Link>
              <Link
                to="/rooms"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/rooms') || isActive('/room')
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/rooms') || isActive('/room') ? { backgroundColor: '#1E73BE' } : {}}
              >
                <Bed className="w-5 h-5" />
                <span>Rooms</span>
              </Link>
              <Link
                to="/reservation"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/reservation')
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/reservation') ? { backgroundColor: '#1E73BE' } : {}}
              >
                <Calendar className="w-5 h-5" />
                <span>Reservation</span>
              </Link>
              <Link
                to="/contact"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/contact')
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/contact') ? { backgroundColor: '#1E73BE' } : {}}
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">Contact</span>
              </Link>
              <Link
                to="/help"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/help')
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/help') ? { backgroundColor: '#1E73BE' } : {}}
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="w-6 h-6" />
                <span className="text-xl font-semibold">Marian Hotel</span>
              </div>
              <p className="text-gray-400">Experience Comfort & Convenience</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/rooms" className="hover:text-white transition-colors">Rooms</Link></li>
                <li><Link to="/reservation" className="hover:text-white transition-colors">Reservation</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: +1 (555) 123-4567</li>
                <li>Email: info@marianhotel.com</li>
                <li>Address: St. Rita's College of Balingasag Balingasag, Misamis Oriental 9005 Philippines</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Marian Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
