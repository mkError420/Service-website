import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or communicate with us. This includes your name, email address, and payment information.'
    },
    {
      icon: Lock,
      title: 'How We Use Your Data',
      content: 'We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about your account and our services.'
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.'
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can manage your account settings or contact us for assistance with these requests.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
        >
          Privacy <span className="text-[#F27D26]">Policy.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#4A4A4A] max-w-2xl mx-auto text-xl"
        >
          Last updated: March 28, 2026. Your privacy is our top priority.
        </motion.p>
      </div>

      <div className="space-y-12 mb-32">
        {sections.map((section, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 md:p-16 rounded-[48px] border border-gray-100 shadow-xl shadow-black/5"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-[#F27D26]/10 rounded-2xl flex items-center justify-center">
                <section.icon size={24} className="text-[#F27D26]" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">{section.title}</h2>
            </div>
            <p className="text-[#4A4A4A] text-lg leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 p-12 rounded-[48px] text-center">
        <h3 className="text-2xl font-bold mb-4">Questions about our privacy policy?</h3>
        <p className="text-[#4A4A4A] mb-8">If you have any questions or concerns, please don't hesitate to reach out to our privacy team.</p>
        <a href="/contact" className="text-[#F27D26] font-black text-lg hover:underline">Contact Privacy Team</a>
      </div>
    </div>
  );
}
