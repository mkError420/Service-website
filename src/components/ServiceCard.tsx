import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { ArrowRight, Star, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#F27D26] hover:shadow-2xl hover:shadow-[#F27D26]/5 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={service.image || `https://picsum.photos/seed/${service.id}/800/600`} 
          alt={service.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {service.category}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold leading-tight group-hover:text-[#F27D26] transition-colors">
            {service.title}
          </h3>
          <div className="flex items-center text-[#F27D26] bg-[#F27D26]/5 px-2 py-1 rounded-lg">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold ml-1">4.9</span>
          </div>
        </div>

        <p className="text-[#4A4A4A] text-sm line-clamp-2 mb-6 leading-relaxed">
          {service.description}
        </p>

        <div className="space-y-3 mb-8">
          {service.features?.slice(0, 3).map((feature, i) => (
            <div key={i} className="flex items-center text-xs text-[#4A4A4A]">
              <CheckCircle2 size={14} className="text-[#F27D26] mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <div>
            <span className="text-[#9E9E9E] text-xs uppercase font-bold tracking-widest block mb-1">Starting at</span>
            <span className="text-2xl font-black text-[#1A1A1A]">${service.price}</span>
          </div>
          <Link 
            to={`/services/${service.id}`}
            className="w-12 h-12 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center group-hover:bg-[#F27D26] transition-all duration-300 shadow-lg shadow-black/5"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
