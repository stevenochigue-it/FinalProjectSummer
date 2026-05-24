import { useState } from 'react';
import { HelpCircle, Search, Calendar, CreditCard, XCircle, ArrowRight, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';

interface FAQItem {
  id: string;
  category: 'booking' | 'payments' | 'cancellations' | 'checkin';
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'b1',
    category: 'booking',
    question: 'How do I choose and book a hotel room?',
    answer: 'Simply navigate to our "Rooms" catalog page. Click on any room category that fits your needs to view its details, size, and features. From there, click "Book Now" to load the room into our visual reservation stepper form.'
  },
  {
    id: 'b2',
    category: 'booking',
    question: 'What is the maximum room capacity?',
    answer: 'Room capacities range from 3-4 guests in our Standard Rooms up to 10 guests in our spacious Family Rooms. Each room category displays its exact guest capacity on its details card. During booking, the system will automatically prevent you from selecting guest numbers that exceed a room\'s physical limits.'
  },
  {
    id: 'p1',
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major international credit and debit cards, including Visa, MasterCard, and American Express. All payment transactions are secure and encrypted. We do not store your full card number on our servers.'
  },
  {
    id: 'p2',
    category: 'payments',
    question: 'Are taxes and fees included in the price?',
    answer: 'The initial room price listed is the base room charge per night. In Step 3 (Confirmation) of the booking process, we show a full invoice breakdown including the local hospitality tax (12%) and service charges before you finalize your reservation. No hidden fees!'
  },
  {
    id: 'c1',
    category: 'cancellations',
    question: 'What is your room cancellation policy?',
    answer: 'You can cancel or modify any reservation up to 48 hours prior to your scheduled check-in time without any penalty fees. Cancellations made within 48 hours of check-in may incur a charge equivalent to one night\'s room rate.'
  },
  {
    id: 'c2',
    category: 'cancellations',
    question: 'How do I cancel or modify my existing booking?',
    answer: 'To cancel or change a booking, please contact our 24/7 Front Desk support at reservations@marianhotel.com or call +1 (555) 123-4568. Please have your full guest name and booking dates ready for authentication.'
  },
  {
    id: 'ci1',
    category: 'checkin',
    question: 'What are the standard check-in and check-out times?',
    answer: 'Standard check-in begins at 2:00 PM (14:00) on your date of arrival. Standard check-out time is before 12:00 PM (noon) on your date of departure. If you require early check-in or late check-out, please message us in advance.'
  },
  {
    id: 'ci2',
    category: 'checkin',
    question: 'What documents do I need to present at check-in?',
    answer: 'For safety and identity verification, guests must present a valid government-issued photo ID (passport, national ID, or driver\'s license) and the credit card used during reservation. A small security hold may be temporarily placed on your card.'
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'text-[#1E73BE] bg-blue-50' },
    { id: 'booking', name: 'Bookings & Capacity', icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'payments', name: 'Rates & Payments', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'cancellations', name: 'Cancellations', icon: XCircle, color: 'text-rose-600 bg-rose-50' },
    { id: 'checkin', name: 'Check-In Policy', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <HelpCircle className="w-8 h-8 text-[#1E73BE]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: '#1E73BE' }}>
          Help & Support Center
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find answers, review booking guidelines, and explore hotel policies instantly.
        </p>
      </div>

      {/* Dynamic Search Bar */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by keyword (e.g. cancellation, taxes, check-in)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setExpandedId(null); // Close active drawer on search
          }}
          className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/30 transition-all text-gray-700 placeholder-gray-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2.5 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedId(null); // Close active drawer on change
              }}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold transition-all border ${
                isActive 
                  ? 'border-[#1E73BE] bg-[#1E73BE] text-white shadow-md hover:scale-[1.02]' 
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accordion FAQ Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>Frequently Asked Questions</span>
            <span className="text-sm font-semibold bg-blue-50 text-[#1E73BE] px-2.5 py-0.5 rounded-full">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-4 text-gray-400 opacity-65" />
              <p className="font-bold text-lg text-slate-700">No questions match your query.</p>
              <p className="text-sm mt-1 text-gray-500">Try searching for other terms or choose another topic category above.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-[#1E73BE] shadow-md ring-1 ring-[#1E73BE]/10' 
                      : 'border-slate-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex items-center justify-between text-left px-6 py-5 focus:outline-none"
                  >
                    <span className="font-bold text-slate-800 pr-4">{faq.question}</span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all bg-slate-50 text-slate-500 ${
                      isExpanded ? 'bg-blue-50 text-[#1E73BE] rotate-180' : ''
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-64 opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <p className="p-6 text-slate-600 leading-relaxed text-sm bg-slate-50/50">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Support Center */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Still Need Help?</h3>
              <p className="text-sm text-gray-500">
                Our customer experience team and 24/7 front desk representatives are here to make your booking flawless.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E73BE]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Support</p>
                  <a href="mailto:reservations@marianhotel.com" className="text-sm font-bold text-slate-700 hover:underline">
                    reservations@marianhotel.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Call Front Desk</p>
                  <a href="tel:+15551234568" className="text-sm font-bold text-slate-700 hover:underline">
                    +1 (555) 123-4568
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Contact Form</p>
                  <Link to="/contact" className="text-sm font-bold text-[#1E73BE] flex items-center gap-1 hover:underline">
                    <span>Send Message</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/reservation"
                className="inline-flex w-full items-center justify-center gap-2 bg-[#1E73BE] hover:bg-[#155a96] text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                <span>Book a Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
