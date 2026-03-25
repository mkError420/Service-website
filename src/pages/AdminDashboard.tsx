import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Service, Order, UserProfile } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'MERN Stack',
    image: '',
    features: '',
    active: true
  });

  useEffect(() => {
    const qServices = query(collection(db, 'services'), orderBy('title', 'asc'));
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    return () => {
      unsubServices();
      unsubOrders();
    };
  }, []);

  const handleOpenModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
        image: service.image || '',
        features: service.features?.join(', ') || '',
        active: service.active
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: 'MERN Stack',
        image: '',
        features: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f !== '')
      };

      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), serviceData);
        toast.success("Service updated successfully");
      } else {
        await addDoc(collection(db, 'services'), serviceData);
        toast.success("Service created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving service", error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, 'services', id));
        toast.success("Service deleted");
      } catch (error) {
        toast.error("Failed to delete service");
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status,
        updatedAt: Timestamp.now()
      });
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `$${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.price, 0)}`, icon: TrendingUp, color: '#F27D26' },
    { label: 'Active Orders', value: orders.filter(o => ['paid', 'in-progress'].includes(o.status)).length, icon: ShoppingBag, color: '#1A1A1A' },
    { label: 'Total Services', value: services.length, icon: LayoutDashboard, color: '#F27D26' },
  ];

  if (loading) return <div className="p-20 text-center font-bold">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#F27D26]/10 text-[#F27D26] px-4 py-2 rounded-full mb-4">
            <ShieldCheck size={16} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Control Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Management Hub<span className="text-[#F27D26]">.</span></h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center"
        >
          <Plus size={24} className="mr-2" />
          Add New Service
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-black/5 flex items-center space-x-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
              <stat.icon size={40} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-[#1A1A1A]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Services Management */}
      <div className="mb-24">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black flex items-center">
            <LayoutDashboard size={28} className="text-[#F27D26] mr-4" />
            Service Inventory
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-lg shadow-black/5 group">
              <div className="relative h-48 rounded-3xl overflow-hidden mb-6">
                <img src={service.image || `https://picsum.photos/seed/${service.id}/800/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${service.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {service.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-[#9E9E9E] text-xs font-bold uppercase tracking-widest mb-4">{service.category}</p>
              <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                <span className="text-2xl font-black text-[#1A1A1A]">${service.price}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenModal(service)}
                    className="p-3 bg-gray-50 text-[#1A1A1A] rounded-xl hover:bg-[#1A1A1A] hover:text-white transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Management */}
      <div className="bg-[#1A1A1A] rounded-[60px] p-12 md:p-20 text-white overflow-hidden">
        <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight flex items-center">
          <ShoppingBag size={40} className="text-[#F27D26] mr-6" />
          Order Pipeline
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-8 text-xs font-bold uppercase tracking-widest text-gray-500">Order & Client</th>
                <th className="pb-8 text-xs font-bold uppercase tracking-widest text-gray-500">Service</th>
                <th className="pb-8 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                <th className="pb-8 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-8">
                    <p className="font-bold text-lg">{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400 font-medium">UID: {order.clientId.slice(0, 8)}</p>
                  </td>
                  <td className="py-8">
                    <p className="font-bold">{order.serviceTitle}</p>
                    <p className="text-xs text-[#F27D26] font-black uppercase tracking-widest">${order.price}</p>
                  </td>
                  <td className="py-8">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="bg-white/10 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-2 focus:ring-0 focus:border-[#F27D26] cursor-pointer"
                    >
                      {['pending', 'paid', 'in-progress', 'completed', 'cancelled'].map(s => (
                        <option key={s} value={s} className="bg-[#1A1A1A]">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-8 text-right">
                    <button className="text-xs font-bold uppercase tracking-widest bg-white text-[#1A1A1A] px-6 py-3 rounded-xl hover:bg-[#F27D26] hover:text-white transition-all">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black tracking-tight">
                  {editingService ? 'Edit Service' : 'New Service'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Service Title</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Category</label>
                    <select 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-bold"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {['MERN Stack', 'WordPress', 'Video Editing', 'Digital Marketing'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Description</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-black"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Image URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Features (comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Fast Delivery, SEO Optimized, Clean Code"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <input 
                    type="checkbox" 
                    id="active"
                    className="w-6 h-6 rounded-lg border-gray-200 text-[#F27D26] focus:ring-[#F27D26]"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <label htmlFor="active" className="text-sm font-bold text-[#1A1A1A]">Active and Visible to Clients</label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-xl font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
