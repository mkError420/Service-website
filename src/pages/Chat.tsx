import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { Message, UserProfile, Order } from '../types';
import { Send, User as UserIcon, ShieldCheck, MessageSquare, ArrowLeft, MoreVertical, Paperclip, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId');
  const initialServiceId = searchParams.get('serviceId');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>(initialOrderId || 'general');
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (initialOrderId || initialServiceId) {
      setShowSidebar(false);
    }

    if (initialServiceId) {
      const fetchService = async () => {
        try {
          const serviceDoc = await getDoc(doc(db, 'services', initialServiceId));
          if (serviceDoc.exists()) {
            const serviceData = serviceDoc.data();
            setNewMessage(`Hi, I'm interested in your "${serviceData.title}" service. Could you provide more details?`);
          }
        } catch (error) {
          console.error("Error fetching service for chat:", error);
        }
      };
      fetchService();
    }
  }, [initialOrderId, initialServiceId]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();

    // Fetch user's orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('clientId', '==', auth.currentUser.uid)
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(o);
    });

    // Fetch all messages involving the user
    // We use two listeners because Firestore doesn't support OR queries across different fields easily without complex setup
    let sentMsgs: Message[] = [];
    let receivedMsgs: Message[] = [];

    const updateMessages = () => {
      const all = [...sentMsgs, ...receivedMsgs];
      // Remove duplicates and sort
      const unique = Array.from(new Map(all.map(m => [m.id, m])).values());
      unique.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setMessages(unique);
    };

    const qSender = query(
      collection(db, 'messages'),
      where('senderId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'asc')
    );
    const unsubscribeSender = onSnapshot(qSender, (snapshot) => {
      sentMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      updateMessages();
    }, (error) => {
      console.error("Error fetching sent messages:", error);
    });

    const qReceiver = query(
      collection(db, 'messages'),
      where('receiverId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'asc')
    );
    const unsubscribeReceiver = onSnapshot(qReceiver, (snapshot) => {
      receivedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      updateMessages();
    }, (error) => {
      console.error("Error fetching received messages:", error);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeSender();
      unsubscribeReceiver();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      const msgData = {
        senderId: auth.currentUser.uid,
        receiverId: 'admin',
        text: newMessage,
        orderId: selectedChatId === 'general' ? '' : selectedChatId,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'messages'), msgData);
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    }
  };

  const activeMessages = messages.filter(m => {
    if (selectedChatId === 'general') {
      return !m.orderId;
    }
    return m.orderId === selectedChatId;
  });

  const activeOrder = orders.find(o => o.id === selectedChatId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-[calc(100vh-160px)]">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 h-full flex overflow-hidden relative">
        
        {/* Sidebar: Chats List */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-gray-50 bg-gray-50/30 absolute md:relative inset-0 z-20 md:z-0`}>
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight flex items-center">
              <MessageSquare size={24} className="text-[#F27D26] mr-3" />
              Messages
            </h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {(() => {
              // Prepare all conversations
              const generalLastMsg = messages.filter(m => !m.orderId).pop();
              const generalChat = {
                id: 'general',
                type: 'general',
                title: 'General Support',
                subtitle: 'Admin Team',
                icon: <ShieldCheck size={24} />,
                lastMsg: generalLastMsg,
                lastTime: generalLastMsg?.createdAt?.toMillis() || 0
              };

              const orderChats = orders.map(order => {
                const orderLastMsg = messages.filter(m => m.orderId === order.id).pop();
                return {
                  id: order.id,
                  type: 'order',
                  title: order.serviceTitle,
                  subtitle: `Order #${order.id.slice(0, 8)}`,
                  icon: <Package size={24} />,
                  lastMsg: orderLastMsg,
                  lastTime: orderLastMsg?.createdAt?.toMillis() || (order.createdAt as any)?.toMillis() || 0
                };
              });

              // Combine and sort by last message time (descending)
              const allChats = [generalChat, ...orderChats].sort((a, b) => b.lastTime - a.lastTime);

              return allChats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    setShowSidebar(false);
                  }}
                  className={`w-full p-4 rounded-3xl transition-all text-left border ${
                    selectedChatId === chat.id 
                      ? 'bg-white border-[#F27D26]/20 shadow-lg shadow-[#F27D26]/5' 
                      : 'border-transparent hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      chat.type === 'general' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F27D26]/10 text-[#F27D26]'
                    }`}>
                      {chat.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-sm truncate">{chat.title}</p>
                        {chat.lastMsg && (
                          <span className="text-[10px] font-bold text-[#9E9E9E]">
                            {chat.lastMsg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-widest mb-1">{chat.subtitle}</p>
                      {chat.lastMsg && (
                        <p className="text-xs text-[#4A4A4A] truncate font-medium">{chat.lastMsg.text}</p>
                      )}
                    </div>
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-grow flex flex-col bg-white ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-gray-400"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center relative">
                {selectedChatId === 'general' ? <ShieldCheck size={24} className="text-[#F27D26]" /> : <Package size={24} className="text-[#1A1A1A]" />}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight">
                  {selectedChatId === 'general' ? 'General Support' : (activeOrder?.serviceTitle || 'Order Chat')}
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-[10px] text-[#9E9E9E] font-black uppercase tracking-widest">
                    {selectedChatId === 'general' ? 'Admin Team' : `Order #${selectedChatId.slice(0, 8)}`}
                  </p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-gray-400 hover:text-[#1A1A1A]">
                <Clock size={20} />
              </button>
              <button className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-gray-400 hover:text-[#1A1A1A]">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#FDFCFB]">
            {activeMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-gray-200" />
                </div>
                <h4 className="font-black text-lg mb-2">No messages yet</h4>
                <p className="text-[#9E9E9E] font-bold max-w-xs text-sm">Start the conversation by sending a message below. Our team is ready to help!</p>
              </div>
            ) : (
              activeMessages.map((msg, i, arr) => {
                const isMe = msg.senderId === auth.currentUser?.uid;
                const showTime = i === 0 || 
                  (msg.createdAt?.toMillis() - arr[i-1].createdAt?.toMillis() > 300000); // 5 minutes gap

                return (
                  <div key={msg.id} className="space-y-4">
                    {showTime && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#9E9E9E] bg-gray-100 px-3 py-1 rounded-full">
                          {msg.createdAt?.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} at {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group ${isMe ? 'order-2' : 'order-1'}`}>
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
                    </motion.div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-gray-50 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4 bg-gray-50 p-2 rounded-[32px] border border-transparent focus-within:border-[#F27D26] focus-within:bg-white transition-all shadow-sm">
              <button type="button" className="p-4 text-gray-400 hover:text-[#F27D26] transition-all">
                <Paperclip size={24} />
              </button>
              <input 
                type="text" 
                placeholder="Type your message here..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium py-4"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#1A1A1A] text-white p-4 rounded-2xl hover:bg-[#F27D26] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
