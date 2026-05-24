import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { roomTypes, getLocalRooms } from '../data/rooms';

export default function RoomListing() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms/read.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          setRooms(getLocalRooms());
        }
      })
      .catch(err => {
        console.error("Error fetching rooms, using local storage:", err);
        setRooms(getLocalRooms());
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedRooms = {
    standard: rooms.filter(r => r.room_type === 'standard'),
    deluxe: rooms.filter(r => r.room_type === 'deluxe'),
    sweet: rooms.filter(r => r.room_type === 'sweet'),
    executive: rooms.filter(r => r.room_type === 'executive'),
    family: rooms.filter(r => r.room_type === 'family'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#1E73BE] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1E73BE' }}>
          Our Rooms
        </h1>
        <p className="text-xl text-gray-600">
          Choose from 25 beautifully appointed rooms across 5 categories
        </p>
      </div>

      {Object.entries(groupedRooms).map(([type, rooms]) => {
        const typeData = roomTypes[type as keyof typeof roomTypes];
        return (
          <div key={type} className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{typeData.name}s</h2>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {typeData.capacity}
                </span>
                <span className="text-2xl font-bold" style={{ color: '#1E73BE' }}>
                  ${typeData.price.toFixed(2)} <span className="text-lg font-normal text-gray-600">per night</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative h-56">
                    <img
                      src={room.image_url}
                      alt={`${typeData.name} ${room.room_number}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                        room.status === 'available' ? 'bg-emerald-500 text-white' :
                        room.status === 'occupied' ? 'bg-blue-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {room.status}
                      </span>
                      {room.is_reserved && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm bg-slate-800 text-white backdrop-blur-md">
                          Reserved Today
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                      <span className="font-semibold text-sm" style={{ color: '#1E73BE' }}>
                        Room {room.room_number}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">
                      {typeData.name} {room.room_number}
                    </h3>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Key Amenities:</p>
                      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        {room.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1E73BE' }}></div>
                            {amenity}
                          </li>
                        ))}
                      </ul>
                      {room.amenities.length > 4 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{room.amenities.length - 4} more amenities
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-semibold">{room.capacity}</p>
                      </div>
                      <Link
                        to={`/room/${room.room_type}/${room.room_number}`}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105"
                        style={{ backgroundColor: '#1E73BE' }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
