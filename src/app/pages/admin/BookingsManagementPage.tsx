import { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  Calendar,
  Mail,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { getLocalBookings, saveLocalBookings } from '../../data/rooms';

interface Booking {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  room_number: string | number;
  room_type: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: string | number;
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state (Heuristic #7: Efficiency of Use)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation Alert Dialog state (Heuristic #5: Error Prevention)
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    status: 'confirmed' | 'cancelled';
    guestName: string;
  } | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/list.php', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings(getLocalBookings());
      }
    } catch (error: any) {
      console.error("Error fetching bookings, using local storage:", error);
      setBookings(getLocalBookings());
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/bookings/update.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({ id, status })
      });
      
      if (response.ok) {
        toast.success(`Booking marked ${status} successfully!`);
        fetchBookings();
      } else {
        const result = await response.json();
        throw new Error(result.message || "Failed to update booking status");
      }
    } catch (error) {
      console.warn("API update status failed, using local storage fallback:", error);
      const localBookings = getLocalBookings();
      const updated = localBookings.map(b => {
        if (b.id === id) {
          return { ...b, status: status as any };
        }
        return b;
      });
      saveLocalBookings(updated);
      toast.success(`Booking marked ${status} (Local Storage)`);
      fetchBookings();
    }
  };

  const triggerStatusUpdate = (id: number, status: 'confirmed' | 'cancelled', guestName: string) => {
    setPendingAction({ id, status, guestName });
  };

  const confirmStatusUpdate = () => {
    if (pendingAction) {
      handleUpdateStatus(pendingAction.id, pendingAction.status);
      setPendingAction(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings in real-time
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.room_number.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings Management</h1>
          <p className="text-slate-500 font-medium">View, search, filter, and moderate all guest reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Confirmed Stay</p>
            <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Cancelled</p>
            <p className="text-2xl font-bold text-slate-900">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filter (Heuristic #7 & #8) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Dynamic Search Box */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by guest name, email, or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE] focus:bg-white transition-all placeholder-slate-400"
          />
        </div>

        {/* Dynamic Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1 hidden sm:inline flex-shrink-0">
            <Filter className="w-3.5 h-3.5 inline mr-1" />
            Status:
          </span>
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'pending', label: `Pending (${stats.pending})` },
            { id: 'confirmed', label: `Confirmed (${stats.confirmed})` },
            { id: 'cancelled', label: `Cancelled (${stats.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id 
                  ? 'bg-[#1E73BE] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
            <Loader2 className="w-8 h-8 text-[#1E73BE] animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold text-lg text-slate-600">No bookings match criteria.</p>
            <p className="text-xs mt-1">Try relaxing search parameters or change status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guest Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room Allocation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{booking.guest_name}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {booking.guest_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-semibold capitalize bg-slate-100 px-2 py-1 rounded text-xs">
                        {booking.room_type} Room #{booking.room_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{booking.check_in}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">to {booking.check_out}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-extrabold text-sm">${booking.total_price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {booking.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                        {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => triggerStatusUpdate(booking.id, 'confirmed', booking.guest_name)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Approve Reservation"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => triggerStatusUpdate(booking.id, 'cancelled', booking.guest_name)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:text-[#1E73BE] hover:bg-[#1E73BE]/5 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking State Change Dialog Guard (Heuristic #5: Error Prevention) */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Confirm Reservation Status Update?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              You are about to mark the reservation for <span className="font-bold text-slate-900">"{pendingAction?.guestName}"</span> as <span className="font-bold capitalize" style={{ color: pendingAction?.status === 'confirmed' ? '#10B981' : '#F43F5E' }}>{pendingAction?.status}</span>. 
              {pendingAction?.status === 'confirmed' 
                ? " This will confirm the room hold and prepare check-in guidelines."
                : " This will immediately release the room inventory, making it bookable by other guests."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-slate-200">Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusUpdate}
              className={`rounded-xl text-white font-bold transition-all border-none ${
                pendingAction?.status === 'confirmed' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm Status Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
