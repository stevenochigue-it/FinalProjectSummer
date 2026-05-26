import { Link } from 'react-router';
import { ArrowLeft, Shield, Scale } from 'lucide-react';

export default function TermsAndPrivacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="mb-8">
        <Link
          to="/reservation"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1E73BE] transition-colors text-sm font-semibold mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Booking
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          Legal Agreements
        </h1>
        <p className="text-slate-500 font-medium">
          Terms of Service and Privacy Policy for Marian Hotel.
        </p>
      </div>

      <div className="space-y-12">
        {/* Terms of Service Section */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F4FC] flex items-center justify-center">
              <Scale className="w-6 h-6 text-[#1E73BE]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
              <p className="text-xs text-slate-400 font-medium">Last updated: May 26, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
            <p>
              Welcome to the <strong>Marian Hotel Reservation System</strong>. By accessing or using our simulated booking system, you agree to comply with and be bound by the following terms and conditions:
            </p>
            
            <h3 className="font-bold text-slate-800 text-base pt-2">1. Booking Simulation & Educational Purpose</h3>
            <p>
              Marian Hotel is a standalone educational project built for the Hospitality Management Program at St. Rita's College of Balingasag. All bookings, reservation entries, and payment flows generated through this application are 100% simulated mock data stored locally in your browser. No real-world financial transactions are executed, and no physical hotel rooms are reserved.
            </p>

            <h3 className="font-bold text-slate-800 text-base pt-2">2. Accuracy of Information</h3>
            <p>
              Guests are responsible for entering reasonable placeholder contact details during the mock registration process. Marian Hotel does not verify standard email addresses or phone configurations for validity.
            </p>

            <h3 className="font-bold text-slate-800 text-base pt-2">3. User Conduct</h3>
            <p>
              You agree to use this platform in good faith to test room selection, reserve mock inventory, and inspect administrative dashboards. Any attempt to disrupt system memory or database state is discouraged.
            </p>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
              <p className="text-xs text-slate-400 font-medium">Last updated: May 26, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
            <p>
              At Marian Hotel, we value your privacy. This Privacy Policy details how we handle information inside our simulated reservation platform.
            </p>

            <h3 className="font-bold text-slate-800 text-base pt-2">1. Zero External Data Collection</h3>
            <p>
              We do not transmit, collect, upload, or sell any personal or booking details entered into this application. All guest names, emails, phones, and reservation states are persisted purely inside your browser's private client-side <strong>localStorage</strong> engine.
            </p>

            <h3 className="font-bold text-slate-800 text-base pt-2">2. Local Browser Storage</h3>
            <p>
              The booking system uses standard Web Storage API (`localStorage`) to record reservation entries. You may purge all saved mock guest data and room states at any time by clearing your browser's cookies and site data.
            </p>

            <h3 className="font-bold text-slate-800 text-base pt-2">3. Security Simulation</h3>
            <p>
              While we simulate input validation and registration checks to mirror premium industry standards, mock financial data (such as mock card credentials or simulated GCash details) is never stored permanently.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
