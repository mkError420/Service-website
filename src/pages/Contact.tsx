import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        uid: user?.uid || null,
        status: 'new',
        createdAt: Timestamp.now()
      });
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contact_messages');
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@serviceshub.pro', description: 'Our support team is here to help.' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', description: 'Mon-Fri from 9am to 6pm.' },
    { icon: MapPin, label: 'Office', value: '123 Digital Avenue, NY', description: 'Visit our creative studio.' },
    { icon: Clock, label: 'Working Hours', value: '24/7 Support', description: 'Always available for our clients.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
        >
          Get in <span className="text-[#F27D26]">Touch.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#4A4A4A] max-w-2xl mx-auto text-xl"
        >
          Have a project in mind or just want to say hello? We'd love to hear from you.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          {contactInfo.map((info, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-start space-x-6"
            >
              <div className="w-14 h-14 bg-[#F27D26]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <info.icon size={28} className="text-[#F27D26]" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#9E9E9E] mb-1">{info.label}</p>
                <h4 className="text-lg font-bold mb-1">{info.value}</h4>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{info.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-16 rounded-[48px] border border-gray-100 shadow-2xl shadow-black/5"
          >
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center">
                <MessageSquare size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">Send a Mail</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A] ml-2 tracking-tight">Your Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1A1A1A] ml-2 tracking-tight">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1A1A] ml-2 tracking-tight">Subject</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A1A1A] ml-2 tracking-tight">Message</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium resize-none"
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
