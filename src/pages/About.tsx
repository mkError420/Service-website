import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Target, Users, Award, Zap, Linkedin, Twitter } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { TeamMember, Settings as PlatformSettings } from '../types';

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    const unsubTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as PlatformSettings);
      }
    });

    return () => {
      unsubTeam();
      unsubSettings();
    };
  }, []);

  const stats = [
    { label: 'Projects Completed', value: '1,200+' },
    { label: 'Happy Clients', value: '450+' },
    { label: 'Expert Team', value: '25+' },
    { label: 'Years Experience', value: '8+' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower businesses by providing high-end digital solutions that drive growth and innovation in an ever-evolving digital landscape.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our team consists of industry-leading developers, designers, and marketers dedicated to delivering excellence in every project.'
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'We never compromise on quality. Every line of code and every pixel is crafted with precision and care.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We stay ahead of the curve, utilizing the latest technologies and trends to ensure our clients always have a competitive edge.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
        >
          We Build Digital <span className="text-[#F27D26]">Excellence.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#4A4A4A] max-w-3xl mx-auto text-xl leading-relaxed"
        >
          ServicesHub Pro is a premier digital agency dedicated to transforming ideas into powerful digital realities. We specialize in high-end development, creative editing, and strategic marketing.
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 text-center"
          >
            <h3 className="text-4xl font-black text-[#1A1A1A] mb-2">{stat.value}</h3>
            <p className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
        <div className="space-y-8">
          <h2 className="text-4xl font-black tracking-tight">Why Choose <span className="text-[#F27D26]">{settings?.platformName || 'ServicesHub'}?</span></h2>
          <p className="text-[#4A4A4A] text-lg leading-relaxed">
            We don't just provide services; we build partnerships. Our approach is rooted in understanding your unique business needs and delivering solutions that exceed expectations.
          </p>
          <div className="pt-8">
            <img 
              src="https://picsum.photos/seed/agency/800/600" 
              alt="Our Team" 
              className="rounded-[40px] shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {values.map((value, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-start space-x-6"
            >
              <div className="w-14 h-14 bg-[#F27D26]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <value.icon size={28} className="text-[#F27D26]" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div id="team" className="mb-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Meet Our <span className="text-[#F27D26]">Experts.</span></h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto">
            A diverse team of specialists committed to delivering high-performance digital solutions.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.length > 0 ? (
            teamMembers.map((member, i) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-[#F27D26]/10 transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                    <div className="flex space-x-4">
                      {member.socials.linkedin && (
                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F27D26] hover:text-white transition-all">
                          <Linkedin size={18} />
                        </a>
                      )}
                      {member.socials.twitter && (
                        <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F27D26] hover:text-white transition-all">
                          <Twitter size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <h4 className="text-xl font-black text-[#1A1A1A] mb-1">{member.name}</h4>
                  <p className="text-xs font-bold text-[#F27D26] uppercase tracking-widest mb-4">{member.role}</p>
                  <p className="text-sm text-[#4A4A4A] line-clamp-2 mb-6">{member.bio}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.specialties.slice(0, 3).map((spec, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-3 py-1 bg-gray-50 text-[#9E9E9E] rounded-full uppercase tracking-tighter">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            [1, 2, 3, 4].map((_, i) => (
              <div key={i} className="bg-gray-50 aspect-square rounded-[40px] animate-pulse" />
            ))
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1A1A1A] rounded-[48px] p-12 md:p-20 text-center text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F27D26] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F27D26] rounded-full blur-[120px]" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight relative z-10">Ready to start your <br /> next big project?</h2>
        <Link to="/contact" className="relative z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#F27D26] text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-white hover:text-[#1A1A1A] transition-all shadow-2xl shadow-[#F27D26]/20"
          >
            Let's Talk
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
