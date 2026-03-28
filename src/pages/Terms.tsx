import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.'
    },
    {
      icon: CheckCircle,
      title: 'Use License',
      content: 'Permission is granted to temporarily download one copy of the materials on ServicesHub Pro\'s website for personal, non-commercial transitory viewing only.'
    },
    {
      icon: AlertCircle,
      title: 'Disclaimer',
      content: 'The materials on ServicesHub Pro\'s website are provided on an \'as is\' basis. ServicesHub Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      icon: HelpCircle,
      title: 'Limitations',
      content: 'In no event shall ServicesHub Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ServicesHub Pro\'s website.'
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
          Terms of <span className="text-[#F27D26]">Service.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#4A4A4A] max-w-2xl mx-auto text-xl"
        >
          Last updated: March 28, 2026. Please read these terms carefully.
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
        <h3 className="text-2xl font-bold mb-4">Need clarification on our terms?</h3>
        <p className="text-[#4A4A4A] mb-8">Our team is happy to help you understand any part of our service agreement.</p>
        <a href="/contact" className="text-[#F27D26] font-black text-lg hover:underline">Contact Legal Team</a>
      </div>
    </div>
  );
}
