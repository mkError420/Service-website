import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth, signInWithGoogle, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Service } from '../types';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  ChevronLeft,
  Zap,
  CreditCard,
  Lock,
  X,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Home
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY) 
  : null;

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setGuestInfo(prev => ({
        ...prev,
        name: auth.currentUser?.displayName || '',
        email: auth.currentUser?.email || '',
      }));
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      const docRef = doc(db, 'services', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setService({ id: docSnap.id, ...docSnap.data() } as Service);
      }
      setLoading(false);
    };
    fetchService();
  }, [id]);

  const handleBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!service) return;

    setBooking(true);
    const orderData: any = {
      clientId: auth.currentUser?.uid || 'guest',
      serviceId: service.id,
      serviceTitle: service.title,
      price: service.price,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add guest info if provided or if guest
    const name = guestInfo.name || auth.currentUser?.displayName;
    if (name) orderData.guestName = name;

    const email = guestInfo.email || auth.currentUser?.email;
    if (email) orderData.guestEmail = email;

    if (guestInfo.phone) orderData.guestPhone = guestInfo.phone;
    if (guestInfo.projectDetails) orderData.projectDetails = guestInfo.projectDetails;

    // Add expert info if assigned
    if (service.expertId) {
      orderData.assignedExpertId = service.expertId;
      orderData.assignedExpertName = service.expertName;
    }

    console.log("Attempting to create order with data:", orderData);

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // If Stripe is configured, redirect to checkout
      if (stripePromise) {
        const loadingToast = toast.loading("Redirecting to secure payment...");
        
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serviceName: service.title,
              price: service.price,
              orderId: docRef.id,
              successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: window.location.href,
            }),
          });

          const session = await response.json();
          
          if (session.error) {
            throw new Error(session.error);
          }

          const stripe = await stripePromise;
          if (stripe) {
            const { error } = await (stripe as any).redirectToCheckout({
              sessionId: session.id,
            });
            if (error) throw error;
          }
          toast.dismiss(loadingToast);
        } catch (stripeError: any) {
          toast.dismiss(loadingToast);
          toast.error(`Payment initialization failed: ${stripeError.message}`);
          console.error("Stripe Error:", stripeError);
        }
      } else {
        // Fallback for demo if Stripe is not configured
        toast.success("Order created successfully! (Demo Mode)");
        setShowBookingForm(false);
        
        setTimeout(() => {
          if (auth.currentUser) {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-10 w-48 bg-gray-100 rounded-full mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[500px] bg-gray-100 rounded-[40px]" />
            <div className="h-12 w-3/4 bg-gray-100 rounded-2xl" />
            <div className="h-32 w-full bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-[600px] bg-gray-100 rounded-[40px]" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-black/5 p-12 text-center border border-gray-100"
        >
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-[#1A1A1A] mb-4 tracking-tight">Service Not Found</h2>
          <p className="text-[#9E9E9E] font-medium mb-10 leading-relaxed">
            The service you're looking for might have been removed or the link is incorrect.
          </p>
          <div className="flex flex-col space-y-4">
            <Link 
              to="/services" 
              className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center justify-center group"
            >
              Explore Services
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/" 
              className="w-full bg-gray-50 text-[#1A1A1A] py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center"
            >
              <Home size={20} className="mr-2" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        to="/services" 
        className="inline-flex items-center text-[#9E9E9E] hover:text-[#1A1A1A] font-bold mb-12 transition-colors group"
      >
        <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 aspect-video bg-gray-100"
          >
            <img 
              src={service.image || `https://picsum.photos/seed/${service.id}/1200/800`} 
              alt={service.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="space-y-8">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="bg-[#F27D26]/10 text-[#F27D26] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {service.category}
              </span>
              <div className="flex items-center text-[#F27D26] bg-[#F27D26]/5 px-3 py-1.5 rounded-xl">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-bold ml-1.5">4.9 (120+ Reviews)</span>
              </div>
              <div className="flex items-center text-[#4A4A4A] bg-gray-100 px-3 py-1.5 rounded-xl">
                <Clock size={16} className="mr-1.5" />
                <span className="text-sm font-bold">3-5 Days Delivery</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              {service.title}
            </h1>

            <div className="prose prose-lg max-w-none text-[#4A4A4A] leading-relaxed">
              <p className="text-xl font-medium text-[#1A1A1A] mb-6">
                Deliver high-quality results tailored to your specific needs.
              </p>
              <p>{service.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Zap size={20} className="text-[#F27D26] mr-2" />
                  What's Included
                </h3>
                <ul className="space-y-4">
                  {service.features?.map((feature, i) => (
                    <li key={i} className="flex items-start text-[#4A4A4A]">
                      <CheckCircle2 size={20} className="text-[#F27D26] mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-8 rounded-[32px]">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <ShieldCheck size={20} className="text-[#F27D26] mr-2" />
                  Our Guarantee
                </h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed mb-6">
                  We stand by our work. If you're not 100% satisfied with the initial delivery, we offer unlimited revisions until it's perfect.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Lock size={18} className="text-[#F27D26]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Secure Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          <div className="sticky top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-black/5"
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[#9E9E9E] text-xs uppercase font-bold tracking-widest block mb-1">Total Price</span>
                  <span className="text-5xl font-black text-[#1A1A1A]">${service.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#F27D26] text-xs font-bold uppercase tracking-widest block mb-1">Standard Package</span>
                  <span className="text-sm text-[#4A4A4A] font-medium">One-time payment</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <button 
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center justify-center group"
                >
                  Book Service Now
                  <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    if (!auth.currentUser) {
                      toast.error("Please sign in to contact an expert");
                      return;
                    }
                    navigate(`/chat?serviceId=${service.id}`);
                  }}
                  className="w-full bg-gray-50 text-[#1A1A1A] py-6 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all flex items-center justify-center"
                >
                  <MessageSquare size={20} className="mr-2" />
                  Contact Expert
                </button>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CreditCard size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Secure Checkout</p>
                    <p className="text-xs text-[#9E9E9E]">Powered by Stripe</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Fast Turnaround</p>
                    <p className="text-xs text-[#9E9E9E]">Average 4 days</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Expert Profile Mini */}
            {service.expertName && (
              <div className="mt-8 bg-[#1A1A1A] rounded-[40px] p-8 text-white flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#F27D26] bg-gray-800 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-[#F27D26]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#F27D26] mb-1">Assigned Expert</p>
                  <h4 className="text-xl font-bold">{service.expertName}</h4>
                  <p className="text-xs text-gray-400">Verified Professional</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowBookingForm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Complete Your Booking</h2>
                  <p className="text-[#9E9E9E] font-medium mt-1">No account required. We'll contact you via email.</p>
                </div>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={20} />
                      <input 
                        type="text" 
                        required
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#F27D26] transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={20} />
                      <input 
                        type="email" 
                        required
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#F27D26] transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={20} />
                    <input 
                      type="tel" 
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#F27D26] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] ml-1">Project Details</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-[#9E9E9E]" size={20} />
                    <textarea 
                      required
                      value={guestInfo.projectDetails}
                      onChange={(e) => setGuestInfo({...guestInfo, projectDetails: e.target.value})}
                      placeholder="Tell us more about your project requirements..."
                      rows={4}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#F27D26] transition-all font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={booking}
                    className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center justify-center group disabled:opacity-50"
                  >
                    {booking ? 'Processing...' : `Confirm Booking - $${service.price}`}
                    {!booking && <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
