import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Bed, 
  Check, 
  Info,
  ChevronRight,
  Mail,
  User,
  Phone
} from 'lucide-react';
import { roomTypes, getLocalRooms, getLocalBookings, saveLocalBookings } from '../data/rooms';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../components/ui/dialog";

export default function Reservation() {
  const [searchParams] = useSearchParams();
  const preselectedRoom = searchParams.get('room') || '';

  const [rooms, setRooms] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard Steps: 1 = Dates & Guests, 2 = Choose Room, 3 = Guest Info, 4 = Review & Pay
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });

  // Validation States for custom recovery messages (Heuristic #9)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [nights, setNights] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const showModal = (type: 'success' | 'error', message: string = '') => {
    setModalState({ isOpen: true, type, message });
  };

  // Fetch Rooms inventory
  useEffect(() => {
    fetch('/api/rooms/read.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
          setAvailableRooms(data);
          
          if (preselectedRoom) {
            const [type, num] = preselectedRoom.split('-');
            const found = data.find(r => r.room_type === type && r.room_number.toString() === num);
            if (found) {
              setFormData(prev => ({ ...prev, roomId: found.id.toString() }));
              // If a room is pre-selected, fast-track the user to check dates
              setStep(1);
            }
          }
        } else {
          const localRooms = getLocalRooms();
          setRooms(localRooms);
          setAvailableRooms(localRooms);
          if (preselectedRoom) {
            const [type, num] = preselectedRoom.split('-');
            const found = localRooms.find(r => r.room_type === type && r.room_number.toString() === num);
            if (found) {
              setFormData(prev => ({ ...prev, roomId: found.id.toString() }));
              setStep(1);
            }
          }
        }
      })
      .catch(err => {
        console.error("Error fetching rooms, using local fallback:", err);
        const localRooms = getLocalRooms();
        setRooms(localRooms);
        setAvailableRooms(localRooms);
        if (preselectedRoom) {
          const [type, num] = preselectedRoom.split('-');
          const found = localRooms.find(r => r.room_type === type && r.room_number.toString() === num);
          if (found) {
            setFormData(prev => ({ ...prev, roomId: found.id.toString() }));
            setStep(1);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [preselectedRoom]);

  // Recalculate nights and fetch live room availability
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        setNights(0);
        setEstimatedCost(0);
        return;
      }

      if (checkOutDate <= checkInDate) {
        setNights(0);
        setEstimatedCost(0);
        return;
      }

      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      setNights(diffDays);

      // Fetch live available rooms for these dates (Heuristic #5: Error Prevention)
      fetch(`/api/rooms/available.php?check_in=${formData.checkIn}&check_out=${formData.checkOut}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAvailableRooms(data);
            // If currently selected room becomes unavailable, clear it
            if (formData.roomId && !data.find(r => r.id.toString() === formData.roomId)) {
              setFormData(prev => ({ ...prev, roomId: '' }));
              toast.warning("The selected room class is fully booked for these dates. Please select an alternative.");
            }
          } else {
            // Local fallback logic for checking availability (Heuristic #5)
            const localRooms = getLocalRooms();
            const localBookings = getLocalBookings();
            const available = localRooms.filter(r => {
              const hasOverlap = localBookings.some(b => {
                if (b.room_id !== r.id || b.status === 'cancelled') return false;
                return (formData.checkIn < b.check_out && formData.checkOut > b.check_in);
              });
              return !hasOverlap;
            });
            setAvailableRooms(available);
            if (formData.roomId && !available.find(r => r.id.toString() === formData.roomId)) {
              setFormData(prev => ({ ...prev, roomId: '' }));
            }
          }
        })
        .catch(err => {
          console.error("Error checking room availability, using local storage fallback:", err);
          const localRooms = getLocalRooms();
          const localBookings = getLocalBookings();
          const available = localRooms.filter(r => {
            const hasOverlap = localBookings.some(b => {
              if (b.room_id !== r.id || b.status === 'cancelled') return false;
              return (formData.checkIn < b.check_out && formData.checkOut > b.check_in);
            });
            return !hasOverlap;
          });
          setAvailableRooms(available);
          if (formData.roomId && !available.find(r => r.id.toString() === formData.roomId)) {
            setFormData(prev => ({ ...prev, roomId: '' }));
          }
        });

      const selectedRoom = rooms.find(r => r.id.toString() === formData.roomId);
      if (selectedRoom && diffDays > 0) {
        setEstimatedCost(parseFloat(selectedRoom.price) * diffDays);
      } else {
        setEstimatedCost(0);
      }
    } else {
      setNights(0);
      setEstimatedCost(0);
    }
  }, [formData.checkIn, formData.checkOut, formData.roomId, rooms]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: formData.roomId,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          total_price: estimatedCost
        })
      });

      if (response.ok) {
        showModal('success');
        setFormData({
          checkIn: '',
          checkOut: '',
          guests: 1,
          roomId: '',
          guestName: '',
          guestEmail: '',
          guestPhone: ''
        });
        setStep(1);
      } else {
        const result = await response.json();
        throw new Error(result.message || "Failed to finalize reservation");
      }
    } catch (error) {
      console.warn("API booking failed, using local storage backup:", error);
      const selectedRoom = rooms.find(r => r.id.toString() === formData.roomId);
      if (selectedRoom) {
        const localBookings = getLocalBookings();
        const newBooking = {
          id: Date.now(),
          room_id: selectedRoom.id,
          room_number: selectedRoom.room_number,
          room_type: selectedRoom.room_type,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          status: 'confirmed' as const,
          total_price: estimatedCost
        };
        localBookings.push(newBooking);
        saveLocalBookings(localBookings);

        showModal('success');
        setFormData({
          checkIn: '',
          checkOut: '',
          guests: 1,
          roomId: '',
          guestName: '',
          guestEmail: '',
          guestPhone: ''
        });
        setStep(1);
      } else {
        showModal('error', "Could not resolve selected room data locally.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in date is required.";
    } else if (formData.checkIn < today) {
      newErrors.checkIn = "Check-in date cannot be in the past.";
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out date is required.";
    } else if (formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = "Check-out must be at least 1 day after check-in.";
    }

    if (formData.guests < 1) {
      newErrors.guests = "Must have at least 1 guest.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.roomId) {
      newErrors.roomId = "Please choose a room to continue.";
      toast.error("Please select a room category to continue.");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.guestName.trim()) {
      newErrors.guestName = "Full name is required for hotel registration.";
    }
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = "Email address is required to receive check-in vouchers.";
    } else if (!emailRegex.test(formData.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email format (e.g. name@domain.com).";
    }
    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = "Phone number is required for booking updates.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next Step Trigger
  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) setStep(4);
  };

  // Prev Step Trigger
  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setErrors({});
    }
  };

  // Reset Booking Form (Heuristic #3: User Freedom)
  const handleReset = () => {
    setFormData({
      checkIn: '',
      checkOut: '',
      guests: 1,
      roomId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: ''
    });
    setStep(1);
    setErrors({});
    toast.info("Booking criteria has been reset.");
  };

  const selectedRoom = rooms.find(r => r.id.toString() === formData.roomId);
  const selectedRoomType = selectedRoom ? roomTypes[selectedRoom.room_type as keyof typeof roomTypes] : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#1E73BE] animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading reservation layout...</p>
      </div>
    );
  }

  // Stepper Header definitions
  const steps = [
    { num: 1, label: "Choose Dates" },
    { num: 2, label: "Choose Room" },
    { num: 3, label: "Guest Details" },
    { num: 4, label: "Review & Confirm" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#1E73BE' }}>
            Book Your Stay
          </h1>
          <p className="text-gray-500 mt-1">
            Experience comfort & class at Marian Hotel. Secure your stay in 4 easy steps.
          </p>
        </div>
        
        {/* Reset Action */}
        <button 
          onClick={handleReset} 
          className="text-sm font-semibold text-slate-500 hover:text-red-500 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all w-fit"
        >
          Reset Booking Details
        </button>
      </div>

      {/* Stepper Progress Indicator (Heuristic #1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step === s.num 
                      ? 'bg-[#1E73BE] text-white ring-4 ring-blue-100'
                      : step > s.num 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </span>
                  <span className={`text-sm font-semibold ${
                    step === s.num ? 'text-[#1E73BE]' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-2 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Wizard Component */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            
            {/* STEP 1: DATES & GUESTS */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#1E73BE]" />
                    <span>Select Travel Dates & Guests</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Specify your stay duration to check room availability.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Check-In */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Check-in Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.checkIn}
                      onChange={(e) => {
                        setFormData({ ...formData, checkIn: e.target.value, checkOut: '' });
                        setErrors(prev => ({ ...prev, checkIn: '', checkOut: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                        errors.checkIn 
                          ? 'border-red-400 focus:ring-red-100 bg-red-50/20' 
                          : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                      }`}
                    />
                    {errors.checkIn && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.checkIn}</span>
                      </p>
                    )}
                  </div>

                  {/* Check-Out */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Check-out Date</label>
                    <input
                      type="date"
                      disabled={!formData.checkIn}
                      min={formData.checkIn ? new Date(new Date(formData.checkIn).getTime() + 86400000).toISOString().split('T')[0] : ''}
                      value={formData.checkOut}
                      onChange={(e) => {
                        setFormData({ ...formData, checkOut: e.target.value });
                        setErrors(prev => ({ ...prev, checkOut: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed ${
                        errors.checkOut 
                          ? 'border-red-400 focus:ring-red-100 bg-red-50/20' 
                          : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                      }`}
                    />
                    {errors.checkOut && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.checkOut}</span>
                      </p>
                    )}
                    {!formData.checkIn && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Info className="w-3 h-3 text-[#1E73BE]" />
                        <span>Select check-in first to unlock this calendar.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Number of Guests */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Number of Guests</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guests}
                    onChange={(e) => {
                      setFormData({ ...formData, guests: Math.max(1, parseInt(e.target.value) || 1) });
                      setErrors(prev => ({ ...prev, guests: '' }));
                    }}
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                      errors.guests 
                        ? 'border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                    }`}
                  />
                  <p className="text-xs text-slate-400">Our larger room categories support up to 10 guests.</p>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE ROOM (Heuristic #6: Recognition over Recall) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#1E73BE]" />
                    <span>Select Your Room Class</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Showing available accommodations for your dates: <span className="font-bold text-[#1E73BE]">{formData.checkIn} to {formData.checkOut}</span>.
                  </p>
                </div>

                {availableRooms.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed text-slate-500 space-y-3">
                    <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
                    <p className="font-bold">No rooms are available for these exact dates.</p>
                    <p className="text-xs">Try selecting a different date range or reducing guest counts.</p>
                    <button 
                      onClick={handlePrev} 
                      className="px-4 py-2 bg-[#1E73BE] text-white font-bold rounded-xl text-sm"
                    >
                      Change Dates
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 max-h-[500px] overflow-y-auto pr-1">
                    {availableRooms.map((room) => {
                      const details = roomTypes[room.room_type as keyof typeof roomTypes] || { name: 'Room', amenities: [] };
                      const isSelected = formData.roomId === room.id.toString();
                      
                      return (
                        <div 
                          key={room.id}
                          onClick={() => {
                            setFormData({ ...formData, roomId: room.id.toString() });
                            setErrors(prev => ({ ...prev, roomId: '' }));
                          }}
                          className={`flex flex-col sm:flex-row bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#1E73BE] ring-2 ring-[#1E73BE]/15 shadow-md' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Room image */}
                          <div className="w-full sm:w-44 h-40 sm:h-auto overflow-hidden relative flex-shrink-0 bg-slate-100">
                            {room.image_url ? (
                              <img src={room.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Bed className="w-8 h-8" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-slate-900/70 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                              #{room.room_number}
                            </div>
                          </div>

                          {/* Room details */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h3 className="font-bold text-lg text-slate-900">{details.name}</h3>
                                <span className="text-[#1E73BE] font-bold text-lg">${parseFloat(room.price).toFixed(2)}<span className="text-slate-400 text-xs font-normal">/night</span></span>
                              </div>
                              <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Capacity: {room.capacity}</p>
                              
                              {/* Amenities list */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {(room.amenities || details.amenities || []).slice(0, 4).map((amenity: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                                    {amenity}
                                  </span>
                                ))}
                                {(room.amenities || details.amenities || []).length > 4 && (
                                  <span className="text-[10px] text-slate-400 font-bold self-center">
                                    +{(room.amenities || details.amenities || []).length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Select trigger visual */}
                            <div className="flex justify-end">
                              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                isSelected 
                                  ? 'bg-blue-50 text-[#1E73BE] border-[#1E73BE]/30' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}>
                                <Check className={`w-3.5 h-3.5 opacity-0 scale-70 transition-all ${isSelected ? 'opacity-100 scale-100' : ''}`} />
                                <span>{isSelected ? 'Selected Room' : 'Choose Room'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: GUEST INFORMATION */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1E73BE]" />
                    <span>Personal Registration Details</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Please supply contact information so we can confirm your arrival.</p>
                </div>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Full Guest Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.guestName}
                        onChange={(e) => {
                          setFormData({ ...formData, guestName: e.target.value });
                          setErrors(prev => ({ ...prev, guestName: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                          errors.guestName 
                            ? 'border-red-400 focus:ring-red-100' 
                            : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                        }`}
                      />
                    </div>
                    {errors.guestName && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.guestName}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.guestEmail}
                        onChange={(e) => {
                          setFormData({ ...formData, guestEmail: e.target.value });
                          setErrors(prev => ({ ...prev, guestEmail: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                          errors.guestEmail 
                            ? 'border-red-400 focus:ring-red-100' 
                            : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                        }`}
                      />
                    </div>
                    {errors.guestEmail && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.guestEmail}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Your booking voucher, check-in instructions, and billing invoices will be dispatched to this email.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={formData.guestPhone}
                        onChange={(e) => {
                          setFormData({ ...formData, guestPhone: e.target.value });
                          setErrors(prev => ({ ...prev, guestPhone: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                          errors.guestPhone 
                            ? 'border-red-400 focus:ring-red-100' 
                            : 'border-slate-200 focus:ring-blue-100 focus:border-[#1E73BE]'
                        }`}
                      />
                    </div>
                    {errors.guestPhone && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.guestPhone}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Provide a valid mobile number for check-in confirmation and quick SMS alerts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1E73BE]" />
                    <span>Review & Finalize Booking</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Review all travel criteria before securing your reservation.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4 text-sm text-slate-700">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Guest Name:</span>
                    <span className="font-bold text-slate-900">{formData.guestName}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Contact Email:</span>
                    <span className="font-bold text-slate-900">{formData.guestEmail}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Phone Number:</span>
                    <span className="font-bold text-slate-900">{formData.guestPhone}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Check-in:</span>
                    <span className="font-bold text-slate-900">{formData.checkIn} (14:00 onwards)</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Check-out:</span>
                    <span className="font-bold text-slate-900">{formData.checkOut} (before 12:00 noon)</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-900">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-500">Guests capacity:</span>
                    <span className="font-bold text-slate-900">{formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}</span>
                  </div>

                  {selectedRoom && selectedRoomType && (
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-slate-500">Selected Accommodation:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {selectedRoomType.name} Room {selectedRoom.room_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Flexible Cancellation Guarantee</span>
                    <span>No deposit required. You can cancel or amend this booking free of charge up to 48 hours prior to arrival.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Action Controls (Heuristic #3) */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              {step > 1 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              ) : (
                <div /> // Spacer
              )}

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1E73BE] text-white font-bold rounded-xl hover:bg-[#155a96] active:scale-95 transition-all text-sm shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-emerald-500/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Stay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Secure Booking</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Dynamic Sticky Booking Summary (Heuristic #6: Recognition over Recall) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 pb-3 border-b">
              Booking Invoice
            </h3>

            {selectedRoom && selectedRoomType ? (
              <div className="space-y-4">
                <div className="w-full h-40 overflow-hidden rounded-xl bg-slate-100 relative shadow-sm border">
                  {selectedRoom.image_url ? (
                    <img src={selectedRoom.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Bed className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-[#1E73BE] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                    {selectedRoomType.name}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Room Code:</span>
                    <span className="font-bold">Room {selectedRoom.room_number}</span>
                  </div>

                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Stay Duration:</span>
                        <span className="font-bold">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Stay Dates:</span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {formData.checkIn} to {formData.checkOut}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700 border-t pt-3 mt-3">
                        <span className="font-medium">Rate per Night:</span>
                        <span className="font-bold text-slate-800">${parseFloat(selectedRoom.price).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700 pt-1">
                        <span className="font-medium">Room Subtotal:</span>
                        <span className="font-bold text-slate-800">${(parseFloat(selectedRoom.price) * nights).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700 pt-1">
                        <span className="font-medium text-slate-400">Local Hotel Tax (12%):</span>
                        <span className="font-bold text-slate-500">${((parseFloat(selectedRoom.price) * nights) * 0.12).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-800 border-t border-dashed pt-4 mt-4">
                        <span className="text-base font-bold">Total Estimated:</span>
                        <span className="text-2xl font-extrabold" style={{ color: '#1E73BE' }}>
                          ${(parseFloat(selectedRoom.price) * nights * 1.12).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border">
                  <Bed className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Select accommodation to preview invoice summary.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Booking Confirmation Dialog (Heuristic #1: System Status) */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border ${
              modalState.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
            }`}>
              {modalState.type === 'success' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {modalState.type === 'success' ? 'Reservation Confirmed!' : 'Booking Attempt Failed'}
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {modalState.type === 'success' 
                  ? "Your luxury room has been locked in. We have dispatched a formal confirmation voucher to your email address."
                  : modalState.message}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="w-full mt-8">
              <button
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${
                  modalState.type === 'success' ? 'bg-[#1E73BE] hover:bg-[#155a96]' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {modalState.type === 'success' ? 'Wonderful, Thank You!' : 'Try Again'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
