import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { ArrowRight, Star, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCardProps {
  service: Service;
  index: number;
  layout?: 'grid' | 'list';
}

export default function ServiceCard({ service, index, layout = 'grid' }: ServiceCardProps) {
  const isList = layout === 'list';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={isList ? "w-full" : "h-full"}
    >
      <Link 
        to={`/services/${service.id}`}
        className={`group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#F27D26] hover:shadow-2xl hover:shadow-[#F27D26]/5 transition-all duration-500 flex ${isList ? 'flex-col md:flex-row' : 'flex-col h-full'}`}
      >
        <div className={`relative overflow-hidden ${isList ? 'h-56 md:h-auto md:w-80 flex-shrink-0' : 'h-56'}`}>
          <img 
            src={service.image || `https://picsum.photos/seed/${service.id}/800/600`} 
            alt={service.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {service.category}
            </span>
            {service.expertName && (
              <span className="bg-[#F27D26]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center">
                <ShieldCheck size={12} className="mr-1" />
                Expert: {service.expertName}
              </span>
            )}
          </div>
        </div>

        <div className={`p-8 flex flex-col flex-grow ${isList ? 'md:flex-row md:items-center md:gap-12' : ''}`}>
          <div className={isList ? 'flex-grow' : ''}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold leading-tight group-hover:text-[#F27D26] transition-colors">
                {service.title}
              </h3>
              <div className="flex items-center text-[#F27D26] bg-[#F27D26]/5 px-2 py-1 rounded-lg">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold ml-1">{service.rating || '4.9'}</span>
              </div>
            </div>

            <p className="text-[#4A4A4A] text-sm line-clamp-2 mb-6 leading-relaxed">
              {service.description}
            </p>

            <div className={`space-y-3 mb-8 ${isList ? 'hidden lg:block' : ''}`}>
              {service.features?.slice(0, 3).map((feature, i) => (
                <div key={i} className="flex items-center text-xs text-[#4A4A4A]">
                  <CheckCircle2 size={14} className="text-[#F27D26] mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${isList ? 'md:w-48 md:border-l md:border-gray-50 md:pl-8' : 'mt-auto pt-6 border-t border-gray-50'} flex items-center justify-between md:flex-col md:items-start md:justify-center md:gap-4`}>
            <div>
              <span className="text-[#9E9E9E] text-xs uppercase font-bold tracking-widest block mb-1">Starting at</span>
              <span className="text-2xl font-black text-[#1A1A1A]">${service.price}</span>
            </div>
            <div 
              className="w-12 h-12 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center group-hover:bg-[#F27D26] transition-all duration-300 shadow-lg shadow-black/5"
            >
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
