import { Link } from 'react-router';
import { ArrowRight, Wifi, Wind, Tv, Coffee, Shield, Star } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1776763255122-3d35e32aee64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Hotel Room"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Experience Comfort & Convenience
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover luxury accommodations designed for your perfect stay at Marian Hotel
            </p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: '#1E73BE' }}
            >
              Browse Rooms
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#1E73BE' }}>
            Why Choose Marian Hotel?
          </h2>
          <p className="text-xl text-gray-600">
            Premium amenities and exceptional service for an unforgettable experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Wifi className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Free High-Speed WiFi</h3>
            <p className="text-gray-600">Stay connected with complimentary high-speed internet throughout your stay</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Wind className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Climate Control</h3>
            <p className="text-gray-600">Individual air conditioning for your optimal comfort in every room</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Tv className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Entertainment</h3>
            <p className="text-gray-600">Smart TVs with premium channels and streaming services</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Coffee className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">In-Room Amenities</h3>
            <p className="text-gray-600">Mini refrigerator, coffee maker, and more in select rooms</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Shield className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
            <p className="text-gray-600">24/7 security and in-room safes for your peace of mind</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F4FC' }}>
              <Star className="w-8 h-8" style={{ color: '#1E73BE' }} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Premium Service</h3>
            <p className="text-gray-600">Dedicated staff committed to making your stay exceptional</p>
          </div>
        </div>
      </div>

      {/* Room Types Preview */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1E73BE' }}>
              Our Room Categories
            </h2>
            <p className="text-xl text-gray-600">
              From cozy standard rooms to spacious family suites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Standard', price: 56.74, capacity: '3-4', image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=1080' },
              { name: 'Deluxe', price: 64.85, capacity: '4-5', image: 'https://images.unsplash.com/photo-1776763255122-3d35e32aee64?q=80&w=1080' },
              { name: 'Sweet', price: 89.17, capacity: '5-6', image: 'https://images.unsplash.com/photo-1776763255197-495b343d5a33?q=80&w=1080' },
              { name: 'Executive', price: 145.91, capacity: '5', image: 'https://images.unsplash.com/photo-1777170191230-3f357b815483?q=80&w=1080' },
              { name: 'Family', price: 162.13, capacity: '10', image: 'https://images.unsplash.com/photo-1776761363365-ad83248b93df?q=80&w=1080' },
            ].map((room, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={room.image}
                  alt={`${room.name} Room`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{room.name} Room</h3>
                  <p className="text-gray-600 mb-3">Capacity: {room.capacity} guests</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold" style={{ color: '#1E73BE' }}>
                      ${room.price}
                    </span>
                    <span className="text-gray-500">per night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: '#1E73BE' }}
            >
              View All Rooms
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
