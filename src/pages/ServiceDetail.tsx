import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth, signInWithGoogle } from '../firebase';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { Service, Review } from '../types';
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
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

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

  const handleBooking = async () => {
    if (!auth.currentUser) {
      toast.error("Please sign in to book a service");
      await signInWithGoogle();
      return;
    }

    if (!service) return;

    setBooking(true);
    try {
      // Create order in Firestore
      const orderData = {
        clientId: auth.currentUser.uid,
        serviceId: service.id,
        serviceTitle: service.title,
        price: service.price,
        status: 'pending',
        assignedExpertId: service.expertId || null,
        assignedExpertName: service.expertName || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Simulate Stripe Checkout
      toast.success("Order created! Redirecting to checkout...");
      
      // In a real app, we'd call our backend to create a Stripe session
      /*
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: service.title,
          price: service.price,
          orderId: docRef.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/services/${service.id}?cancelled=true`
        })
      });
      const session = await response.json();
      const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY!);
      await stripe?.redirectToCheckout({ sessionId: session.id });
      */

      // For demo, we'll just navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error("Booking failed", error);
      toast.error("Failed to create order. Please try again.");
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
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-4xl font-black mb-6">Service Not Found</h2>
        <Link to="/services" className="text-[#F27D26] font-bold hover:underline">Back to Services</Link>
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
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center justify-center group disabled:opacity-50"
                >
                  {booking ? 'Processing...' : 'Book Service Now'}
                  {!booking && <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />}
                </button>
                <button className="w-full bg-gray-50 text-[#1A1A1A] py-6 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all flex items-center justify-center">
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
    </div>
  );
}
