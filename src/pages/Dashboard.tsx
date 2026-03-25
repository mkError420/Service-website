import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
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
  User as UserIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'paid': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = [
    { label: 'Active Orders', value: orders.filter(o => ['paid', 'in-progress'].includes(o.status)).length, icon: Clock, color: '#F27D26' },
    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: '#10B981' },
    { label: 'Total Spent', value: `$${orders.reduce((acc, o) => acc + o.price, 0)}`, icon: CreditCard, color: '#1A1A1A' },
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Client Dashboard<span className="text-[#F27D26]">.</span></h1>
          <p className="text-[#4A4A4A] font-medium">Welcome back, {auth.currentUser?.displayName || 'Client'}. Manage your projects and orders.</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/chat" className="bg-white border border-gray-100 p-4 rounded-2xl hover:border-[#F27D26] transition-all shadow-sm">
            <MessageSquare size={24} className="text-[#F27D26]" />
          </Link>
          <button className="bg-white border border-gray-100 p-4 rounded-2xl hover:border-[#F27D26] transition-all shadow-sm">
            <Settings size={24} className="text-[#1A1A1A]" />
          </button>
        </div>
      </div>

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

      {/* Orders Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center">
            <ShoppingBag size={24} className="text-[#F27D26] mr-3" />
            Recent Orders
          </h2>
          <Link to="/services" className="text-sm font-bold text-[#F27D26] hover:underline">Book New Service</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Service</th>
                <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Price</th>
                <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Status</th>
                <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Date</th>
                <th className="px-10 py-6 text-xs font-bold uppercase tracking-widest text-[#9E9E9E] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <LayoutDashboard size={20} className="text-[#1A1A1A]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1A1A1A]">{order.serviceTitle}</p>
                          <p className="text-xs text-[#9E9E9E]">ID: {order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="font-black text-[#1A1A1A]">${order.price}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-medium text-[#4A4A4A]">
                        {order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link 
                        to={`/chat?orderId=${order.id}`}
                        className="inline-flex items-center text-sm font-bold text-[#1A1A1A] hover:text-[#F27D26] transition-colors"
                      >
                        Messages <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                    <p className="text-[#9E9E9E] font-medium">You haven't placed any orders yet.</p>
                    <Link to="/services" className="mt-6 inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#F27D26] transition-all">
                      Browse Services
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
