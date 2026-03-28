import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Order, UserProfile } from '../types';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ArrowRight, 
  CreditCard,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  ShieldCheck,
  LogOut,
  Camera,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'history' | 'profile'>('projects');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(!!searchParams.get('session_id'));

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch Profile
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        setProfile(profileData);
        setEditName(profileData.displayName || '');
      }
    };
    fetchProfile();

    // Fetch Orders
    const q = query(
      collection(db, 'orders'), 
      where('clientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser || !editName.trim()) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        displayName: editName,
        updatedAt: Timestamp.now()
      });
      setProfile(prev => prev ? { ...prev, displayName: editName } : null);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'paid': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const activeOrders = orders.filter(o => ['paid', 'in-progress', 'pending'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');

  const stats = [
    { label: 'Active Projects', value: activeOrders.length, icon: Clock, color: '#F27D26' },
    { label: 'Completed', value: completedOrders.length, icon: CheckCircle2, color: '#10B981' },
    { label: 'Total Investment', value: `$${orders.reduce((acc, o) => acc + o.price, 0)}`, icon: DollarSign, color: '#1A1A1A' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-12 w-64 bg-gray-100 rounded-2xl mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[32px]" />)}
        </div>
        <div className="h-96 bg-gray-100 rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-green-50 border border-green-100 p-6 rounded-[32px] flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-green-900">Payment Successful!</h4>
                <p className="text-green-700 font-medium">Your order has been confirmed and our experts are getting started.</p>
              </div>
            </div>
            <button onClick={() => setShowSuccessAlert(false)} className="text-green-500 hover:text-green-700">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-[#F27D26]">
              <img 
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName || 'User'}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                Hello, {profile?.displayName || auth.currentUser?.displayName || 'Client'}<span className="text-[#F27D26]">.</span>
              </h1>
              <p className="text-[#9E9E9E] font-bold uppercase tracking-widest text-xs mt-1">
                {profile?.role || 'Client'} Account
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#9E9E9E] hover:text-[#1A1A1A]'}`}
          >
            Projects
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#9E9E9E] hover:text-[#1A1A1A]'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#9E9E9E] hover:text-[#1A1A1A]'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab !== 'profile' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 flex items-center space-x-6"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                  <stat.icon size={32} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[#1A1A1A]">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-black flex items-center">
                <ShoppingBag size={24} className="text-[#F27D26] mr-3" />
                {activeTab === 'projects' ? 'Active Projects' : 'Order History'}
              </h2>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#F27D26] transition-all"
                  />
                </div>
                <button className="p-3 bg-gray-50 rounded-xl text-[#1A1A1A] hover:bg-gray-100 transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Service</th>
                    <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Price</th>
                    <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Status</th>
                    <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Expert</th>
                    <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(activeTab === 'projects' ? activeOrders : completedOrders).length > 0 ? (
                    (activeTab === 'projects' ? activeOrders : completedOrders).map((order, i) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <LayoutDashboard size={20} className="text-[#1A1A1A]" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1A1A1A]">{order.serviceTitle}</p>
                              <p className="text-xs text-[#9E9E9E]">Ordered on {order.createdAt.toDate().toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="font-black text-[#1A1A1A]">${order.price}</span>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          {order.assignedExpertName ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-[#F27D26]/10 rounded-full flex items-center justify-center">
                                <UserIcon size={12} className="text-[#F27D26]" />
                              </div>
                              <span className="text-sm font-bold text-[#4A4A4A]">{order.assignedExpertName}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-[#9E9E9E]">Assigning...</span>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link 
                              to={`/chat?orderId=${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-gray-50 rounded-xl text-[#1A1A1A] hover:bg-[#F27D26] hover:text-white transition-all"
                            >
                              <MessageSquare size={18} />
                            </Link>
                            <button className="p-3 bg-gray-50 rounded-xl text-[#1A1A1A] hover:bg-gray-100 transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-10 py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-[#1A1A1A] mb-2">No {activeTab === 'projects' ? 'active projects' : 'completed orders'}</h3>
                        <p className="text-[#9E9E9E] font-medium mb-8">Start your next big project today.</p>
                        <Link to="/services" className="inline-block bg-[#1A1A1A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10">
                          Browse Services
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'profile' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-black/5 text-center">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                  <img 
                    src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'User'}&size=256`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#1A1A1A] text-white p-3 rounded-2xl shadow-lg hover:bg-[#F27D26] transition-all">
                  <Camera size={20} />
                </button>
              </div>
              
              <h3 className="text-2xl font-black mb-1">{profile?.displayName || 'Client Name'}</h3>
              <p className="text-[#9E9E9E] font-medium mb-8">{profile?.email}</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-3xl text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] mb-2">Member Since</p>
                  <p className="font-bold text-[#1A1A1A] flex items-center">
                    <Calendar size={18} className="mr-2 text-[#F27D26]" />
                    {profile?.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] mb-2">Account Status</p>
                  <p className="font-bold text-green-600 flex items-center">
                    <ShieldCheck size={18} className="mr-2" />
                    Verified Client
                  </p>
                </div>
              </div>

              <button 
                onClick={() => auth.signOut()}
                className="w-full mt-10 flex items-center justify-center space-x-2 text-red-500 font-bold hover:bg-red-50 py-4 rounded-2xl transition-all"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-black/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black">Account Settings</h3>
                {!isEditingProfile ? (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateProfile}
                      className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F27D26] transition-all flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#9E9E9E] ml-1">Display Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditingProfile}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#F27D26] transition-all font-bold disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#9E9E9E] ml-1">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={profile?.email || ''}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-lg font-black mb-6">Security</h4>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gray-50 rounded-3xl gap-4">
                    <div>
                      <p className="font-bold text-[#1A1A1A]">Two-Factor Authentication</p>
                      <p className="text-sm text-[#9E9E9E]">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="bg-white border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-lg font-black mb-6 text-red-500">Danger Zone</h4>
                  <div className="p-6 border-2 border-red-50 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="font-bold text-red-600">Delete Account</p>
                      <p className="text-sm text-red-400">Permanently remove your account and all data.</p>
                    </div>
                    <button className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-3xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-[#F27D26]/10 rounded-[24px] flex items-center justify-center">
                      <ShoppingBag size={32} className="text-[#F27D26]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedOrder.serviceTitle}</h2>
                      <p className="text-[#9E9E9E] font-bold uppercase tracking-widest text-xs">Order ID: {selectedOrder.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] mb-3">Project Details</p>
                      <div className="bg-gray-50 p-6 rounded-3xl">
                        <p className="text-[#4A4A4A] leading-relaxed font-medium">
                          {selectedOrder.projectDetails || "No specific details provided for this order."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#1A1A1A] rounded-3xl text-white">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Paid</p>
                        <p className="text-2xl font-black">${selectedOrder.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] mb-3">Timeline & Expert</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                          <div className="flex items-center space-x-3">
                            <Calendar size={18} className="text-[#F27D26]" />
                            <span className="text-sm font-bold">Ordered Date</span>
                          </div>
                          <span className="text-sm font-medium text-[#4A4A4A]">{selectedOrder.createdAt.toDate().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                          <div className="flex items-center space-x-3">
                            <UserIcon size={18} className="text-[#F27D26]" />
                            <span className="text-sm font-bold">Assigned Expert</span>
                          </div>
                          <span className="text-sm font-medium text-[#4A4A4A]">{selectedOrder.assignedExpertName || 'Pending Assignment'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Link 
                        to={`/chat?orderId=${selectedOrder.id}`}
                        className="w-full bg-[#F27D26] text-white py-5 rounded-2xl text-lg font-bold hover:bg-[#1A1A1A] transition-all flex items-center justify-center group shadow-xl shadow-[#F27D26]/20"
                      >
                        Open Project Chat
                        <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
