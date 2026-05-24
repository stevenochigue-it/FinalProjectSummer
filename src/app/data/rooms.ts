export interface Room {
  id: number;
  room_number: number | string;
  room_type: 'standard' | 'deluxe' | 'sweet' | 'executive' | 'family';
  price: number;
  capacity: string;
  status: 'available' | 'occupied' | 'maintenance';
  is_reserved: boolean;
  image_url: string;
  amenities: string[];
}

export interface Booking {
  id: number;
  room_id: number;
  room_number: string | number;
  room_type: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
}

// 100% Aligned with room_categories in schema_final.sql (Heuristic #4)
export const roomTypes = {
  standard: {
    name: 'Standard Room',
    price: 56.74,
    capacity: '3-4 guests',
    image_url: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4',
    amenities: ['Free WiFi', 'Air Conditioning', 'Hot & Cold Shower', 'TV', 'Complimentary Water']
  },
  deluxe: {
    name: 'Deluxe Room',
    price: 64.85,
    capacity: '4-5 guests',
    image_url: 'https://images.unsplash.com/photo-1776763255122-3d35e32aee64',
    amenities: ['Free WiFi', 'Air Conditioning', 'Hot & Cold Shower', 'Mini Refrigerator', 'Work Desk']
  },
  sweet: {
    name: 'Sweet Room',
    price: 89.17,
    capacity: '5-6 guests',
    image_url: 'https://images.unsplash.com/photo-1776763255197-495b343d5a33',
    amenities: ['Free WiFi', 'Air Conditioning', 'Hot & Cold Shower', 'Coffee Maker', 'Balcony View']
  },
  executive: {
    name: 'Executive Room',
    price: 145.91,
    capacity: '5 guests',
    image_url: 'https://images.unsplash.com/photo-1777170191230-3f357b815483',
    amenities: ['King-size Bed', 'Smart TV', 'In-room Safe', 'Premium Toiletries']
  },
  family: {
    name: 'Family Room',
    price: 162.13,
    capacity: '10 guests',
    image_url: 'https://images.unsplash.com/photo-1776761363365-ad83248b93df',
    amenities: ['Dining Table', 'Microwave', 'Extra Storage Space', '2 Beds']
  }
};

// Generate initial 25 rooms matching the database rooms inserts (Heuristic #4)
export const initialRooms: Room[] = [
  // Standard (101-105)
  { id: 1, room_number: 101, room_type: 'standard', price: 56.74, capacity: '3-4 guests', status: 'available', is_reserved: false, image_url: roomTypes.standard.image_url, amenities: roomTypes.standard.amenities },
  { id: 2, room_number: 102, room_type: 'standard', price: 56.74, capacity: '3-4 guests', status: 'available', is_reserved: false, image_url: roomTypes.standard.image_url, amenities: roomTypes.standard.amenities },
  { id: 3, room_number: 103, room_type: 'standard', price: 56.74, capacity: '3-4 guests', status: 'available', is_reserved: false, image_url: roomTypes.standard.image_url, amenities: roomTypes.standard.amenities },
  { id: 4, room_number: 104, room_type: 'standard', price: 56.74, capacity: '3-4 guests', status: 'available', is_reserved: false, image_url: roomTypes.standard.image_url, amenities: roomTypes.standard.amenities },
  { id: 5, room_number: 105, room_type: 'standard', price: 56.74, capacity: '3-4 guests', status: 'available', is_reserved: false, image_url: roomTypes.standard.image_url, amenities: roomTypes.standard.amenities },
  // Deluxe (201-205)
  { id: 6, room_number: 201, room_type: 'deluxe', price: 64.85, capacity: '4-5 guests', status: 'available', is_reserved: false, image_url: roomTypes.deluxe.image_url, amenities: roomTypes.deluxe.amenities },
  { id: 7, room_number: 202, room_type: 'deluxe', price: 64.85, capacity: '4-5 guests', status: 'available', is_reserved: false, image_url: roomTypes.deluxe.image_url, amenities: roomTypes.deluxe.amenities },
  { id: 8, room_number: 203, room_type: 'deluxe', price: 64.85, capacity: '4-5 guests', status: 'available', is_reserved: false, image_url: roomTypes.deluxe.image_url, amenities: roomTypes.deluxe.amenities },
  { id: 9, room_number: 204, room_type: 'deluxe', price: 64.85, capacity: '4-5 guests', status: 'available', is_reserved: false, image_url: roomTypes.deluxe.image_url, amenities: roomTypes.deluxe.amenities },
  { id: 10, room_number: 205, room_type: 'deluxe', price: 64.85, capacity: '4-5 guests', status: 'available', is_reserved: false, image_url: roomTypes.deluxe.image_url, amenities: roomTypes.deluxe.amenities },
  // Sweet (301-305)
  { id: 11, room_number: 301, room_type: 'sweet', price: 89.17, capacity: '5-6 guests', status: 'available', is_reserved: false, image_url: roomTypes.sweet.image_url, amenities: roomTypes.sweet.amenities },
  { id: 12, room_number: 302, room_type: 'sweet', price: 89.17, capacity: '5-6 guests', status: 'available', is_reserved: false, image_url: roomTypes.sweet.image_url, amenities: roomTypes.sweet.amenities },
  { id: 13, room_number: 303, room_type: 'sweet', price: 89.17, capacity: '5-6 guests', status: 'available', is_reserved: false, image_url: roomTypes.sweet.image_url, amenities: roomTypes.sweet.amenities },
  { id: 14, room_number: 304, room_type: 'sweet', price: 89.17, capacity: '5-6 guests', status: 'available', is_reserved: false, image_url: roomTypes.sweet.image_url, amenities: roomTypes.sweet.amenities },
  { id: 15, room_number: 305, room_type: 'sweet', price: 89.17, capacity: '5-6 guests', status: 'available', is_reserved: false, image_url: roomTypes.sweet.image_url, amenities: roomTypes.sweet.amenities },
  // Executive (401-405)
  { id: 16, room_number: 401, room_type: 'executive', price: 145.91, capacity: '5 guests', status: 'available', is_reserved: false, image_url: roomTypes.executive.image_url, amenities: roomTypes.executive.amenities },
  { id: 17, room_number: 402, room_type: 'executive', price: 145.91, capacity: '5 guests', status: 'available', is_reserved: false, image_url: roomTypes.executive.image_url, amenities: roomTypes.executive.amenities },
  { id: 18, room_number: 403, room_type: 'executive', price: 145.91, capacity: '5 guests', status: 'available', is_reserved: false, image_url: roomTypes.executive.image_url, amenities: roomTypes.executive.amenities },
  { id: 19, room_number: 404, room_type: 'executive', price: 145.91, capacity: '5 guests', status: 'available', is_reserved: false, image_url: roomTypes.executive.image_url, amenities: roomTypes.executive.amenities },
  { id: 20, room_number: 405, room_type: 'executive', price: 145.91, capacity: '5 guests', status: 'available', is_reserved: false, image_url: roomTypes.executive.image_url, amenities: roomTypes.executive.amenities },
  // Family (501-505)
  { id: 21, room_number: 501, room_type: 'family', price: 162.13, capacity: '10 guests', status: 'available', is_reserved: false, image_url: roomTypes.family.image_url, amenities: roomTypes.family.amenities },
  { id: 22, room_number: 502, room_type: 'family', price: 162.13, capacity: '10 guests', status: 'available', is_reserved: false, image_url: roomTypes.family.image_url, amenities: roomTypes.family.amenities },
  { id: 23, room_number: 503, room_type: 'family', price: 162.13, capacity: '10 guests', status: 'available', is_reserved: false, image_url: roomTypes.family.image_url, amenities: roomTypes.family.amenities },
  { id: 24, room_number: 504, room_type: 'family', price: 162.13, capacity: '10 guests', status: 'available', is_reserved: false, image_url: roomTypes.family.image_url, amenities: roomTypes.family.amenities },
  { id: 25, room_number: 505, room_type: 'family', price: 162.13, capacity: '10 guests', status: 'available', is_reserved: false, image_url: roomTypes.family.image_url, amenities: roomTypes.family.amenities },
];

// Initial mock bookings for dynamic dashboard visuals (Heuristic #1)
export const initialBookings: Booking[] = [
  { id: 101, room_id: 3, room_number: 103, room_type: 'standard', guest_name: 'Steven Ochigue', guest_email: 'steve@example.com', guest_phone: '+63 912 345 6789', check_in: '2026-06-01', check_out: '2026-06-05', status: 'confirmed', total_price: 226.96 },
  { id: 102, room_id: 8, room_number: 203, room_type: 'deluxe', guest_name: 'Jane Doe', guest_email: 'jane@example.com', guest_phone: '+63 923 456 7890', check_in: '2026-05-24', check_out: '2026-05-27', status: 'pending', total_price: 194.55 },
  { id: 103, room_id: 21, room_number: 501, room_type: 'family', guest_name: 'Robert Miller', guest_email: 'miller@example.com', guest_phone: '+1 (555) 019-2834', check_in: '2026-07-10', check_out: '2026-07-15', status: 'confirmed', total_price: 810.65 },
  { id: 104, room_id: 17, room_number: 402, room_type: 'executive', guest_name: 'Alice Johnson', guest_email: 'alice@example.com', guest_phone: '+1 (555) 987-6543', check_in: '2026-05-28', check_out: '2026-05-30', status: 'cancelled', total_price: 291.82 }
];

// CLIENT-SIDE localStorage ENGINE (Heuristic #7: stand-alone fallback)

export function getLocalRooms(): Room[] {
  const data = localStorage.getItem('marian_rooms');
  if (!data) {
    localStorage.setItem('marian_rooms', JSON.stringify(initialRooms));
    return initialRooms;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialRooms;
  }
}

export function saveLocalRooms(rooms: Room[]) {
  localStorage.setItem('marian_rooms', JSON.stringify(rooms));
}

export function getLocalBookings(): Booking[] {
  const data = localStorage.getItem('marian_bookings');
  if (!data) {
    localStorage.setItem('marian_bookings', JSON.stringify(initialBookings));
    return initialBookings;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialBookings;
  }
}

export function saveLocalBookings(bookings: Booking[]) {
  localStorage.setItem('marian_bookings', JSON.stringify(bookings));
}
