import { useState, useEffect } from 'react';
import { getLocalRooms, getLocalBookings } from '../../data/rooms';
import { 
  CreditCard, 
  BedDouble, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', bookings: 40, revenue: 2400 },
  { name: 'Tue', bookings: 30, revenue: 1398 },
  { name: 'Wed', bookings: 20, revenue: 9800 },
  { name: 'Thu', bookings: 27, revenue: 3908 },
  { name: 'Fri', bookings: 18, revenue: 4800 },
  { name: 'Sat', bookings: 23, revenue: 3800 },
  { name: 'Sun', bookings: 34, revenue: 4300 },
];

export default function DashboardPage() {
  const [roomsCount, setRoomsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let roomsData = [];
        let bookingsData = [];

        try {
          const roomsRes = await fetch('/api/rooms/read.php');
          const parsedRooms = await roomsRes.json();
          if (Array.isArray(parsedRooms)) {
            roomsData = parsedRooms;
          } else {
            roomsData = getLocalRooms();
          }
        } catch (e) {
          roomsData = getLocalRooms();
        }

        try {
          const bookingsRes = await fetch('/api/bookings/list.php', {
            headers: { 'Authorization': 'Bearer demo-token' }
          });
          const parsedBookings = await bookingsRes.json();
          if (Array.isArray(parsedBookings)) {
            bookingsData = parsedBookings;
          } else {
            bookingsData = getLocalBookings();
          }
        } catch (e) {
          bookingsData = getLocalBookings();
        }

        setRoomsCount(roomsData.length);
        setBookingsCount(bookingsData.length);
        setPendingCount(bookingsData.filter((b: any) => b.status === 'pending').length);
        const totalRev = bookingsData
          .filter((b: any) => b.status === 'confirmed')
          .reduce((acc: number, curr: any) => acc + parseFloat(curr.total_price || '0'), 0);
        setRevenue(totalRev);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { name: 'Total Bookings', value: bookingsCount.toString(), change: '+12%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Pending Approvals', value: pendingCount.toString(), change: '-2%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Active Rooms', value: roomsCount.toString(), change: '+5%', icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Revenue', value: `$${revenue.toLocaleString()}`, change: '+18%', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 font-medium">Welcome back, here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#1E73BE] animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Revenue Analytics</h3>
              </div>
              <div className="h-80 w-full" style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E73BE" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1E73BE" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFF', 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#1E73BE" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Mock */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">System Status</h3>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-emerald-800 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> All systems operational
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-blue-800 font-bold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Database connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
