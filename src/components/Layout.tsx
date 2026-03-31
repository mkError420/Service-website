import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle, logout, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, Settings as PlatformSettings } from '../types';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  Briefcase, 
  MessageSquare, 
  Settings,
  ShieldCheck,
  Home as HomeIcon,
  Search,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
    });

    // Fetch platform settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as PlatformSettings);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'All Services', path: '/services', icon: Briefcase },
    { name: 'About Us', path: '/about', icon: UserIcon },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  const isDefaultAdmin = user?.email === "mk.rabbani.cse@gmail.com" && user?.emailVerified;
  const isAdmin = profile?.role === 'admin' || isDefaultAdmin;

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/chat');
  const isFullPageLayout = isAdminRoute || isDashboardRoute;

  const authLinks = isAdmin 
    ? [
        { name: 'Admin Panel', path: '/admin', icon: ShieldCheck },
      ]
    : user 
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      {!isFullPageLayout && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <span className="text-white font-bold text-xl">{(settings?.platformName || 'S')[0]}</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                {settings?.platformName || 'ServicesHub'}
                <span className="text-[#F27D26]">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-[#F27D26] ${
                    location.pathname === link.path ? 'text-[#F27D26]' : 'text-[#4A4A4A]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-6">
                  {authLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path}
                      className={`text-sm font-medium transition-colors hover:text-[#F27D26] ${
                        location.pathname === link.path ? 'text-[#F27D26]' : 'text-[#4A4A4A]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-[#4A4A4A] hover:text-[#F27D26] transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#F27D26] transition-all"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold flex items-center space-x-4"
                >
                  <link.icon size={24} className="text-[#F27D26]" />
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-4" />
              {user ? (
                <>
                  {authLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-bold flex items-center space-x-4"
                    >
                      <link.icon size={24} className="text-[#F27D26]" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="text-2xl font-bold flex items-center space-x-4 text-red-500"
                  >
                    <LogOut size={24} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl text-lg font-bold"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`${isFullPageLayout ? 'pt-0' : 'pt-24'} min-h-[calc(100vh-80px)]`}>
        {settings?.maintenanceMode && !isAdmin ? (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 bg-[#F27D26]/10 text-[#F27D26] rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} />
              </div>
              <h1 className="text-4xl font-black tracking-tight">Under Maintenance</h1>
              <p className="text-[#4A4A4A] font-medium leading-relaxed">
                We're currently performing some scheduled maintenance to improve your experience. 
                Please check back soon!
              </p>
              <div className="pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Support Email</p>
                <p className="font-bold text-[#1A1A1A]">{settings?.supportEmail || 'support@serviceshub.pro'}</p>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* Pre-footer: Bangladeshi Industry Leaders Ticker */}
      {!isFullPageLayout && (
        <section className="max-w-full overflow-hidden py-12 border-y border-gray-100 bg-white">
          <p className="text-center text-[#9E9E9E] font-bold uppercase tracking-widest text-[10px] mb-8">Trusted by Bangladeshi Industry Leaders</p>
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
                { name: 'Grameenphone', color: '#00A9E0' },
                { name: 'Robi', color: '#E21E26' },
                { name: 'Banglalink', color: '#F47920' },
                { name: 'bKash', color: '#E2136E' },
                { name: 'Nagad', color: '#ED1C24' },
                { name: 'Pathao', color: '#E82127' },
                { name: 'Daraz', color: '#F37021' },
                { name: 'Chaldal', color: '#FFD200' },
                { name: 'Shikho', color: '#6366F1' },
                { name: '10 Minute School', color: '#22C55E' },
                { name: 'ShopUp', color: '#1A1A1A' },
                { name: 'Paperfly', color: '#F27D26' }
              ].concat([
                { name: 'Grameenphone', color: '#00A9E0' },
                { name: 'Robi', color: '#E21E26' },
                { name: 'Banglalink', color: '#F47920' },
                { name: 'bKash', color: '#E2136E' },
                { name: 'Nagad', color: '#ED1C24' },
                { name: 'Pathao', color: '#E82127' },
                { name: 'Daraz', color: '#F37021' },
                { name: 'Chaldal', color: '#FFD200' },
                { name: 'Shikho', color: '#6366F1' },
                { name: '10 Minute School', color: '#22C55E' },
                { name: 'ShopUp', color: '#1A1A1A' },
                { name: 'Paperfly', color: '#F27D26' }
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
      )}

      {/* Footer */}
      {!isFullPageLayout && (
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <Link to="/" className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{(settings?.platformName || 'S')[0]}</span>
                  </div>
                  <span className="text-lg font-bold">
                    {settings?.platformName || 'ServicesHub'}
                    <span className="text-[#F27D26]">.</span>
                  </span>
                </Link>
                <p className="text-[#4A4A4A] max-w-sm text-sm leading-relaxed">
                  Empowering businesses with premium digital solutions. From MERN stack development to high-end video editing, we deliver excellence.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-6">All Services</h4>
                <ul className="space-y-4 text-sm text-[#4A4A4A]">
                  <li><Link to="/services" className="hover:text-[#F27D26] transition-colors">Web Development</Link></li>
                  <li><Link to="/services" className="hover:text-[#F27D26] transition-colors">WordPress Sites</Link></li>
                  <li><Link to="/services" className="hover:text-[#F27D26] transition-colors">Video Editing</Link></li>
                  <li><Link to="/services" className="hover:text-[#F27D26] transition-colors">Digital Marketing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-[#4A4A4A]">
                  <li><Link to="/about" className="hover:text-[#F27D26] transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-[#F27D26] transition-colors">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-[#F27D26] transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-[#F27D26] transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#9E9E9E]">
              <p>© 2026 {settings?.platformName || 'ServicesHub Pro'}. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-[#1A1A1A]">Twitter</a>
                <a href="#" className="hover:text-[#1A1A1A]">LinkedIn</a>
                <a href="#" className="hover:text-[#1A1A1A]">Instagram</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
