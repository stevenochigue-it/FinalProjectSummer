import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Users, Check, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { roomTypes, getLocalRooms } from '../data/rooms';

export default function RoomDetails() {
  const { type, number } = useParams<{ type: string; number: string }>();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const roomType = type as keyof typeof roomTypes;
  const typeData = roomTypes[roomType];

  useEffect(() => {
    fetch('/api/rooms/read.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(r => r.room_type === type && r.room_number.toString() === number);
          setRoom(found);
        } else {
          const localData = getLocalRooms();
          const found = localData.find(r => r.room_type === type && r.room_number.toString() === number);
          setRoom(found);
        }
      })
      .catch(err => {
        console.error("Error fetching room details, using local storage:", err);
        const localData = getLocalRooms();
        const found = localData.find(r => r.room_type === type && r.room_number.toString() === number);
        setRoom(found);
      })
      .finally(() => setLoading(false));
  }, [type, number]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#1E73BE] animate-spin" />
      </div>
    );
  }

  if (!room || !typeData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xl text-gray-600">Room not found</p>
        <Link to="/rooms" className="text-blue-600 hover:underline">
          Back to Rooms
        </Link>
      </div>
    );
  }

  const mainImage = room.image_url || 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=1080';

  return (
    <div>
      {/* Hero Image */}
      <div className="relative h-[500px] bg-gray-900">
        <img
          src={mainImage}
          alt={`${typeData.name} ${number}`}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-white mb-4 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Rooms
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {typeData.name} {number}
            </h1>
            <div className="flex items-center gap-4 text-white">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {room.capacity}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                room.status === 'available' ? 'bg-emerald-500' :
                room.status === 'occupied' ? 'bg-blue-500' :
                'bg-amber-500'
              }`}>
                {room.status}
              </span>
              {room.is_reserved && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800/80 backdrop-blur-md">
                  Reserved Today
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#1E73BE' }}>
                Room Overview
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to our {room.room_type.toLowerCase()}, thoughtfully designed to provide you with
                exceptional comfort and convenience. This room accommodates {room.capacity.toLowerCase()},
                making it perfect for {
                  room.room_type === 'family' ? 'large families or groups' :
                  room.room_type === 'executive' ? 'business travelers or couples' :
                  room.room_type === 'sweet' ? 'small families or friends' :
                  room.room_type === 'deluxe' ? 'couples or small families' :
                  'solo travelers or couples'
                }.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E73BE' }}>
                Room Amenities
              </h2>
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(room.amenities || []).map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F4FC' }}>
                          <Check className="w-4 h-4" style={{ color: '#1E73BE' }} />
                        </div>
                      </div>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Features by Type */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E73BE' }}>
                What Makes This Room Special
              </h3>
              <div className="space-y-3 text-gray-700">
                {roomType === 'standard' && (
                  <>
                    <p>• Perfect for budget-conscious travelers who don't want to compromise on comfort</p>
                    <p>• Cozy atmosphere with all essential amenities for a pleasant stay</p>
                    <p>• Ideal for short stays or business trips</p>
                  </>
                )}
                {roomType === 'deluxe' && (
                  <>
                    <p>• Enhanced comfort with a larger bed and additional workspace</p>
                    <p>• Mini refrigerator for storing snacks and beverages</p>
                    <p>• Perfect balance of luxury and value</p>
                  </>
                )}
                {roomType === 'sweet' && (
                  <>
                    <p>• Spacious layout with a separate living area for relaxation</p>
                    <p>• Private balcony with scenic views</p>
                    <p>• Coffee maker for your morning brew</p>
                  </>
                )}
                {roomType === 'executive' && (
                  <>
                    <p>• Premium king-size bed for ultimate comfort</p>
                    <p>• Smart TV with streaming capabilities</p>
                    <p>• In-room safe for valuables and premium toiletries</p>
                  </>
                )}
                {roomType === 'family' && (
                  <>
                    <p>• Spacious accommodations with two beds (Queen + Double)</p>
                    <p>• Full dining area and microwave for family meals</p>
                    <p>• Ample storage space for extended stays</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Price per night</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold" style={{ color: '#1E73BE' }}>
                    ${parseFloat(room.price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Guest Capacity</span>
                  <span className="font-semibold">{room.capacity}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Room Number</span>
                  <span className="font-semibold">#{number}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Manual Status</span>
                  <span className={`font-bold capitalize ${
                    room.status === 'available' ? 'text-emerald-600' : 
                    room.status === 'occupied' ? 'text-blue-600' : 
                    'text-amber-600'
                  }`}>
                    {room.status}
                  </span>
                </div>
                {room.is_reserved && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reservation</span>
                    <span className="font-bold text-slate-900 uppercase text-xs bg-slate-100 px-2 py-1 rounded">Reserved Today</span>
                  </div>
                )}
              </div>

              {!room.is_reserved && room.status === 'available' ? (
                <Link
                  to={`/reservation?room=${roomType}-${number}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                  style={{ backgroundColor: '#1E73BE' }}
                >
                  <Calendar className="w-5 h-5" />
                  Check Availability
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white rounded-xl opacity-50 cursor-not-allowed bg-gray-400"
                >
                  {room.is_reserved ? 'Currently Reserved' : room.status === 'maintenance' ? 'Under Maintenance' : 'Room Not Available'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">This room includes:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: '#1E73BE' }} />
                    Free cancellation (24h notice)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: '#1E73BE' }} />
                    Complimentary breakfast
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: '#1E73BE' }} />
                    24/7 room service
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
