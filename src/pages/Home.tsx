import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, limit, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { Service, Category, Testimonial, Settings as PlatformSettings } from '../types';
import ServiceCard from '../components/ServiceCard';
import { motion, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showShowreel, setShowShowreel] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    },
    [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, testimonials]);

  useEffect(() => {
    const qFeatured = query(collection(db, 'services'), where('active', '==', true), limit(3));
    const unsubFeatured = onSnapshot(qFeatured, (snapshot) => {
      setFeaturedServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services/featured');
    });

    const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    const qAllServices = query(collection(db, 'services'), where('active', '==', true));
    const unsubAllServices = onSnapshot(qAllServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services/all');
    });

    const qTestimonials = query(collection(db, 'testimonials'), where('featured', '==', true), limit(10));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      const fetchedTestimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      console.log("Testimonials fetched:", fetchedTestimonials.length);
      setTestimonials(fetchedTestimonials);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'testimonials');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        console.log("Settings fetched:", doc.data());
        setSettings(doc.data() as PlatformSettings);
      } else {
        console.warn("Settings document 'config' not found.");
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });

    return () => {
      unsubFeatured();
      unsubCategories();
      unsubAllServices();
      unsubTestimonials();
      unsubSettings();
    };
  }, []);

  const processSteps = [
    { title: 'Discovery', desc: 'We dive deep into your brand, goals, and target audience to build a solid foundation.', icon: Search },
    { title: 'Strategy', desc: 'Our experts craft a tailored roadmap designed for maximum impact and scalability.', icon: Layers },
    { title: 'Execution', desc: 'Precision-engineered development and creative work brought to life by our specialists.', icon: Code },
    { title: 'Launch', desc: 'Final optimization and deployment, followed by dedicated post-launch support.', icon: Rocket },
  ];

  const faqs = [
    { q: 'How long does a typical project take?', a: 'Project timelines vary based on complexity. A standard WordPress site might take 2 weeks, while a complex MERN application can take 8-12 weeks. We provide detailed timelines during discovery.' },
    { q: 'Do you offer post-launch support?', a: 'Yes, we offer various maintenance and support packages to ensure your digital assets continue to perform at their best long after launch.' },
    { q: 'Can I request custom features?', a: 'Absolutely. We specialize in custom solutions tailored to your specific business needs. No project is too complex for our team.' },
    { q: 'What is your pricing structure?', a: 'We offer both fixed-price packages for standard services and custom quotes for complex projects. All pricing is transparent with no hidden fees.' },
  ];

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-32 pb-20">
      {/* Showreel Modal */}
      <AnimatePresence>
        {showShowreel && settings?.showreelUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowShowreel(false)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
              >
                <LucideIcons.X size={24} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(settings.showreelUrl)}?autoplay=1&mute=0&rel=0&playsinline=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -z-10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#F27D26]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="h-px w-8 bg-[#F27D26]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26]">
                  Premier Digital Agency
                </span>
              </div>
              
              <h1 className="font-display text-7xl md:text-8xl lg:text-[110px] font-black leading-[0.85] tracking-[-0.05em] mb-10 text-[#1A1A1A]">
                Elevate <br />
                <span className="text-gray-300">Your</span> Brand<span className="text-[#F27D26]">.</span>
              </h1>
              
              <div className="max-w-lg">
                <p className="text-lg text-[#4A4A4A] mb-12 leading-relaxed font-medium">
                  We provide All digital solutions, including web & App, with modern UI/UX 
                  design, and creative digital content. Our team helps businesses build high-performance websites, improve online visibility, and create engaging user experiences that convert visitors into customers.
                </p>
                
                <div className="flex flex-wrap gap-6">
                  <Link 
                    to="/services" 
                    className="bg-[#1A1A1A] text-white px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#F27D26] transition-all flex items-center group"
                  >
                    Get Started
                    <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18} />
                  </Link>
                  <button 
                    onClick={() => setShowShowreel(true)}
                    className="flex items-center space-x-4 group"
                  >
                    <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#F27D26] transition-colors">
                      <Play size={18} className="text-[#1A1A1A] group-hover:text-[#F27D26] fill-current" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Watch More</span>
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-20 pt-12 border-t border-gray-100 flex flex-wrap gap-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Success Rate</p>
                  <p className="text-3xl font-black text-[#1A1A1A]">99.8%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Active Projects</p>
                  <p className="text-3xl font-black text-[#1A1A1A]">45+</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Global Clients</p>
                  <p className="text-3xl font-black text-[#1A1A1A]">200+</p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Composition */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop" 
                  alt="Modern Software Development" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/40 via-transparent to-transparent" />
              </div>

              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[200px]"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-[#F27D26]/10 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-[#F27D26]" />
                  </div>
                  <span className="text-xs font-bold">Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-[#F27D26]" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">+24% Growth</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-8 -right-8 bg-[#1A1A1A] p-6 rounded-3xl shadow-2xl text-white max-w-[220px]"
              >
                <div className="flex -space-x-3 mb-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold leading-tight">Join 500+ professionals building with us.</p>
              </motion.div>

              {/* Vertical Rail Text */}
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden xl:block">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 rotate-90 origin-center whitespace-nowrap">
                  ESTABLISHED MMXXIV — GLOBAL REACH
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="font-display text-5xl md:text-7xl font-black mb-8 tracking-[-0.05em] leading-[0.9]">Our Expertise<span className="text-[#F27D26]">.</span></h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto text-xl font-medium opacity-60">
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
      <section className="bg-[#1A1A1A] py-40 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <div>
              <h2 className="font-display text-5xl md:text-7xl font-black mb-8 tracking-[-0.05em] leading-[0.9]">Featured <br />Solutions<span className="text-[#F27D26]">.</span></h2>
              <p className="text-gray-400 max-w-md text-lg font-medium opacity-60">
                Hand-picked services that are currently trending and delivering massive value to our clients.
              </p>
            </div>
            <Link to="/services" className="mt-8 md:mt-0 text-[#F27D26] font-black text-xs uppercase tracking-[0.3em] flex items-center hover:underline group">
              All Services <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {processSteps.map((step, i) => (
            <div key={i} className="relative">
              {i < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gray-100 -z-10" />
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
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" className="rounded-[30px] w-full aspect-square object-cover" alt="Tech Team Collaboration" referrerPolicy="no-referrer" />
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
                  <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" className="rounded-[30px] w-full aspect-square object-cover" alt="IT Support Specialists" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-tight">Why Choose <br />{settings?.platformName || 'ServiceHub Pro'}<span className="text-[#F27D26]">?</span></h2>
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

          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {(testimonials.length > 0 ? testimonials : [
                { id: 'f1', name: 'Sarah Johnson', role: 'CEO, TechFlow', content: 'ServiceHub Pro transformed our digital presence. Their attention to detail and technical expertise is unmatched.', avatar: 'https://i.pravatar.cc/150?u=sarah', rating: 5 },
                { id: 'f2', name: 'Michael Chen', role: 'Founder, CreativePulse', content: 'The video editing team is incredible. They captured our brand voice perfectly and delivered ahead of schedule.', avatar: 'https://i.pravatar.cc/150?u=michael', rating: 5 },
                { id: 'f3', name: 'Emma Davis', role: 'Marketing Director, GlobalScale', content: 'Our conversion rates tripled after we switched to their MERN stack solutions. Truly a game-changer.', avatar: 'https://i.pravatar.cc/150?u=emma', rating: 5 },
              ]).map((t) => (
                <div key={t.id} className="embla__slide py-4">
                  <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-gray-100 h-full flex flex-col select-none">
                    <div className="flex items-center space-x-4 mb-8">
                      <img 
                        src={t.avatar} 
                        alt={t.name} 
                        className="w-14 h-14 rounded-2xl object-cover pointer-events-none" 
                        referrerPolicy="no-referrer" 
                      />
                      <div>
                        <h4 className="font-bold text-[#1A1A1A]">{t.name}</h4>
                        <p className="text-xs text-[#9E9E9E] font-bold uppercase tracking-widest">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-[#4A4A4A] leading-relaxed italic flex-grow">"{t.content}"</p>
                    <div className="flex mt-6 text-[#F27D26]">
                      {[...Array(t.rating)].map((_, star) => <Star key={star} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              Join hundreds of successful businesses that trust {settings?.platformName || 'ServiceHub Pro'} for their digital needs.
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
