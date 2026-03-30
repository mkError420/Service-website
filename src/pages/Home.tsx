import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { Service, Category } from '../types';
import ServiceCard from '../components/ServiceCard';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Code, 
  Monitor, 
  Video, 
  TrendingUp, 
  Star,
  Users,
  ShieldCheck,
  Zap,
  ChevronDown,
  Mail,
  Play,
  Layers,
  Rocket,
  Search
} from 'lucide-react';

const IconComponent = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon {...props} />;
};

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const qFeatured = query(collection(db, 'services'), where('active', '==', true), limit(3));
    const unsubFeatured = onSnapshot(qFeatured, (snapshot) => {
      setFeaturedServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      console.error("Firestore Error (featured):", error);
    });

    const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      console.error("Firestore Error (categories):", error);
    });

    const qAllServices = query(collection(db, 'services'), where('active', '==', true));
    const unsubAllServices = onSnapshot(qAllServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      console.error("Firestore Error (all services):", error);
    });

    return () => {
      unsubFeatured();
      unsubCategories();
      unsubAllServices();
    };
  }, []);

  const processSteps = [
    { title: 'Discovery', desc: 'We dive deep into your brand, goals, and target audience to build a solid foundation.', icon: Search },
    { title: 'Strategy', desc: 'Our experts craft a tailored roadmap designed for maximum impact and scalability.', icon: Layers },
    { title: 'Execution', desc: 'Precision-engineered development and creative work brought to life by our specialists.', icon: Code },
    { title: 'Launch', desc: 'Final optimization and deployment, followed by dedicated post-launch support.', icon: Rocket },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'CEO, TechFlow', text: 'ServiceHub Pro transformed our digital presence. Their attention to detail and technical expertise is unmatched.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Michael Chen', role: 'Founder, CreativePulse', text: 'The video editing team is incredible. They captured our brand voice perfectly and delivered ahead of schedule.', avatar: 'https://i.pravatar.cc/150?u=michael' },
    { name: 'Emma Davis', role: 'Marketing Director, GlobalScale', text: 'Our conversion rates tripled after we switched to their MERN stack solutions. Truly a game-changer.', avatar: 'https://i.pravatar.cc/150?u=emma' },
  ];

  const faqs = [
    { q: 'How long does a typical project take?', a: 'Project timelines vary based on complexity. A standard WordPress site might take 2 weeks, while a complex MERN application can take 8-12 weeks. We provide detailed timelines during discovery.' },
    { q: 'Do you offer post-launch support?', a: 'Yes, we offer various maintenance and support packages to ensure your digital assets continue to perform at their best long after launch.' },
    { q: 'Can I request custom features?', a: 'Absolutely. We specialize in custom solutions tailored to your specific business needs. No project is too complex for our team.' },
    { q: 'What is your pricing structure?', a: 'We offer both fixed-price packages for standard services and custom quotes for complex projects. All pricing is transparent with no hidden fees.' },
  ];

  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-[#F27D26]/10 text-[#F27D26] px-4 py-2 rounded-full mb-8">
                <Zap size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-widest">Premium Digital Solutions</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
                Build Your <br />
                <span className="text-[#F27D26]">Digital</span> Empire<span className="text-[#F27D26]">.</span>
              </h1>
              <p className="text-xl text-[#4A4A4A] mb-12 max-w-lg leading-relaxed">
                Expert services for modern brands. From high-performance web apps to cinematic video editing, we bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link 
                  to="/services" 
                  className="bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center justify-center group"
                >
                  Explore Services
                  <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
                <div className="flex items-center space-x-4 px-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center text-[#F27D26]">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                    <p className="font-bold text-[#1A1A1A]">500+ Happy Clients</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl shadow-black/20 aspect-[4/5] bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop" 
                  alt="Team working" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-bold">Project Delivery</span>
                      <span className="text-[#F27D26] font-bold">99%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '99%' }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-[#F27D26]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F27D26]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#1A1A1A]/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Logos Ticker */}
      <section className="max-w-full overflow-hidden py-12 border-y border-gray-100 bg-white">
        <p className="text-center text-[#9E9E9E] font-bold uppercase tracking-widest text-[10px] mb-8">Trusted by Industry Leaders</p>
        <div className="flex relative">
          <motion.div 
            className="flex whitespace-nowrap gap-20 md:gap-32 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {[
              { name: 'Google', color: '#4285F4' },
              { name: 'Microsoft', color: '#00A4EF' },
              { name: 'Amazon', color: '#FF9900' },
              { name: 'Meta', color: '#0668E1' },
              { name: 'Netflix', color: '#E50914' },
              { name: 'Apple', color: '#555555' },
              { name: 'Spotify', color: '#1DB954' },
              { name: 'Adobe', color: '#FF0000' },
              { name: 'Slack', color: '#4A154B' },
              { name: 'Salesforce', color: '#00A1E0' },
              { name: 'Tesla', color: '#E82127' },
              { name: 'SpaceX', color: '#1A1A1A' }
            ].concat([
              { name: 'Google', color: '#4285F4' },
              { name: 'Microsoft', color: '#00A4EF' },
              { name: 'Amazon', color: '#FF9900' },
              { name: 'Meta', color: '#0668E1' },
              { name: 'Netflix', color: '#E50914' },
              { name: 'Apple', color: '#555555' },
              { name: 'Spotify', color: '#1DB954' },
              { name: 'Adobe', color: '#FF0000' },
              { name: 'Slack', color: '#4A154B' },
              { name: 'Salesforce', color: '#00A1E0' },
              { name: 'Tesla', color: '#E82127' },
              { name: 'SpaceX', color: '#1A1A1A' }
            ]).map((brand, i) => (
              <span 
                key={i} 
                className="text-2xl md:text-4xl font-black tracking-tighter cursor-default px-4"
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Our Expertise<span className="text-[#F27D26]">.</span></h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto">
            We specialize in high-impact digital services that help your business stand out in a crowded marketplace.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 rounded-[32px] border border-gray-100 hover:border-[#F27D26] hover:bg-white hover:shadow-2xl hover:shadow-[#F27D26]/5 transition-all duration-500 cursor-pointer"
              onClick={() => window.location.href = `/services?cat=${cat.name}`}
            >
              <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-colors duration-500`} style={{ backgroundColor: `${cat.color}10` }}>
                <IconComponent name={cat.icon || 'Code'} size={32} style={{ color: cat.color }} />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-[#F27D26] transition-colors">{cat.name}</h3>
              <p className="text-[#9E9E9E] font-medium text-sm">
                {services.filter(s => s.category === cat.name).length}+ Services
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-[#1A1A1A] py-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Featured <br />Solutions<span className="text-[#F27D26]">.</span></h2>
              <p className="text-gray-400 max-w-md">
                Hand-picked services that are currently trending and delivering massive value to our clients.
              </p>
            </div>
            <Link to="/services" className="mt-8 md:mt-0 text-[#F27D26] font-bold flex items-center hover:underline group">
              View All Services <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredServices.length > 0 ? (
              featuredServices.map((service, i) => (
                <div key={service.id} className="text-[#1A1A1A]">
                  <ServiceCard service={service} index={i} />
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-white/5 rounded-[40px] border border-white/10">
                <p className="text-gray-400">No services available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How We Work<span className="text-[#F27D26]">.</span></h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto">
            A streamlined, transparent process designed to take your project from concept to reality with zero friction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {processSteps.map((step, i) => (
            <div key={i} className="relative">
              {i < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-[2px] bg-gray-100 -z-10" />
              )}
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 relative z-10">
                <div className="w-12 h-12 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center font-black mb-6">
                  0{i + 1}
                </div>
                <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                <p className="text-[#9E9E9E] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="bg-[#F27D26] p-1 rounded-[32px]">
                  <img src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/405230/567571_198506.jpeg" className="rounded-[30px] w-full aspect-square object-cover" alt="Team collaboration" referrerPolicy="no-referrer" />
                </div>
                <div className="bg-gray-100 p-8 rounded-[32px] text-center">
                  <h4 className="text-4xl font-black text-[#1A1A1A]">100%</h4>
                  <p className="text-sm text-[#4A4A4A] font-medium">Satisfaction</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] p-8 rounded-[32px] text-center text-white">
                  <h4 className="text-4xl font-black">24/7</h4>
                  <p className="text-sm text-gray-400 font-medium">Support</p>
                </div>
                <div className="bg-gray-100 p-1 rounded-[32px]">
                  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" className="rounded-[30px] w-full aspect-square object-cover" alt="Expert support" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-tight">Why Choose <br />ServiceHub Pro<span className="text-[#F27D26]">?</span></h2>
            <div className="space-y-8">
              {[
                { title: 'Expert Professionals', desc: 'Our team consists of industry veterans with years of experience.', icon: ShieldCheck },
                { title: 'Quality Guaranteed', desc: 'We don\'t just deliver; we ensure every pixel and line of code is perfect.', icon: CheckCircle2 },
                { title: 'Fast Delivery', desc: 'Time is money. We optimize our workflows to deliver results faster.', icon: Zap },
                { title: 'Dedicated Support', desc: 'Direct communication with the experts working on your project.', icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-[#F27D26]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-[#F27D26]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-[#4A4A4A] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-32 rounded-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Client Stories<span className="text-[#F27D26]">.</span></h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our partners have to say about working with us.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{t.name}</h4>
                    <p className="text-xs text-[#9E9E9E] font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
                <p className="text-[#4A4A4A] leading-relaxed italic">"{t.text}"</p>
                <div className="flex mt-6 text-[#F27D26]">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Common Questions<span className="text-[#F27D26]">.</span></h2>
          <p className="text-[#4A4A4A]">Everything you need to know about our services and process.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-bold text-[#1A1A1A]">{faq.q}</span>
                <ChevronDown className={`text-[#F27D26] transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-0 text-[#4A4A4A] leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1A1A] rounded-[60px] p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Stay Ahead of the <span className="text-[#F27D26]">Curve.</span></h2>
            <p className="text-gray-400 text-lg">Get the latest digital insights, trends, and exclusive offers delivered straight to your inbox.</p>
          </div>
          <div className="relative z-10 w-full max-w-md">
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-[#F27D26] outline-none transition-all"
              />
              <button className="bg-[#F27D26] text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-[#1A1A1A] transition-all flex items-center justify-center">
                Subscribe <Mail className="ml-2" size={18} />
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-4 text-center sm:text-left">We respect your privacy. Unsubscribe at any time.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F27D26]/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-[#F27D26] rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to Scale Your <br />Business?</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Join hundreds of successful businesses that trust ServiceHub Pro for their digital needs.
            </p>
            <Link 
              to="/services" 
              className="inline-flex items-center bg-white text-[#1A1A1A] px-12 py-6 rounded-3xl text-xl font-bold hover:bg-[#1A1A1A] hover:text-white transition-all shadow-2xl shadow-black/10"
            >
              Start Your Project <ArrowRight className="ml-3" />
            </Link>
          </div>
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-48 -mb-48" />
        </div>
      </section>
    </div>
  );
}
