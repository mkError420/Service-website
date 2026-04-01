import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, setDoc, doc, deleteDoc, Timestamp, where, getDocs, writeBatch } from 'firebase/firestore';
import { Service, Order, UserProfile, ContactMessage, Message, Category, Settings as PlatformSettings, Testimonial, TeamMember } from '../types';
import { sendEmail } from '../services/emailService';
import { seedServices } from '../lib/seedData';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  Users, 
  User,
  TrendingUp, 
  CheckCircle2, 
  X, 
  Mail,
  MessageSquare,
  Image as ImageIcon,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Filter,
  Database,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  MoreVertical,
  Calendar,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Tag,
  Layers,
  Send,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

type AdminTab = 'overview' | 'services' | 'categories' | 'orders' | 'users' | 'messages' | 'mail' | 'testimonials' | 'team' | 'settings';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab') as AdminTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    navigate(`/admin?tab=${tab}`);
  };
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  
  // Filters
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isClearInventoryModalOpen, setIsClearInventoryModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationNote, setCancellationNote] = useState('');
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  const [deletingTeamMemberId, setDeletingTeamMemberId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningExpert, setAssigningExpert] = useState<TeamMember | null>(null);
  const [revenueFilter, setRevenueFilter] = useState<'7' | '30'>('7');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Settings State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'ExpertHire',
    supportEmail: 'support@experthire.com',
    supportPhone: '+880 1854-718767',
    officeAddress: '124/3,Palashbari,gaibandha',
    workingHours: '24/7 Support',
    maintenanceMode: false,
    showreelUrl: ''
  });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    features: '',
    active: true,
    expertId: '',
    expertName: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: 'Code',
    color: '#F27D26'
  });

  const [testimonialFormData, setTestimonialFormData] = useState({
    name: '',
    role: '',
    content: '',
    avatar: '',
    rating: 5,
    featured: false
  });

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    specialties: '',
    socials: {
      linkedin: '',
      twitter: ''
    },
    active: true
  });

  useEffect(() => {
    const qServices = query(collection(db, 'services'), orderBy('title', 'asc'));
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
    });

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    const qAllUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubAllUsers = onSnapshot(qAllUsers, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setAllUsers(users);
      const currentUser = users.find(u => u.uid === auth.currentUser?.uid);
      if (currentUser) {
        console.log('Current user role:', currentUser.role);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users/all');
    });

    const qContactMessages = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const unsubContactMessages = onSnapshot(qContactMessages, (snapshot) => {
      setContactMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'contact_messages');
    });

    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setAllMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });

    const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setPlatformSettings(snapshot.data() as PlatformSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });

    const qTestimonials = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'testimonials');
    });

    const qTeam = query(collection(db, 'team'), orderBy('createdAt', 'desc'));
    const unsubTeam = onSnapshot(qTeam, (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'team');
    });

    return () => {
      unsubServices();
      unsubOrders();
      unsubAllUsers();
      unsubContactMessages();
      unsubMessages();
      unsubCategories();
      unsubSettings();
      unsubTestimonials();
      unsubTeam();
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
        active: service.active,
        expertId: service.expertId || '',
        expertName: service.expertName || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: categories[0]?.name || '',
        image: '',
        features: '',
        active: true,
        expertId: '',
        expertName: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        icon: category.icon || 'Code',
        color: category.color || '#F27D26'
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        icon: 'Code',
        color: '#F27D26'
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleOpenTestimonialModal = (testimonial: Testimonial | null = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialFormData({
        name: testimonial.name,
        role: testimonial.role || '',
        content: testimonial.content,
        avatar: testimonial.avatar || '',
        rating: testimonial.rating,
        featured: testimonial.featured || false
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialFormData({
        name: '',
        role: '',
        content: '',
        avatar: '',
        rating: 5,
        featured: false
      });
    }
    setIsTestimonialModalOpen(true);
  };

  const handleOpenTeamModal = (member: TeamMember | null = null) => {
    if (member) {
      setEditingTeamMember(member);
      setTeamFormData({
        name: member.name,
        role: member.role,
        bio: member.bio,
        image: member.image || '',
        specialties: member.specialties?.join(', ') || '',
        socials: {
          linkedin: member.socials?.linkedin || '',
          twitter: member.socials?.twitter || ''
        },
        active: member.active
      });
    } else {
      setEditingTeamMember(null);
      setTeamFormData({
        name: '',
        role: '',
        bio: '',
        image: '',
        specialties: '',
        socials: {
          linkedin: '',
          twitter: ''
        },
        active: true
      });
    }
    setIsTeamModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const data = {
        name: testimonialFormData.name,
        role: testimonialFormData.role,
        content: testimonialFormData.content,
        avatar: testimonialFormData.avatar,
        rating: testimonialFormData.rating,
        featured: testimonialFormData.featured,
        createdAt: editingTestimonial ? editingTestimonial.createdAt : Timestamp.now()
      };

      if (editingTestimonial) {
        await updateDoc(doc(db, 'testimonials', editingTestimonial.id), data);
        toast.success('Testimonial updated successfully');
      } else {
        await addDoc(collection(db, 'testimonials'), data);
        toast.success('Testimonial added successfully');
      }
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
      setTestimonialFormData({
        name: '',
        role: '',
        content: '',
        avatar: '',
        rating: 5,
        featured: false
      });
    } catch (error) {
      handleFirestoreError(error, editingTestimonial ? OperationType.UPDATE : OperationType.CREATE, 'testimonials');
      toast.error('Failed to save testimonial');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const data = {
        name: teamFormData.name,
        role: teamFormData.role,
        bio: teamFormData.bio,
        image: teamFormData.image,
        specialties: typeof teamFormData.specialties === 'string' 
          ? teamFormData.specialties.split(',').map(s => s.trim()).filter(s => s !== '')
          : teamFormData.specialties,
        socials: teamFormData.socials,
        active: teamFormData.active,
        createdAt: editingTeamMember ? editingTeamMember.createdAt : Timestamp.now()
      };

      if (editingTeamMember) {
        await updateDoc(doc(db, 'team', editingTeamMember.id), data);
        toast.success('Team member updated successfully');
      } else {
        await addDoc(collection(db, 'team'), data);
        toast.success('Team member added successfully');
      }
      setIsTeamModalOpen(false);
      setEditingTeamMember(null);
      setTeamFormData({
        name: '',
        role: '',
        bio: '',
        image: '',
        specialties: '',
        socials: {
          linkedin: '',
          twitter: ''
        },
        active: true
      });
    } catch (error) {
      handleFirestoreError(error, editingTeamMember ? OperationType.UPDATE : OperationType.CREATE, 'team');
      toast.error('Failed to save team member');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Testimonial deleted successfully');
      setDeletingTestimonialId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      toast.error('Failed to delete testimonial');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'team', id));
      toast.success('Team member deleted successfully');
      setDeletingTeamMemberId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team/${id}`);
      toast.error('Failed to delete team member');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingCategory) {
        const oldName = editingCategory.name;
        const newName = categoryFormData.name;

        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...categoryFormData,
        });

        // If name changed, update all services using this category
        if (oldName !== newName) {
          const servicesToUpdate = services.filter(s => s.category === oldName);
          if (servicesToUpdate.length > 0) {
            const batch = writeBatch(db);
            servicesToUpdate.forEach(service => {
              batch.update(doc(db, 'services', service.id), { category: newName });
            });
            await batch.commit();
            toast.info(`Updated ${servicesToUpdate.length} services with new category name`);
          }
        }
        
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryFormData,
          createdAt: Timestamp.now()
        });
        toast.success('Category added successfully');
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingCategory ? OperationType.UPDATE : OperationType.CREATE, 'categories');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategoryId) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'categories', deletingCategoryId));
      toast.success('Category deleted successfully');
      setDeletingCategoryId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'categories');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const selectedExpert = teamMembers.find(m => m.id === formData.expertId);
      const serviceData = {
        ...formData,
        expertName: selectedExpert ? selectedExpert.name : '',
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
      handleFirestoreError(error, editingService ? OperationType.UPDATE : OperationType.CREATE, 'services');
      toast.error("Failed to save service");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingServiceId) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'services', deletingServiceId));
      toast.success("Service deleted");
      setDeletingServiceId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${deletingServiceId}`);
      toast.error("Failed to delete service");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    setIsProcessing(true);
    try {
      const updateData: any = { 
        status,
        updatedAt: Timestamp.now()
      };
      if (note) updateData.cancellationNote = note;
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
      toast.success(`Order status updated to ${status}`);

      // Send email notification to client
      const order = orders.find(o => o.id === orderId);
      if (order) {
        let clientEmail = order.guestEmail;
        if (!clientEmail) {
          const client = allUsers.find(u => u.uid === order.clientId);
          clientEmail = client?.email;
        }

        if (clientEmail) {
          try {
            await sendEmail({
              to: clientEmail,
              subject: `Order Status Update: ${order.serviceTitle}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #F27D26;">Order Status Update</h2>
                  <p>Hello,</p>
                  <p>Your order for <strong>${order.serviceTitle}</strong> (ID: <code>${order.id}</code>) has been updated.</p>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: #1A1A1A;">New Status: <span style="color: #F27D26; text-transform: uppercase;">${status}</span></p>
                    ${note ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Note: ${note}</p>` : ''}
                  </div>
                  <p>You can track your order progress by logging into your account.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply to this email.</p>
                </div>
              `
            });
          } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // We don't toast error here because the status update itself succeeded
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const assignOrder = async (orderId: string, expertId: string) => {
    setIsProcessing(true);
    try {
      const expert = teamMembers.find(m => m.id === expertId);
      await updateDoc(doc(db, 'orders', orderId), {
        assignedExpertId: expertId || null,
        assignedExpertName: expert?.name || 'Unassigned',
        updatedAt: Timestamp.now()
      });
      toast.success(expertId ? `Assigned to ${expert?.name}` : "Expert unassigned");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      toast.error("Failed to assign expert");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateUserRole = async (uid: string, role: string) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      toast.error("Failed to update user role");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && selectedChatId) {
      scrollRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [allMessages, selectedChatId, activeTab]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChatId || !auth.currentUser) return;

    try {
      let receiverId = '';
      let orderId = '';

      if (selectedChatId.startsWith('user_')) {
        receiverId = selectedChatId.replace('user_', '');
        orderId = '';
      } else {
        const order = orders.find(o => o.id === selectedChatId);
        receiverId = order ? order.clientId : (allMessages.find(m => m.orderId === selectedChatId && m.senderId !== auth.currentUser?.uid)?.senderId || '');
        orderId = selectedChatId;
      }

      if (!receiverId) {
        toast.error("Could not determine recipient.");
        return;
      }

      const msgData = {
        senderId: auth.currentUser.uid,
        receiverId: receiverId,
        text: chatMessage,
        orderId: orderId,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'messages'), msgData);
      setChatMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    }
  };

  const handleSaveSettings = async () => {
    setIsProcessing(true);
    try {
      const settingsRef = doc(db, 'settings', 'config');
      await setDoc(settingsRef, {
        ...platformSettings,
        updatedAt: Timestamp.now()
      }, { merge: true });
      toast.success("Platform configuration saved");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/config');
      toast.error("Failed to save settings");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMessageStatus = async (id: string, status: 'read' | 'replied') => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'contact_messages', id), { status });
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contact_messages/${id}`);
      toast.error("Failed to update message status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessageId || !replyContent.trim()) return;
    setIsProcessing(true);
    try {
      const msg = contactMessages.find(m => m.id === replyingMessageId);
      if (!msg) return;

      // Update contact message status and add reply content
      await updateDoc(doc(db, 'contact_messages', replyingMessageId), {
        status: 'replied',
        replyContent: replyContent,
        repliedAt: Timestamp.now()
      });

      // Send email to the client
      try {
        await sendEmail({
          to: msg.email,
          subject: `RE: ${msg.subject} - ServiceHub Pro`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #F27D26;">Hello ${msg.name},</h2>
              <p>Thank you for contacting ServiceHub Pro. We have replied to your inquiry:</p>
              <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #F27D26; margin: 20px 0;">
                <p style="font-style: italic; color: #666; margin-bottom: 10px;">Your message: "${msg.message}"</p>
                <p style="font-weight: bold; margin-top: 10px;">Our reply:</p>
                <p>${replyContent}</p>
              </div>
              <p>You can also view this reply and chat with us directly in your <a href="${window.location.origin}/dashboard" style="color: #F27D26; font-weight: bold; text-decoration: none;">Dashboard</a>.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Best regards,<br />The ServiceHub Pro Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        toast.error("Reply saved, but email notification failed to send.");
      }

      // If the sender is a registered user, also send a message to their chat
      const user = allUsers.find(u => u.email === msg.email);
      if (user) {
        await addDoc(collection(db, 'messages'), {
          senderId: 'admin',
          receiverId: user.uid,
          text: `RE: ${msg.subject}\n\n${replyContent}`,
          createdAt: Timestamp.now()
        });
        toast.success("Reply sent and added to user chat");
      } else {
        toast.success("Reply saved successfully");
      }

      setIsReplyModalOpen(false);
      setReplyContent('');
      setReplyingMessageId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contact_messages/${replyingMessageId}`);
      toast.error("Failed to send reply");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMessage = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      toast.success("Message deleted");
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contact_messages/${id}`);
      toast.error("Failed to delete message");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearInventory = async () => {
    setIsProcessing(true);
    try {
      const snapshot = await getDocs(collection(db, 'services'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast.success("All inventory cleared");
      setIsClearInventoryModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'services');
      toast.error("Failed to clear inventory");
    } finally {
      setIsProcessing(false);
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
    { label: 'Total Revenue', value: `$${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.price, 0).toLocaleString()}`, icon: TrendingUp, color: '#F27D26' },
    { label: 'Active Orders', value: orders.filter(o => ['paid', 'in-progress'].includes(o.status)).length, icon: ShoppingBag, color: '#1A1A1A' },
    { label: 'Total Services', value: services.length, icon: LayoutDashboard, color: '#F27D26' },
    { label: 'Total Users', value: allUsers.length, icon: Users, color: '#1A1A1A' },
  ];

  const revenueData = useMemo(() => {
    const days = parseInt(revenueFilter);
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayRevenue = orders
        .filter(o => o.status !== 'cancelled' && o.createdAt)
        .filter(o => {
          const orderDate = o.createdAt.toDate();
          return orderDate >= date && orderDate < nextDate;
        })
        .reduce((acc, o) => acc + o.price, 0);
        
      data.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        value: dayRevenue,
        date: date
      });
    }
    
    return data;
  }, [orders, revenueFilter]);

  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1);

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

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = (user.displayName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.uid.toLowerCase().includes(userSearchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest">Initializing Admin Hub</p>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'services', label: 'Services', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className={`bg-[#1A1A1A] text-white transition-all duration-300 hidden md:flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-8 flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#F27D26] rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} className="text-white" />
          </div>
          {isSidebarOpen && <span className="text-xl font-black tracking-tighter">ADMIN<span className="text-[#F27D26]">.</span></span>}
        </div>

        <nav className="flex-grow px-4 mt-8 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as AdminTab)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
              {isSidebarOpen && <span className="ml-4 font-bold text-sm tracking-wide">{item.label}</span>}
              {activeTab === item.id && isSidebarOpen && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center p-4 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-4 font-bold text-sm">Exit Admin</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto max-h-screen p-4 md:p-12 pb-24 md:pb-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] capitalize">
              {activeTab} <span className="text-[#F27D26]">Management</span>
            </h1>
            <p className="text-[#9E9E9E] font-medium text-sm mt-1">
              {activeTab === 'overview' && 'Real-time performance analytics and system health.'}
              {activeTab === 'services' && 'Manage your service catalog and expert assignments.'}
              {activeTab === 'categories' && 'Manage service categories and icons.'}
              {activeTab === 'orders' && 'Track and fulfill client requests across the pipeline.'}
              {activeTab === 'users' && 'Manage user roles and platform permissions.'}
              {activeTab === 'messages' && 'Live chat and communication with clients.'}
              {activeTab === 'mail' && 'Manage inquiries from the contact form.'}
              {activeTab === 'testimonials' && 'Manage client feedback and social proof.'}
              {activeTab === 'team' && 'Manage your expert team and public profiles.'}
              {activeTab === 'settings' && 'Configure platform defaults and system settings.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {activeTab === 'services' && (
              <button 
                onClick={() => handleOpenModal()}
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F27D26] transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Service
              </button>
            )}
            {activeTab === 'categories' && (
              <button 
                onClick={() => handleOpenCategoryModal()}
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F27D26] transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Category
              </button>
            )}
            {activeTab === 'testimonials' && (
              <button 
                onClick={() => handleOpenTestimonialModal()}
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F27D26] transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Testimonial
              </button>
            )}
            {activeTab === 'team' && (
              <button 
                onClick={() => handleOpenTeamModal()}
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F27D26] transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Member
              </button>
            )}
            <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 flex items-center justify-center">
                <Users size={20} className="text-[#F27D26]" />
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E]">Admin</p>
                <p className="text-xs font-bold text-[#1A1A1A]">{auth.currentUser?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                        <stat.icon size={24} style={{ color: stat.color }} />
                      </div>
                      <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-[#1A1A1A]">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* Recent Activity / Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black">Revenue Growth</h3>
                    <select 
                      value={revenueFilter}
                      onChange={(e) => setRevenueFilter(e.target.value as '7' | '30')}
                      className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-[#F27D26] outline-none"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-64 bg-gray-50 rounded-3xl flex items-end justify-between p-8 border border-gray-100 overflow-x-auto">
                    {revenueData.map((data, i) => (
                      <div key={i} className="flex-grow flex flex-col items-center group relative min-w-[40px]">
                        <div className="w-full px-1 flex items-end justify-center h-48">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(data.value / maxRevenue) * 100}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="w-full max-w-[24px] bg-[#F27D26]/20 rounded-t-lg group-hover:bg-[#F27D26] transition-all relative"
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                              ${data.value.toLocaleString()}
                            </div>
                          </motion.div>
                        </div>
                        <p className="text-[8px] font-bold text-[#9E9E9E] mt-4 uppercase tracking-tighter truncate w-full text-center">
                          {data.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[#F27D26] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <ShoppingBag size={18} className="text-[#F27D26]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{order.serviceTitle}</p>
                            <p className="text-[10px] text-[#9E9E9E] font-medium">{order.guestName || 'Client'}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#1A1A1A]">${order.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search services inventory..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium shadow-sm"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative sm:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <select 
                    className="w-full appearance-none bg-white border border-gray-100 pl-12 pr-10 py-4 rounded-2xl text-sm font-bold focus:border-[#F27D26] focus:ring-0 transition-all cursor-pointer shadow-sm"
                    value={serviceCategoryFilter}
                    onChange={(e) => setServiceCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setIsSeedModalOpen(true)}
                  className="bg-white border border-gray-100 text-[#1A1A1A] px-6 py-4 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center shadow-sm"
                >
                  <Database size={18} className="mr-2" />
                  Seed
                </button>
              </div>

              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
                        <img src={service.image || `https://picsum.photos/seed/${service.id}/800/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${service.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {service.active ? 'Active' : 'Paused'}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-1 truncate">{service.title}</h3>
                      <p className="text-[#9E9E9E] text-[10px] font-bold uppercase tracking-widest mb-4">{service.category}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className="text-xl font-black text-[#1A1A1A]">${service.price}</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleOpenModal(service)}
                            className="p-3 bg-gray-50 text-[#1A1A1A] rounded-xl hover:bg-[#F27D26] hover:text-white transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingServiceId(service.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black mb-2">No services found</h3>
                  <p className="text-[#9E9E9E] font-medium">Try adjusting your search or category filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <motion.div 
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        <Layers size={28} />
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenCategoryModal(category)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-[#F27D26] hover:bg-[#F27D26]/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingCategoryId(category.id)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A1A] mb-2">{category.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E]">
                        {services.filter(s => s.category === category.name).length} Services
                      </span>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </motion.div>
                ))}
                
                <button 
                  onClick={() => handleOpenCategoryModal()}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-[32px] flex flex-col items-center justify-center text-gray-400 hover:border-[#F27D26] hover:text-[#F27D26] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus size={28} />
                  </div>
                  <span className="font-bold text-sm tracking-wide uppercase">Add New Category</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by ID, client or service..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium shadow-sm"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative sm:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <select 
                    className="w-full appearance-none bg-white border border-gray-100 pl-12 pr-10 py-4 rounded-2xl text-sm font-bold focus:border-[#F27D26] focus:ring-0 transition-all cursor-pointer shadow-sm"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    {['All', 'pending', 'paid', 'in-progress', 'completed', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Order ID</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Client</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Service</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Status</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Expert</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                            <td className="p-8">
                              <span className="font-mono text-xs font-bold text-[#1A1A1A]">#{order.id.slice(0, 8)}</span>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <User size={14} className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1A1A1A]">{order.guestName || 'Client'}</p>
                                  <p className="text-[10px] text-[#9E9E9E] font-medium">{order.clientId === 'guest' ? 'Guest Booking' : 'Registered'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <p className="text-sm font-bold text-[#1A1A1A]">{order.serviceTitle}</p>
                              <p className="text-xs text-[#F27D26] font-black">${order.price}</p>
                            </td>
                            <td className="p-8">
                              <select 
                                value={order.status}
                                onChange={(e) => {
                                  if (e.target.value === 'cancelled') {
                                    setCancellingOrderId(order.id);
                                    setIsCancelModalOpen(true);
                                  } else {
                                    updateOrderStatus(order.id, e.target.value);
                                  }
                                }}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-[#F27D26] cursor-pointer ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                                  order.status === 'paid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {['pending', 'paid', 'in-progress', 'completed', 'cancelled'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-8">
                              <select 
                                value={order.assignedExpertId || ''}
                                onChange={(e) => assignOrder(order.id, e.target.value)}
                                className="bg-gray-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-[#F27D26] cursor-pointer w-full max-w-[140px]"
                              >
                                <option value="">Unassigned</option>
                                {teamMembers.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-8 text-right">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="p-3 bg-gray-50 text-[#1A1A1A] rounded-xl hover:bg-[#1A1A1A] hover:text-white transition-all"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black mb-2">No orders found</h3>
                  <p className="text-[#9E9E9E] font-medium">Try adjusting your search or status filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users by name, email or UID..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium shadow-sm"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              {filteredUsers.length > 0 ? (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">User Profile</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Contact</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100">Platform Role</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] border-b border-gray-100 text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50/30 transition-colors">
                            <td className="p-8">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                  {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                  ) : (
                                    <Users size={20} className="text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1A1A1A]">{user.displayName || 'Anonymous'}</p>
                                  <p className="text-[10px] text-[#9E9E9E] font-mono">UID: {user.uid.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <p className="text-sm font-medium text-[#4A4A4A]">{user.email}</p>
                            </td>
                            <td className="p-8">
                              <select 
                                value={user.role}
                                onChange={(e) => updateUserRole(user.uid, e.target.value)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-[#F27D26] cursor-pointer ${
                                  user.role === 'admin' ? 'bg-[#F27D26]/10 text-[#F27D26]' : 
                                  user.role === 'employee' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <option value="client">Client</option>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="p-8 text-right">
                              <p className="text-xs font-bold text-[#9E9E9E]">
                                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black mb-2">No users found</h3>
                  <p className="text-[#9E9E9E] font-medium">Try adjusting your search query.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Live Chat</h2>
                  <p className="text-[#4A4A4A] font-medium">Real-time communication with clients and users.</p>
                </div>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-10 lg:h-[calc(100vh-280px)] lg:min-h-[600px]">
                {/* Chat List */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[300px] lg:h-full">
                  <div className="p-4 lg:p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#9E9E9E]">Active Conversations</h3>
                    <div className="w-8 h-8 rounded-xl bg-[#F27D26]/10 flex items-center justify-center">
                      <MessageSquare size={16} className="text-[#F27D26]" />
                    </div>
                  </div>
                  <div className="flex-grow overflow-y-auto p-4 lg:p-6 space-y-3">
                    {(() => {
                      // Prepare all conversations
                      const generalInquiryUids = Array.from(new Set([
                        ...allMessages.filter(m => !m.orderId).map(m => m.senderId),
                        ...allMessages.filter(m => !m.orderId).map(m => m.receiverId)
                      ])).filter(uid => uid !== auth.currentUser?.uid && uid !== 'admin' && uid !== '');

                      const generalChats = generalInquiryUids.map(uid => {
                        const userMsgs = allMessages.filter(m => !m.orderId && (m.senderId === uid || m.receiverId === uid || (m.receiverId === 'admin' && m.senderId === uid)));
                        const lastMsg = userMsgs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
                        return {
                          id: `user_${uid}`,
                          type: 'general',
                          title: 'General Inquiry',
                          subtitle: allUsers.find(u => u.uid === uid)?.displayName || allUsers.find(u => u.uid === uid)?.email || `User: ${uid.slice(0, 8)}`,
                          lastMsg,
                          lastTime: lastMsg?.createdAt?.toMillis() || 0
                        };
                      });

                      const orderChats = orders.filter(o => o.status !== 'cancelled').map(order => {
                        const orderMsgs = allMessages.filter(m => m.orderId === order.id);
                        const lastMsg = orderMsgs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
                        return {
                          id: order.id,
                          type: 'order',
                          title: `#${order.id.slice(0, 8)}`,
                          subtitle: order.serviceTitle,
                          lastMsg,
                          lastTime: lastMsg?.createdAt?.toMillis() || (order.createdAt as any)?.toMillis() || 0
                        };
                      });

                      // Combine and sort by last message time (descending)
                      const allChats = [...generalChats, ...orderChats].sort((a, b) => b.lastTime - a.lastTime);

                      if (allChats.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <MessageSquare size={32} className="text-gray-300 mb-4" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active chats</p>
                          </div>
                        );
                      }

                      return allChats.map(chat => (
                        <button 
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`w-full p-5 rounded-3xl transition-all text-left border group relative ${
                            selectedChatId === chat.id 
                              ? 'bg-white border-[#F27D26]/20 shadow-xl shadow-[#F27D26]/5' 
                              : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-black text-sm text-[#1A1A1A]">{chat.title}</p>
                            {chat.lastMsg && (
                              <span className="text-[10px] font-bold text-[#9E9E9E]">
                                {chat.lastMsg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-black text-[#F27D26] uppercase tracking-widest mb-2">{chat.subtitle}</p>
                          <p className="text-xs text-[#4A4A4A] line-clamp-1 font-medium group-hover:text-[#1A1A1A] transition-colors">
                            {chat.lastMsg?.text || 'No messages yet'}
                          </p>
                          {selectedChatId === chat.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F27D26] rounded-r-full" />
                          )}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[600px] lg:h-full">
                  {selectedChatId ? (
                    <>
                      <div className="p-4 lg:p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-[#F27D26]/10 flex items-center justify-center relative">
                            <User size={20} className="lg:hidden text-[#F27D26]" />
                            <User size={28} className="hidden lg:block text-[#F27D26]" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <div>
                            <p className="font-black text-lg lg:text-xl text-[#1A1A1A] tracking-tight">
                              {selectedChatId.startsWith('user_') 
                                ? (allUsers.find(u => u.uid === selectedChatId.replace('user_', ''))?.displayName || 'General Inquiry')
                                : (orders.find(o => o.id === selectedChatId)?.serviceTitle || 'Order Chat')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Session</p>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <p className="text-[10px] font-black text-[#9E9E9E] uppercase tracking-widest">
                                {selectedChatId.startsWith('user_') ? 'Client Inquiry' : `Order #${selectedChatId.slice(0, 8)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow p-4 lg:p-8 overflow-y-auto bg-[#FDFCFB] space-y-8">
                        {allMessages
                          .filter(m => {
                            if (selectedChatId.startsWith('user_')) {
                              const uid = selectedChatId.replace('user_', '');
                              return !m.orderId && (m.senderId === uid || m.receiverId === uid || (m.receiverId === 'admin' && m.senderId === uid));
                            }
                            return m.orderId === selectedChatId;
                          })
                          .map((msg, i, arr) => {
                          const isMe = msg.senderId === auth.currentUser?.uid;
                          const showTime = i === 0 || 
                            (msg.createdAt?.toMillis() - arr[i-1].createdAt?.toMillis() > 300000); // 5 minutes gap

                          return (
                            <div key={msg.id} className="space-y-2">
                              {showTime && (
                                <div className="flex justify-center my-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] bg-gray-100 px-3 py-1 rounded-full">
                                    {msg.createdAt?.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} at {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] group`}>
                                  <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm transition-all ${
                                    isMe 
                                      ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                                      : 'bg-white border border-gray-100 text-[#1A1A1A] rounded-tl-none'
                                  }`}>
                                    {msg.text}
                                  </div>
                                  <p className={`text-[10px] font-black uppercase tracking-widest mt-2 text-[#9E9E9E] opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                                    {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={scrollRef} />
                      </div>

                      <div className="p-3 lg:p-8 border-t border-gray-100 bg-white">
                        <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2 lg:space-x-4 bg-gray-50 p-1.5 lg:p-2 rounded-[32px] border border-transparent focus-within:border-[#F27D26] focus-within:bg-white transition-all shadow-sm">
                          <button type="button" className="p-2 lg:p-4 text-gray-400 hover:text-[#F27D26] transition-all">
                            <Paperclip size={20} className="lg:hidden" />
                            <Paperclip size={24} className="hidden lg:block" />
                          </button>
                          <input 
                            type="text" 
                            placeholder="Type here..."
                            className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium py-3 lg:py-4 min-w-0"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                          />
                          <button 
                            type="submit"
                            disabled={!chatMessage.trim()}
                            className="bg-[#1A1A1A] text-white p-3 lg:p-4 rounded-2xl hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 disabled:opacity-50 shrink-0"
                          >
                            <Send size={20} className="lg:hidden" />
                            <Send size={24} className="hidden lg:block" />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={40} className="text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-[#1A1A1A] mb-2">No Conversation Selected</h3>
                      <p className="text-[#9E9E9E] font-bold max-w-xs text-sm">Select a client inquiry or an order from the sidebar to start real-time communication.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mail' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Contact Messages</h2>
                  <p className="text-[#4A4A4A] font-medium">Manage inquiries from the contact form.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-widest mb-1">New Messages</p>
                    <p className="text-2xl font-black text-[#F27D26]">{contactMessages.filter(m => m.status === 'new').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-bottom border-gray-100">
                        <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#9E9E9E]">Sender</th>
                        <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#9E9E9E]">Subject & Message</th>
                        <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#9E9E9E]">Date</th>
                        <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#9E9E9E]">Status</th>
                        <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-[#9E9E9E] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {contactMessages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-gray-300" />
                              </div>
                              <p className="text-[#9E9E9E] font-bold">No messages found.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        contactMessages.map((msg) => (
                          <tr key={msg.id} className={`hover:bg-gray-50/50 transition-colors ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-10 py-8">
                              <p className="font-black text-[#1A1A1A]">{msg.name}</p>
                              <p className="text-sm text-[#4A4A4A]">{msg.email}</p>
                            </td>
                            <td className="px-10 py-8 max-w-md">
                              <p className="font-bold text-[#1A1A1A] mb-1">{msg.subject}</p>
                              <p className="text-sm text-[#4A4A4A] line-clamp-2">{msg.message}</p>
                              {msg.replyContent && (
                                <div className="mt-4 p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Admin Reply</p>
                                  <p className="text-xs text-[#4A4A4A] italic line-clamp-2">{msg.replyContent}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-8">
                              <p className="text-sm font-bold text-[#1A1A1A]">
                                {msg.createdAt?.toDate().toLocaleDateString()}
                              </p>
                              <p className="text-xs text-[#9E9E9E]">
                                {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                msg.status === 'new' ? 'bg-blue-100 text-blue-600' : 
                                msg.status === 'replied' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {msg.status}
                              </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex justify-end space-x-2">
                                {msg.status === 'new' && (
                                  <button 
                                    onClick={() => updateMessageStatus(msg.id, 'read')}
                                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"
                                    title="Mark as Read"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                                {msg.status !== 'replied' && (
                                  <button 
                                    onClick={() => {
                                      setReplyingMessageId(msg.id);
                                      setReplyContent('');
                                      setIsReplyModalOpen(true);
                                    }}
                                    className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all"
                                    title="Reply to Message"
                                  >
                                    <Mail size={18} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setConfirmDeleteId(msg.id)}
                                  className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.length === 0 ? (
                  <div className="col-span-full bg-white p-20 rounded-[40px] border border-gray-100 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-xl font-bold text-[#1A1A1A]">No testimonials yet</h3>
                    <p className="text-[#9E9E9E]">Add some client feedback to build trust.</p>
                  </div>
                ) : (
                  testimonials.map((t) => (
                    <div key={t.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={t.avatar || `https://ui-avatars.com/api/?name=${t.name}&background=random`} 
                            className="w-12 h-12 rounded-xl object-cover" 
                            alt={t.name} 
                          />
                          <div>
                            <h4 className="font-black text-[#1A1A1A]">{t.name}</h4>
                            <p className="text-xs text-[#9E9E9E] font-bold uppercase tracking-widest">{t.role}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenTestimonialModal(t)} className="p-2 bg-gray-50 text-[#1A1A1A] rounded-lg hover:bg-[#F27D26] hover:text-white transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 bg-gray-50 text-[#1A1A1A] rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed italic mb-6">"{t.content}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex text-[#F27D26]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <TrendingUp key={i} size={14} className={i < t.rating ? 'fill-current' : 'text-gray-200'} />
                          ))}
                        </div>
                        {t.featured && (
                          <span className="px-2 py-1 bg-orange-100 text-[#F27D26] text-[10px] font-black uppercase tracking-widest rounded">Featured</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.length === 0 ? (
                  <div className="col-span-full bg-white p-20 rounded-[40px] border border-gray-100 text-center">
                    <Users size={48} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-xl font-bold text-[#1A1A1A]">No team members yet</h3>
                    <p className="text-[#9E9E9E]">Build your team and showcase your experts.</p>
                  </div>
                ) : (
                  teamMembers.map((m) => (
                    <div key={m.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={m.image || `https://ui-avatars.com/api/?name=${m.name}&background=random`} 
                            className="w-16 h-16 rounded-2xl object-cover" 
                            alt={m.name} 
                          />
                          <div>
                            <h4 className="text-lg font-black text-[#1A1A1A]">{m.name}</h4>
                            <p className="text-xs text-[#F27D26] font-bold uppercase tracking-widest">{m.role}</p>
                          </div>
                        </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setAssigningExpert(m);
                            setIsAssignModalOpen(true);
                          }} 
                          className="p-2 bg-gray-50 text-[#1A1A1A] rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                          title="Assign to Order"
                        >
                          <Briefcase size={14} />
                        </button>
                        <button onClick={() => handleOpenTeamModal(m)} className="p-2 bg-gray-50 text-[#1A1A1A] rounded-lg hover:bg-[#F27D26] hover:text-white transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteTeamMember(m.id)} className="p-2 bg-gray-50 text-[#1A1A1A] rounded-lg hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      </div>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-3 mb-6">{m.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {m.specialties?.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-50 text-[#9E9E9E] text-[10px] font-bold uppercase tracking-widest rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-8 flex items-center">
                  <Settings size={24} className="text-[#F27D26] mr-4" />
                  Platform Defaults
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Platform Name</label>
                    <input 
                      type="text" 
                      value={platformSettings.platformName} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Support Email</label>
                    <input 
                      type="email" 
                      value={platformSettings.supportEmail} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Support Phone</label>
                    <input 
                      type="text" 
                      value={platformSettings.supportPhone || ''} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Office Address</label>
                    <input 
                      type="text" 
                      value={platformSettings.officeAddress || ''} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, officeAddress: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Working Hours</label>
                    <input 
                      type="text" 
                      value={platformSettings.workingHours || ''} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, workingHours: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">YouTube Showreel URL</label>
                    <input 
                      type="url" 
                      value={platformSettings.showreelUrl || ''} 
                      onChange={(e) => setPlatformSettings({ ...platformSettings, showreelUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F27D26] transition-all" 
                    />
                    <p className="text-[10px] text-[#9E9E9E] font-medium italic">This video will appear on the Home page "Watch Showreel" button.</p>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div>
                      <p className="text-sm font-bold">Maintenance Mode</p>
                      <p className="text-xs text-[#9E9E9E]">Disable client-side bookings</p>
                    </div>
                    <button 
                      onClick={() => setPlatformSettings({ ...platformSettings, maintenanceMode: !platformSettings.maintenanceMode })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${platformSettings.maintenanceMode ? 'bg-[#F27D26]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${platformSettings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isProcessing}
                    className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-[#F27D26] transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save Configuration'}
                  </button>
                </div>
              </div>

              <div className="bg-red-50 p-10 rounded-[40px] border border-red-100">
                <h3 className="text-xl font-black text-red-600 mb-4">Danger Zone</h3>
                <p className="text-sm text-red-500/70 mb-8 font-medium">Actions here are permanent and affect the entire platform inventory.</p>
                <button 
                  onClick={() => setIsClearInventoryModalOpen(true)}
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all"
                >
                  Clear All Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Client Info</p>
                  {selectedOrder.clientId === 'guest' ? (
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                      <p className="font-bold text-[#1A1A1A]">{selectedOrder.guestName}</p>
                      <p className="text-sm text-[#4A4A4A]">{selectedOrder.guestEmail}</p>
                      {selectedOrder.guestPhone && <p className="text-sm text-[#4A4A4A]">{selectedOrder.guestPhone}</p>}
                    </div>
                  ) : (
                    <p className="font-medium text-[#4A4A4A] break-all">{selectedOrder.clientId}</p>
                  )}
                </div>

                {selectedOrder.projectDetails && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Project Details</p>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">{selectedOrder.projectDetails}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'cancelled' && selectedOrder.cancellationNote && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Cancellation Reason</p>
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <p className="text-sm text-red-700 leading-relaxed italic">"{selectedOrder.cancellationNote}"</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] mb-1">Assigned Expert</p>
                  <p className="font-bold text-[#1A1A1A]">{selectedOrder.assignedExpertName || 'Not Assigned'}</p>
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

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Cancel Order</h2>
                <button onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancellationNote('');
                }} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-[#4A4A4A] mb-6">Please provide a reason for cancelling this order. This note will be visible to the client.</p>
              
              <div className="space-y-4 mb-8">
                <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Cancellation Note</label>
                <textarea 
                  rows={4}
                  placeholder="e.g., Expert unavailable for the requested timeline..."
                  className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-red-500 focus:ring-0 transition-all font-medium"
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancellationNote('');
                  }}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (cancellingOrderId) {
                      updateOrderStatus(cancellingOrderId, 'cancelled', cancellationNote);
                      setIsCancelModalOpen(false);
                      setCancellationNote('');
                    }
                  }}
                  disabled={!cancellationNote.trim()}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
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

      {/* Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-[#1A1A1A]">Reply to Message</h3>
                <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-widest mt-1">
                  {contactMessages.find(m => m.id === replyingMessageId)?.email}
                </p>
              </div>
              <button 
                onClick={() => setIsReplyModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X size={24} className="text-[#9E9E9E]" />
              </button>
            </div>
            
            <form onSubmit={handleReplySubmit} className="p-8 space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-[#9E9E9E] uppercase tracking-widest mb-2">Original Message</p>
                <p className="text-sm text-[#4A4A4A] italic">
                  "{contactMessages.find(m => m.id === replyingMessageId)?.message}"
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9E9E9E] uppercase tracking-widest ml-4">Your Reply</label>
                <textarea 
                  required
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-[#F27D26] min-h-[150px] text-sm font-medium"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-3xl font-black text-sm text-[#4A4A4A] hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-8 py-4 bg-[#F27D26] text-white rounded-3xl font-black text-sm shadow-lg shadow-[#F27D26]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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

      {/* Clear Inventory Modal */}
      <AnimatePresence>
        {isClearInventoryModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center border-4 border-red-500/20"
            >
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-3xl font-black mb-4 text-red-600">Nuclear Option</h2>
              <p className="text-[#4A4A4A] mb-10 font-medium">This will permanently delete <span className="font-black">EVERY SINGLE SERVICE</span> in your inventory. This action is irreversible. Are you absolutely certain?</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleClearInventory}
                  disabled={isProcessing}
                  className="w-full px-8 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'YES, CLEAR EVERYTHING'}
                </button>
                <button 
                  onClick={() => setIsClearInventoryModalOpen(false)}
                  disabled={isProcessing}
                  className="w-full px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel and Keep Inventory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonial Modal */}
      <AnimatePresence>
        {isTestimonialModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">
                  {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
                </h2>
                <button onClick={() => setIsTestimonialModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveTestimonial} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Client Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={testimonialFormData.name}
                      onChange={(e) => setTestimonialFormData({...testimonialFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Role / Company</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={testimonialFormData.role}
                      onChange={(e) => setTestimonialFormData({...testimonialFormData, role: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Avatar URL</label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={testimonialFormData.avatar}
                    onChange={(e) => setTestimonialFormData({...testimonialFormData, avatar: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Rating (1-5)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    max="5"
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={testimonialFormData.rating}
                    onChange={(e) => setTestimonialFormData({...testimonialFormData, rating: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Content</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={testimonialFormData.content}
                    onChange={(e) => setTestimonialFormData({...testimonialFormData, content: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <input 
                    type="checkbox"
                    id="featured"
                    className="w-5 h-5 rounded border-gray-300 text-[#F27D26] focus:ring-[#F27D26]"
                    checked={testimonialFormData.featured}
                    onChange={(e) => setTestimonialFormData({...testimonialFormData, featured: e.target.checked})}
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-[#4A4A4A]">Feature on Homepage</label>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsTestimonialModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 px-8 py-4 bg-[#F27D26] text-white rounded-2xl font-bold hover:bg-[#E06C15] transition-all shadow-lg shadow-[#F27D26]/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : editingTestimonial ? 'Update Testimonial' : 'Save Testimonial'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Member Modal */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">
                  {editingTeamMember ? 'Edit Team Member' : 'New Team Member'}
                </h2>
                <button onClick={() => setIsTeamModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveTeamMember} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Full Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={teamFormData.name}
                      onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Position</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={teamFormData.role}
                      onChange={(e) => setTeamFormData({...teamFormData, role: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Profile Image URL</label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={teamFormData.image}
                    onChange={(e) => setTeamFormData({...teamFormData, image: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Bio</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={teamFormData.bio}
                    onChange={(e) => setTeamFormData({...teamFormData, bio: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Specialties (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="React, Node.js, UI/UX"
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={teamFormData.specialties}
                    onChange={(e) => setTeamFormData({...teamFormData, specialties: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">LinkedIn URL</label>
                    <input 
                      type="url"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={teamFormData.socials.linkedin || ''}
                      onChange={(e) => setTeamFormData({...teamFormData, socials: {...teamFormData.socials, linkedin: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] ml-4">Twitter URL</label>
                    <input 
                      type="url"
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                      value={teamFormData.socials.twitter || ''}
                      onChange={(e) => setTeamFormData({...teamFormData, socials: {...teamFormData.socials, twitter: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 px-8 py-4 bg-[#F27D26] text-white rounded-2xl font-bold hover:bg-[#E06C15] transition-all shadow-lg shadow-[#F27D26]/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : editingTeamMember ? 'Update Member' : 'Save Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Testimonial Modal */}
      <AnimatePresence>
        {deletingTestimonialId && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4">Delete Testimonial?</h2>
              <p className="text-[#4A4A4A] mb-10">This action cannot be undone. Are you sure you want to remove this testimonial?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingTestimonialId(null)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deletingTestimonialId) {
                      handleDeleteTestimonial(deletingTestimonialId);
                    }
                  }}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Team Member Modal */}
      <AnimatePresence>
        {deletingTeamMemberId && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4">Remove Team Member?</h2>
              <p className="text-[#4A4A4A] mb-10">This action cannot be undone. Are you sure you want to remove this member from your team?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingTeamMemberId(null)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deletingTeamMemberId && handleDeleteTeamMember(deletingTeamMemberId)}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Expert to Order Modal */}
      <AnimatePresence>
        {isAssignModalOpen && assigningExpert && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Assign {assigningExpert.name}</h2>
                  <p className="text-sm text-[#9E9E9E] font-medium">Select an order to assign this expert to.</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 font-medium">No active orders available for assignment.</p>
                  </div>
                ) : (
                  orders
                    .filter(o => o.status !== 'cancelled' && o.status !== 'completed')
                    .map((order) => (
                      <button
                        key={order.id}
                        onClick={() => {
                          assignOrder(order.id, assigningExpert.id);
                          setIsAssignModalOpen(false);
                        }}
                        className="w-full bg-gray-50 p-6 rounded-3xl border border-transparent hover:border-[#F27D26] hover:bg-white transition-all text-left group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-[#1A1A1A] group-hover:text-[#F27D26] transition-colors">{order.serviceTitle}</h4>
                            <p className="text-xs text-[#9E9E9E] font-bold mt-1">ID: {order.id}</p>
                            <div className="flex items-center mt-3 space-x-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status === 'paid' ? 'bg-blue-100 text-blue-600' :
                                order.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-xs font-bold text-[#1A1A1A]">${order.price}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest">Currently Assigned</p>
                            <p className="text-xs font-black text-[#1A1A1A] mt-1">{order.assignedExpertName || 'None'}</p>
                          </div>
                        </div>
                      </button>
                    ))
                )}
              </div>

              <div className="pt-8 mt-auto">
                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="w-full px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {isProcessing && !isModalOpen && !selectedOrder && !deletingServiceId && !isSeedModalOpen && !isClearInventoryModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 right-8 z-[200] bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/10"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-[#F27D26] rounded-full animate-spin" />
            <span className="text-sm font-bold tracking-wide uppercase">Syncing with Cloud...</span>
          </motion.div>
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
                      required
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-bold"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Assigned Expert</label>
                    <select 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-bold"
                      value={formData.expertId}
                      onChange={(e) => setFormData({ ...formData, expertId: e.target.value })}
                    >
                      <option value="">No Default Expert</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 pt-8">
                    <input 
                      type="checkbox" 
                      id="active"
                      className="w-6 h-6 rounded-lg border-gray-200 text-[#F27D26] focus:ring-[#F27D26]"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label htmlFor="active" className="text-sm font-bold text-[#1A1A1A]">Active and Visible to Clients</label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-xl font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-[#F27D26] rounded-full animate-spin" />
                  ) : (editingService ? 'Update Service' : 'Create Service')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-between items-center z-50">
        {sidebarItems.filter(item => ['overview', 'orders', 'messages', 'mail'].includes(item.id)).map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id as AdminTab)}
            className={`flex flex-col items-center p-2 transition-all ${
              activeTab === item.id ? 'text-[#F27D26]' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black tracking-tight">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Category Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="e.g. Mobile Development"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Brand Color</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    />
                    <input 
                      type="text" 
                      className="flex-grow bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-mono text-sm"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Icon Name (Lucide)</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all font-medium"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    placeholder="Code, Layout, Video, etc."
                  />
                  <p className="text-[10px] text-[#9E9E9E] font-medium italic">Use any icon name from lucide.dev</p>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl text-xl font-bold hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-[#F27D26] rounded-full animate-spin" />
                  ) : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingCategoryId && (
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
              <h2 className="text-2xl font-black mb-4">Delete Category?</h2>
              <p className="text-[#4A4A4A] mb-10 font-medium">This will remove the category. Services in this category will remain but their category link might break. This action cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingCategoryId(null)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-[#1A1A1A] rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteCategory}
                  disabled={isProcessing}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-center mb-2">Delete Message?</h3>
              <p className="text-[#4A4A4A] text-center font-medium mb-8">
                This action cannot be undone. Are you sure you want to delete this inquiry?
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => deleteMessage(confirmDeleteId)}
                  disabled={isProcessing}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Deleting...' : 'Yes, Delete Message'}
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-full bg-gray-50 text-[#1A1A1A] py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
