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
  Phone,
  Clock,
  Search,
  X,
  ShieldCheck
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

  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackedBookings, setTrackedBookings] = useState<any[]>([]);
  const [hasTracked, setHasTracked] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);

  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackEmail.trim()) {
      toast.error("Please enter your email to track bookings.");
      return;
    }
    // Fetch live bookings or fallback
    fetch(`/api/bookings/track.php?email=${encodeURIComponent(trackEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrackedBookings(data);
          // Sync with local storage
          const local = getLocalBookings();
          const otherLocal = local.filter(b => b.guest_email.toLowerCase() !== trackEmail.toLowerCase());
          const merged = [...otherLocal, ...data];
          saveLocalBookings(merged);
        } else {
          const local = getLocalBookings();
          const filtered = local.filter(b => b.guest_email.toLowerCase() === trackEmail.toLowerCase());
          setTrackedBookings(filtered);
        }
        setHasTracked(true);
      })
      .catch(() => {
        const local = getLocalBookings();
        const filtered = local.filter(b => b.guest_email.toLowerCase() === trackEmail.toLowerCase());
        setTrackedBookings(filtered);
        setHasTracked(true);
      });
  };

  const handleConfirmPayment = async (bookingId: number) => {
    // Validate card/gcash details first
    const newErrors: Record<string, string> = {};
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardName.trim()) newErrors.cardName = "Cardholder name is required.";
      if (!paymentDetails.cardNumber.trim()) newErrors.cardNumber = "Card number is required.";
      else if (paymentDetails.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = "Card number must be 16 digits.";
      if (!paymentDetails.cardExpiry.trim()) newErrors.cardExpiry = "Expiry MM/YY is required.";
      else if (!/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) newErrors.cardExpiry = "Expiry date must be in MM/YY format.";
      if (!paymentDetails.cardCvv.trim()) newErrors.cardCvv = "CVV is required.";
      else if (paymentDetails.cardCvv.length < 3) newErrors.cardCvv = "CVV must be 3 digits.";
    } else {
      if (!paymentDetails.gcashNumber.trim()) newErrors.gcashNumber = "GCash mobile number is required.";
      else if (paymentDetails.gcashNumber.length < 10) newErrors.gcashNumber = "Enter a valid 10-digit GCash mobile number.";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "You must agree to the Terms of Service & Privacy Policy.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in payment details and accept terms.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call public payment API to update status to confirmed
      const response = await fetch('/api/bookings/pay.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId })
      });
      if (response.ok) {
        toast.success("Payment successful! Reservation is paid and fully confirmed.");
        
        // Sync local storage state
        const local = getLocalBookings();
        const updated = local.map(b => {
          if (b.id === bookingId) {
            return { ...b, status: 'confirmed' as const };
          }
          return b;
        });
        saveLocalBookings(updated);
      } else {
        throw new Error("API update failed");
      }
    } catch (e) {
      // Local storage fallback
      const local = getLocalBookings();
      const updated = local.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'confirmed' as const };
        }
        return b;
      });
      saveLocalBookings(updated);
      toast.success("Payment successful! Reservation is fully confirmed (Local Storage).");
    } finally {
      setIsSubmitting(false);
      setPayingBookingId(null);
      setPaymentDetails({
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        gcashNumber: ''
      });
      setAcceptTerms(false);
      // Immediately refresh the search result from the database or local storage
      setTimeout(() => {
        handleTrackSearch();
      }, 100);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash'>('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    gcashNumber: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

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
          const availableOnly = data.filter(r => r.status === 'available');
          setRooms(availableOnly);
          setAvailableRooms(availableOnly);
          
          if (preselectedRoom) {
            const [type, num] = preselectedRoom.split('-');
            const found = availableOnly.find(r => r.room_type === type && r.room_number.toString() === num);
            if (found) {
              setFormData(prev => ({ ...prev, roomId: found.id.toString() }));
              setStep(1);
            }
          }
        } else {
          const localRooms = getLocalRooms().filter(r => r.status === 'available');
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
        const localRooms = getLocalRooms().filter(r => r.status === 'available');
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
            const availableOnly = data.filter(r => r.status === 'available');
            setAvailableRooms(availableOnly);
            // If currently selected room becomes unavailable, clear it
            if (formData.roomId && !availableOnly.find(r => r.id.toString() === formData.roomId)) {
              setFormData(prev => ({ ...prev, roomId: '' }));
              toast.warning("The selected room class is fully booked for these dates. Please select an alternative.");
            }
          } else {
            // Local fallback logic for checking availability (Heuristic #5)
            const localRooms = getLocalRooms();
            const localBookings = getLocalBookings();
            const available = localRooms.filter(r => {
              if (r.status !== 'available') return false;
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
            if (r.status !== 'available') return false;
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
          total_price: parseFloat((estimatedCost * 1.12).toFixed(2)),
          status: 'pending'
        })
      });

      if (response.ok) {
        showModal('success');
        setTrackEmail(formData.guestEmail); // Pre-fill tracking search
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
          status: 'pending' as const,
          total_price: parseFloat((parseFloat(selectedRoom.price) * nights * 1.12).toFixed(2))
        };
        localBookings.push(newBooking);
        saveLocalBookings(localBookings);

        showModal('success');
        setTrackEmail(formData.guestEmail); // Pre-fill tracking search
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
    setPaymentDetails({
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      gcashNumber: ''
    });
    setAcceptTerms(false);
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
      
      {/* Modern Premium Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 max-w-md bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'book'
              ? 'bg-white text-[#1E73BE] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Book Accommodation
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'track'
              ? 'bg-white text-[#1E73BE] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Track & Pay Booking
        </button>
      </div>

      {activeTab === 'book' ? (
        <>
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

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 text-blue-800 text-xs mt-4">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Approval Required</span>
                    <span>Wait for the approval, it will be sent on your Gmail or we will call you. Thank you for reserving!</span>
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
                  className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md shadow-blue-500/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Request Booking Approval</span>
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
    </>
  ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Search className="w-6 h-6 text-[#1E73BE]" />
              Track & Pay Your Booking
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your registered guest email address below to review approval status, check booking summaries, and complete GCash or Card payments.
            </p>

            <form onSubmit={(e) => handleTrackSearch(e)} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. guest@example.com"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E73BE] transition-all text-sm font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E73BE] text-white font-bold rounded-2xl hover:bg-[#155a96] transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-95"
              >
                <Search className="w-4 h-4" />
                Find Bookings
              </button>
            </form>
          </div>

          {hasTracked && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <span>Search Results for</span>
                <span className="text-[#1E73BE] font-extrabold underline">{trackEmail}</span>
              </h3>

              {trackedBookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-4">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-700 text-lg">No Active Reservations Found</p>
                    <p className="text-sm text-slate-500 mt-1">Make sure you entered the exact email used during booking or submit a new reservation request.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {trackedBookings.map((booking) => {
                    const roomTypeObj = roomTypes[booking.room_type as keyof typeof roomTypes];
                    return (
                      <div key={booking.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                        {/* Header banner */}
                        <div className="px-6 py-4 bg-slate-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking ID #{booking.id}</span>
                            <h4 className="text-lg font-bold text-slate-800 mt-0.5">
                              {roomTypeObj ? roomTypeObj.name : 'Luxury Accommodation'} — Room {booking.room_number}
                            </h4>
                          </div>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {booking.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {booking.status === 'approved' && <Clock className="w-3.5 h-3.5" />}
                            {booking.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            {booking.status === 'cancelled' && <X className="w-3.5 h-3.5" />}
                            {booking.status === 'pending' ? 'Pending Approval' : booking.status === 'approved' ? 'Approved (Waiting Payment)' : booking.status === 'confirmed' ? 'Paid & Confirmed' : booking.status}
                          </span>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 text-sm">
                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Guest Information</h5>
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{booking.guest_name}</p>
                              <p className="text-slate-500 text-xs">{booking.guest_email}</p>
                              <p className="text-slate-500 text-xs">{booking.guest_phone}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Stay Summary</h5>
                            <div className="space-y-1 text-slate-700">
                              <p><span className="font-medium">Check-In:</span> <span className="font-bold text-slate-800">{booking.check_in}</span></p>
                              <p><span className="font-medium">Check-Out:</span> <span className="font-bold text-slate-800">{booking.check_out}</span></p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Total Amount</h5>
                            <div>
                              <p className="text-2xl font-extrabold text-[#1E73BE]">${parseFloat(booking.total_price).toFixed(2)}</p>
                              <p className="text-[11px] text-slate-400">All local taxes & fees included.</p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Workflow Controls */}
                        <div className="p-6 bg-slate-50/50">
                          {booking.status === 'pending' && (
                            <div className="space-y-4">
                              {/* Simple timeline */}
                              <div className="flex items-center gap-4 text-xs font-bold mb-2">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
                                  Request Submitted
                                </div>
                                <div className="w-8 h-0.5 bg-slate-200" />
                                <div className="flex items-center gap-1.5 text-amber-600 animate-pulse">
                                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">2</span>
                                  Admin Verification
                                </div>
                                <div className="w-8 h-0.5 bg-slate-200" />
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
                                  Secure Checkout
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                                <Clock className="w-4 h-4 text-amber-500 inline-block mr-1.5 -mt-0.5 flex-shrink-0" />
                                <strong>Active Review:</strong> Our administrative team is currently verifying room inventory for your dates. Once verified, this booking status will change to "Approved" and unlock the online GCash/Card payment portal below.
                              </p>
                            </div>
                          )}

                          {booking.status === 'approved' && (
                            <>
                              {payingBookingId === booking.id ? (
                                <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
                                  <div className="flex justify-between items-center pb-3 border-b">
                                    <h4 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                      Secure Reservation Checkout
                                    </h4>
                                    <button
                                      onClick={() => setPayingBookingId(null)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                      <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                  </div>

                                  {/* Select Payment Method */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setPaymentMethod('card')}
                                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1.5 cursor-pointer ${
                                        paymentMethod === 'card'
                                          ? 'border-[#1E73BE] bg-blue-50/20 text-[#1E73BE] ring-4 ring-blue-50'
                                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      <CreditCard className="w-5 h-5" />
                                      <span className="text-xs font-bold">Credit/Debit Card</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPaymentMethod('gcash')}
                                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1.5 cursor-pointer ${
                                        paymentMethod === 'gcash'
                                          ? 'border-blue-600 bg-sky-50/20 text-blue-600 ring-4 ring-sky-50'
                                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className="text-[10px] font-black italic tracking-wider text-blue-600 bg-white border border-blue-200 px-1.5 py-0.5 rounded shadow-sm">GCash</span>
                                      <span className="text-xs font-bold">GCash Simulation</span>
                                    </button>
                                  </div>

                                  {/* Card Form */}
                                  {paymentMethod === 'card' ? (
                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Cardholder Name</label>
                                        <input
                                          type="text"
                                          placeholder="Steven Ochigue"
                                          value={paymentDetails.cardName}
                                          onChange={(e) => {
                                            setPaymentDetails({ ...paymentDetails, cardName: e.target.value });
                                            setErrors(prev => ({ ...prev, cardName: '' }));
                                          }}
                                          className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 text-xs transition-all ${
                                            errors.cardName ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:bg-white'
                                          }`}
                                        />
                                        {errors.cardName && <p className="text-[10px] text-red-500 font-bold">{errors.cardName}</p>}
                                      </div>

                                      <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Card Number</label>
                                        <input
                                          type="text"
                                          placeholder="4111 2222 3333 4444"
                                          maxLength={19}
                                          value={paymentDetails.cardNumber}
                                          onChange={(e) => {
                                            const v = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                                            const matches = v.match(/\d{4,16}/g);
                                            const match = matches && matches[0] || '';
                                            const parts = [];

                                            for (let i = 0, len = match.length; i < len; i += 4) {
                                              parts.push(match.substring(i, i + 4));
                                            }

                                            if (parts.length > 0) {
                                              setPaymentDetails({ ...paymentDetails, cardNumber: parts.join(' ') });
                                            } else {
                                              setPaymentDetails({ ...paymentDetails, cardNumber: v });
                                            }
                                            setErrors(prev => ({ ...prev, cardNumber: '' }));
                                          }}
                                          className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 text-xs transition-all ${
                                            errors.cardNumber ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:bg-white'
                                          }`}
                                        />
                                        {errors.cardNumber && <p className="text-[10px] text-red-500 font-bold">{errors.cardNumber}</p>}
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <label className="block text-[11px] font-bold text-slate-500 uppercase">Expiry Date</label>
                                          <input
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={paymentDetails.cardExpiry}
                                            onChange={(e) => {
                                              let v = e.target.value.replace(/[^0-9]/g, '');
                                              if (v.length > 2) {
                                                v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                              }
                                              setPaymentDetails({ ...paymentDetails, cardExpiry: v });
                                              setErrors(prev => ({ ...prev, cardExpiry: '' }));
                                            }}
                                            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 text-xs transition-all ${
                                              errors.cardExpiry ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:bg-white'
                                            }`}
                                          />
                                          {errors.cardExpiry && <p className="text-[10px] text-red-500 font-bold">{errors.cardExpiry}</p>}
                                        </div>

                                        <div className="space-y-1">
                                          <label className="block text-[11px] font-bold text-slate-500 uppercase">CVV</label>
                                          <input
                                            type="password"
                                            placeholder="123"
                                            maxLength={3}
                                            value={paymentDetails.cardCvv}
                                            onChange={(e) => {
                                              const v = e.target.value.replace(/[^0-9]/g, '');
                                              setPaymentDetails({ ...paymentDetails, cardCvv: v });
                                              setErrors(prev => ({ ...prev, cardCvv: '' }));
                                            }}
                                            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 text-xs transition-all ${
                                              errors.cardCvv ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:bg-white'
                                            }`}
                                          />
                                          {errors.cardCvv && <p className="text-[10px] text-red-500 font-bold">{errors.cardCvv}</p>}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                                      <div className="flex items-start gap-2 bg-sky-50 p-2.5 rounded-lg border border-sky-100 text-[11px] text-sky-800 font-medium">
                                        <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                                        <span>Enter your mock 10-digit mobile number linked with GCash to simulate transaction authorization.</span>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">GCash Mobile Number</label>
                                        <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">+63</span>
                                          <input
                                            type="tel"
                                            placeholder="912 345 6789"
                                            maxLength={10}
                                            value={paymentDetails.gcashNumber}
                                            onChange={(e) => {
                                              const v = e.target.value.replace(/[^0-9]/g, '');
                                              setPaymentDetails({ ...paymentDetails, gcashNumber: v });
                                              setErrors(prev => ({ ...prev, gcashNumber: '' }));
                                            }}
                                            className={`w-full pl-11 pr-3 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 text-xs transition-all ${
                                              errors.gcashNumber ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'
                                            }`}
                                          />
                                        </div>
                                        {errors.gcashNumber && <p className="text-[10px] text-red-500 font-bold">{errors.gcashNumber}</p>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Agree to terms */}
                                  <div className="flex items-start gap-2 pt-2">
                                    <input
                                      type="checkbox"
                                      id={`accept-terms-${booking.id}`}
                                      checked={acceptTerms}
                                      onChange={(e) => {
                                        setAcceptTerms(e.target.checked);
                                        setErrors(prev => ({ ...prev, acceptTerms: '' }));
                                      }}
                                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-[#1E73BE]"
                                    />
                                    <label htmlFor={`accept-terms-${booking.id}`} className="text-[11px] text-slate-600 select-none">
                                      I authorize Marian Hotel to simulate a transaction of <strong>${parseFloat(booking.total_price).toFixed(2)}</strong>, and agree to the Terms of Service.
                                    </label>
                                  </div>
                                  {errors.acceptTerms && <p className="text-[10px] text-red-500 font-bold">{errors.acceptTerms}</p>}

                                  {/* Confirm Button */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleConfirmPayment(booking.id)}
                                      disabled={isSubmitting}
                                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          Simulating...
                                        </>
                                      ) : (
                                        <>
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                          Authorize Payment
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setPayingBookingId(null)}
                                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4 text-xs font-bold mb-2">
                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
                                      Request Approved
                                    </div>
                                    <div className="w-8 h-0.5 bg-emerald-200" />
                                    <div className="flex items-center gap-1.5 text-[#1E73BE]">
                                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">2</span>
                                      Payment Required
                                    </div>
                                    <div className="w-8 h-0.5 bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
                                      Final Voucher
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                                    Your request has been approved by the Admin team! Secure your booking inventory right now by completing the mock payment checkout below.
                                  </p>
                                  <button
                                    onClick={() => {
                                      setPayingBookingId(booking.id);
                                      setErrors({});
                                    }}
                                    className="px-6 py-3 bg-[#1E73BE] hover:bg-[#155a96] text-white font-bold rounded-2xl transition-all text-sm flex items-center gap-2 shadow-md shadow-blue-500/10 active:scale-95"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    Pay Securely Now
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex gap-3 text-xs">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-sm mb-0.5">Booking Fully Confirmed</span>
                                <p className="leading-relaxed">
                                  Payment successfully received. Your check-in voucher is fully verified and prepared. Welcome to Marian Hotel! Your Room {booking.room_number} is reserved and guaranteed for arrival.
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.status === 'cancelled' && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex gap-3 text-xs">
                              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-sm mb-0.5">Reservation Cancelled</span>
                                <p className="leading-relaxed">
                                  This request has been cancelled or rejected by hotel management. If you need any assistance, please send a new reservation request or get in touch.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                {modalState.type === 'success' ? 'Request Submitted!' : 'Booking Attempt Failed'}
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {modalState.type === 'success' 
                  ? "Wait for the approval, it will be sent on your Gmail or we will call you. Thank you!"
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
                {modalState.type === 'success' ? 'Thank You!' : 'Try Again'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
