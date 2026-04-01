import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { ArrowRight, Star, CheckCircle2, ShieldCheck, TrendingUp, Plus } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ServiceCardProps {
  service: Service;
  index: number;
  layout?: 'grid' | 'list';
}

export default function ServiceCard({ service, index, layout = 'grid' }: ServiceCardProps) {
  const isList = layout === 'list';
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(242, 125, 38, 0.06), transparent 40%)`
  );

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={isList ? "w-full" : "h-full"}
    >
      <Link 
        to={`/services/${service.id}`}
        className={`group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-[0_48px_96px_-12px_rgba(0,0,0,0.1)] transition-all duration-700 flex ${isList ? 'flex-col md:flex-row' : 'flex-col h-full'}`}
      >
        {/* Spotlight Effect Overlay */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlightBg }}
        />

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Subtle Background Glow on Hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#F27D26] to-[#FF9D5C] rounded-[2.1rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 -z-10" />

        {/* Image Section */}
        <div className={`relative overflow-hidden z-10 ${isList ? 'h-48 md:h-auto md:w-[320px] flex-shrink-0' : 'h-40'}`}>
          <img 
            src={service.image || `https://picsum.photos/seed/${service.id}/800/600`} 
            alt={service.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-1.5">
              <span className="bg-white/95 backdrop-blur-md text-[#1A1A1A] px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-sm">
                {service.category}
              </span>
              {service.rating && (
                <div className="bg-[#1A1A1A]/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[7px] font-bold flex items-center gap-1 shadow-sm">
                  <Star size={7} fill="#F27D26" className="text-[#F27D26]" />
                  <span>{service.rating}</span>
                </div>
              )}
            </div>
            {service.expertName && (
              <span className="bg-[#F27D26] text-white px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#F27D26]/30 flex items-center w-fit">
                <ShieldCheck size={9} className="mr-1" />
                {service.expertName}
              </span>
            )}
          </div>

          {/* Hover Action Content */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-between text-white z-10">
            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#F27D26] mb-0.5">Exclusive</span>
              <span className="text-[10px] font-bold tracking-tight">Details</span>
            </div>
            <div className="w-8 h-8 bg-white text-[#1A1A1A] rounded-lg flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
              <Plus size={14} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`p-5 md:p-6 flex flex-col flex-grow z-10 ${isList ? 'md:justify-center' : ''}`}>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-[#F27D26]/10 rounded-md flex items-center justify-center">
                <TrendingUp size={9} className="text-[#F27D26]" />
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#9E9E9E]">Premium</span>
            </div>
            
            <h3 className="font-display text-xl md:text-2xl font-bold leading-[1.1] mb-2 group-hover:text-[#F27D26] transition-colors duration-500 tracking-[-0.04em] text-[#1A1A1A]">
              {service.title}
            </h3>

            <p className="text-[#4A4A4A] text-[10px] line-clamp-2 mb-4 leading-relaxed font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              {service.description}
            </p>

            {/* Features Grid */}
            <div className={`grid grid-cols-1 gap-1.5 mb-4 ${isList ? 'md:grid-cols-2' : ''}`}>
              {service.features?.slice(0, 2).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-[7px] font-black text-[#1A1A1A] bg-gray-50/50 p-2 rounded-lg border border-gray-100/50 group-hover:bg-white group-hover:border-[#F27D26]/20 transition-all duration-500">
                  <div className="w-4 h-4 bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-50">
                    <CheckCircle2 size={8} className="text-[#F27D26]" />
                  </div>
                  <span className="truncate uppercase tracking-[0.05em]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Section */}
          <div className={`flex items-center justify-between pt-4 border-t border-gray-50 ${isList ? 'md:border-t-0 md:pt-0 md:border-l md:pl-6 md:ml-auto md:w-40 md:flex-col md:items-start md:justify-center md:gap-2' : ''}`}>
            <div>
              <span className="text-[#9E9E9E] text-[7px] font-black uppercase tracking-[0.4em] block mb-1">Investment</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#1A1A1A] tracking-tighter">${service.price}</span>
                <span className="text-[8px] font-black text-[#9E9E9E] uppercase tracking-[0.3em]">USD</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 text-[#1A1A1A] group-hover:text-[#F27D26] font-black text-[7px] uppercase tracking-[0.3em] transition-colors duration-500 ${isList ? 'md:mt-0.5' : ''}`}>
              <span>Book</span>
              <div className="w-7 h-7 rounded-md border border-gray-100 flex items-center justify-center group-hover:border-[#F27D26] group-hover:bg-[#F27D26] group-hover:text-white transition-all duration-500">
                <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
