import { Link } from 'react-router';
import { ArrowRight, Wifi, Wind, Tv, Coffee, Shield, Star, Award, HeartHandshake, Compass } from 'lucide-react';

export default function Home() {
  return (
    <div className="font-sans bg-[#F8FAFC]">
      {/* Redesigned Premium Hero Section */}
      <div className="relative h-[650px] overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80"
            alt="Marian Hotel Luxury Exterior"
            className="w-full h-full object-cover opacity-35 scale-[1.02] transform transition-transform duration-[10000ms] hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10 w-full">
          <div className="text-white max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E73BE]/20 text-[#60A5FA] border border-[#1E73BE]/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Welcome to Student-Driven Luxury
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white">
              Experience Comfort <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
                &amp; Pure Convenience
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-xl">
              Discover exquisitely designed hotel spaces maintained with professional hospitality principles at Marian Hotel.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E73BE] text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-[#1E73BE]/30 hover:bg-[#155a96] hover:scale-105 active:scale-95 duration-200"
              >
                Browse Available Rooms
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/reservation"
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-xl border border-white/20 hover:border-white/30 backdrop-blur-md transition-all duration-200"
              >
                Book Your Stay
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Why Stay with <span style={{ color: '#1E73BE' }}>Marian Hotel</span>?
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            We combine premium accommodation amenities with warm hospitality, ensuring an unforgettable luxury stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Free High-Speed WiFi", desc: "Stay connected seamlessly with high-speed wireless internet inside every room.", icon: Wifi },
            { title: "Climate Control", desc: "Individually controlled modern split-type air conditioning units.", icon: Wind },
            { title: "HD Entertainment", desc: "Smart TVs pre-loaded with premium cable and streaming support.", icon: Tv },
            { title: "In-Room Delights", desc: "Enjoy mini-refrigerators, coffee makers, and snack assortments.", icon: Coffee },
            { title: "Double-Safe Security", desc: "24/7 lobby security presence alongside digital room safes.", icon: Shield },
            { title: "HMP Premium Service", desc: "Exceptional service standards operated by our skilled hospitality team.", icon: Star }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#E8F4FC' }}>
                <item.icon className="w-7 h-7" style={{ color: '#1E73BE' }} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Excellence Promo Banner */}
      <div className="bg-[#E8F4FC]/40 border-y border-[#1E73BE]/10 py-16 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#1E73BE]" />
                Hospitality Management Program Partnership
              </h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-3xl">
                Marian Hotel is the pride of St. Rita's College of Balingasag's Hospitality Management Program. Every reservation supports students in building direct industry competence under internationally benchmarked hotel operations standards.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border shadow-sm">
                <HeartHandshake className="w-5 h-5 text-[#1E73BE]" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">100% Student Crafted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Types Preview (Premium Redesign) */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Our Curated Room Classes
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Explore our 5 bespoke room categories built for guest-centric convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Standard', price: 56.74, capacity: '3-4 guests', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
              { name: 'Deluxe', price: 64.85, capacity: '4-5 guests', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
              { name: 'Sweet', price: 89.17, capacity: '5-6 guests', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
              { name: 'Executive', price: 145.91, capacity: '5 guests', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' },
              { name: 'Family', price: 162.13, capacity: '10 guests', image: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80' },
            ].map((room, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group">
                <div className="h-56 overflow-hidden relative bg-slate-100">
                  <img
                    src={room.image}
                    alt={`${room.name} Room`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/70 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                    {room.capacity}
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{room.name} Room</h3>
                    <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-4">Marian Accommodation</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                    <div>
                      <span className="text-2xl font-extrabold" style={{ color: '#1E73BE' }}>
                        ${room.price.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold"> / night</span>
                    </div>
                    <span className="text-xs font-bold text-[#1E73BE] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E73BE] text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl hover:bg-[#155a96] hover:scale-105 active:scale-95 duration-200"
            >
              View All Accommodations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
