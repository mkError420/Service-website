import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { Offer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function OfferPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const q = query(
      collection(db, 'offers'),
      where('active', '==', true),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const offerData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Offer;
        
        if (offerData.expiryDate && offerData.expiryDate.toDate() < new Date()) {
          setOffer(null);
          return;
        }

        setOffer(offerData);
      } else {
        setOffer(null);
        setIsVisible(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'offers');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && offer) {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 9000);

        return () => clearTimeout(hideTimer);
      }, 1000);

      return () => clearTimeout(showTimer);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname, offer]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const copyToClipboard = () => {
    if (offer) {
      navigator.clipboard.writeText(offer.promoCode);
      setCopied(true);
      toast.success('Promo code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!offer) return null;

  const hasImage = offer.imageUrl && offer.imageUrl.trim() !== '';

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white w-full ${hasImage ? 'max-w-2xl' : 'max-w-lg'} rounded-[40px] md:rounded-[48px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative border border-white/20 max-h-[95vh] overflow-y-auto scrollbar-hide`}
          >
            {/* Auto-dismiss Progress Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 9, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1.5 bg-[#F27D26] z-20"
            />

            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-2 md:p-3 bg-white/80 backdrop-blur-md text-gray-400 hover:text-[#1A1A1A] hover:scale-110 rounded-2xl transition-all z-30 shadow-sm border border-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row h-full min-h-[700px] md:min-h-0">
              {/* Image Section */}
              {hasImage && (
                <div className="md:w-[45%] h-[380px] md:h-auto relative overflow-hidden group">
                  <motion.img
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/${offer.id}/800/1200`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F27D26]/40 to-transparent mix-blend-overlay" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Live Offer</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className={`flex-1 p-8 md:p-14 flex flex-col justify-center relative ${!hasImage ? 'text-center items-center' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, x: hasImage ? 20 : 0, y: hasImage ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={`flex items-center space-x-3 mb-4 md:mb-6 ${!hasImage ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F27D26] rounded-xl flex items-center justify-center shadow-lg shadow-[#F27D26]/20">
                      <Tag size={18} className="text-white" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#F27D26]">Limited Time</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-[1.1] mb-4 md:mb-6 tracking-tight">
                    Get <span className="text-[#F27D26]">{offer.discountPercentage}%</span> Off Today
                  </h2>
                  
                  <p className="text-[#4A4A4A] text-base md:text-lg font-medium mb-8 md:mb-10 leading-relaxed opacity-80">
                    {offer.description}
                  </p>

                  <div className="space-y-4 md:space-y-6 w-full">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#F27D26] to-[#ff9d52] rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative p-4 md:p-5 bg-gray-50 rounded-[22px] border border-gray-100 flex items-center justify-between transition-all group-hover:bg-white">
                        <div className="text-left">
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#9E9E9E] mb-1 md:mb-1.5">Your Promo Code</p>
                          <p className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-widest">{offer.promoCode}</p>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="relative overflow-hidden group/btn px-4 md:px-6 py-3 md:py-4 bg-[#1A1A1A] text-white rounded-xl font-bold transition-all hover:bg-[#F27D26] active:scale-95 flex items-center space-x-2 text-sm md:text-base"
                        >
                          {copied ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
                              <Check size={18} />
                              <span>Copied</span>
                            </motion.div>
                          ) : (
                            <>
                              <Copy size={18} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleDismiss}
                      className="w-full py-5 md:py-6 bg-[#1A1A1A] text-white rounded-[24px] text-base md:text-lg font-black uppercase tracking-widest hover:bg-[#F27D26] transition-all shadow-2xl shadow-black/10 hover:shadow-[#F27D26]/20 hover:-translate-y-1 active:translate-y-0"
                    >
                      Claim Discount Now
                    </button>
                  </div>
                  
                  {offer.expiryDate && (
                    <div className="flex items-center justify-center space-x-2 mt-8 opacity-40">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                        Expires {offer.expiryDate.toDate().toLocaleDateString()}
                      </p>
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
