import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1E73BE' }}>
          Contact Us
        </h1>
        <p className="text-xl text-gray-600">
          Get in touch with Marian Hotel - We're here to help
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#1E73BE' }}>
            Get In Touch
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F4FC' }}>
                <Phone className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 mb-1">+1 (555) 123-4567</p>
                <p className="text-gray-600">+1 (555) 123-4568 (Reservations)</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F4FC' }}>
                <Mail className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-gray-600 mb-1">info@marianhotel.com</p>
                <p className="text-gray-600">reservations@marianhotel.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F4FC' }}>
                <MapPin className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-gray-600">St. Rita's College of Balingasag</p>
                <p className="text-gray-600">Balingasag, Misamis Oriental 9005</p>
                <p className="text-gray-600">Philippines</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F4FC' }}>
                <Clock className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Front Desk Hours</h3>
                <p className="text-gray-600">24/7 - We're always here for you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E73BE' }}>
              Send Us a Message
            </h2>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all">
                  <option>General Inquiry</option>
                  <option>Reservation Question</option>
                  <option>Special Request</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 text-lg font-semibold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: '#1E73BE' }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
