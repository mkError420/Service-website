import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Service, Order, UserProfile } from '../types';
import { seedServices } from '../lib/seedData';
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
  Filter,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  
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

  const handleDelete = async () => {
    if (!deletingServiceId) return;
    try {
      await deleteDoc(doc(db, 'services', deletingServiceId));
      toast.success("Service deleted");
      setDeletingServiceId(null);
    } catch (error) {
      toast.error("Failed to delete service");
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

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedServices();
      toast.success("26 services added successfully!");
      setIsSeedModalOpen(false);
    } catch (error) {
      console.error("Seeding error:", error);
      toast.error("Failed to seed services. Please ensure your email is verified.");
    } finally {
      setIsSeeding(false);
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `$${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.price, 0)}`, icon: TrendingUp, color: '#F27D26' },
    { label: 'Active Orders', value: orders.filter(o => ['paid', 'in-progress'].includes(o.status)).length, icon: ShoppingBag, color: '#1A1A1A' },
    { label: 'Total Services', value: services.length, icon: LayoutDashboard, color: '#F27D26' },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(serviceSearchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase());
    const matchesCategory = serviceCategoryFilter === 'All' || service.category === serviceCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                          order.serviceTitle.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                          order.clientId.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setIsSeedModalOpen(true)}
            disabled={isSeeding}
            className="bg-gray-100 text-[#1A1A1A] px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-200 transition-all flex items-center disabled:opacity-50"
          >
            <Database size={24} className="mr-2" />
            Seed 26 Services
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 flex items-center"
          >
            <Plus size={24} className="mr-2" />
            Add New Service
          </button>
        </div>
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <h2 className="text-3xl font-black flex items-center">
            <LayoutDashboard size={28} className="text-[#F27D26] mr-4" />
            Service Inventory
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-grow lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search services..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium shadow-sm"
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative lg:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <select 
                className="w-full appearance-none bg-white border border-gray-100 pl-12 pr-10 py-3 rounded-xl text-sm font-bold focus:border-[#F27D26] focus:ring-0 transition-all cursor-pointer shadow-sm"
                value={serviceCategoryFilter}
                onChange={(e) => setServiceCategoryFilter(e.target.value)}
              >
                {['All', 'MERN Stack', 'WordPress', 'Video Editing', 'Digital Marketing'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
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
                    onClick={() => setDeletingServiceId(service.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-[#9E9E9E] font-medium">No services match your filters.</p>
          </div>
        )}
        </div>
      </div>

      {/* Orders Management */}
      <div className="bg-[#1A1A1A] rounded-[60px] p-12 md:p-20 text-white overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight flex items-center">
            <ShoppingBag size={40} className="text-[#F27D26] mr-6" />
            Order Pipeline
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-grow lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#F27D26] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search orders..."
                className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#F27D26] focus:bg-white/10 focus:ring-0 transition-all text-sm font-medium"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative lg:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              <select 
                className="w-full appearance-none bg-white/5 border border-white/10 pl-12 pr-10 py-3 rounded-xl text-sm font-bold focus:border-[#F27D26] focus:bg-white/10 focus:ring-0 transition-all cursor-pointer"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                {['All', 'pending', 'paid', 'in-progress', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s} className="bg-[#1A1A1A]">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
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
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold uppercase tracking-widest bg-white text-[#1A1A1A] px-6 py-3 rounded-xl hover:bg-[#F27D26] hover:text-white transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-500 font-medium">
                    No orders match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black tracking-tight">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Order ID</p>
                    <p className="font-bold text-[#1A1A1A]">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Service</p>
                  <p className="text-xl font-black text-[#1A1A1A]">{selectedOrder.serviceTitle}</p>
                  <p className="text-[#F27D26] font-black">${selectedOrder.price}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Client UID</p>
                  <p className="font-medium text-[#4A4A4A] break-all">{selectedOrder.clientId}</p>
                </div>

                <div className="pt-8 border-t border-gray-100 flex gap-4">
                  <button 
                    onClick={() => {
                      setSelectedOrder(null);
                      // In a real app, navigate to chat with this order context
                    }}
                    className="flex-grow bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-[#F27D26] transition-all"
                  >
                    Open Chat
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seed Confirmation Modal */}
      <AnimatePresence>
        {isSeedModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-[#F27D26]/10 text-[#F27D26] rounded-full flex items-center justify-center mx-auto mb-6">
                <Database size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4">Seed Inventory?</h2>
              <p className="text-[#4A4A4A] mb-10">This will add 26 professional services across all categories to your inventory. This is great for quickly populating your site.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsSeedModalOpen(false)}
                  disabled={isSeeding}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="flex-1 px-8 py-4 bg-[#F27D26] text-white rounded-2xl font-bold hover:bg-[#E06C15] transition-all shadow-lg shadow-[#F27D26]/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSeeding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Seeding...
                    </>
                  ) : 'Confirm Seed'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingServiceId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4">Delete Service?</h2>
              <p className="text-[#4A4A4A] mb-10">This action cannot be undone. Are you sure you want to remove this service from your inventory?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingServiceId(null)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
