import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Message, UserProfile } from '../types';
import { Send, User as UserIcon, ShieldCheck, MessageSquare, ArrowLeft, MoreVertical, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chatPartner, setChatPartner] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch current user profile
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    };
    fetchProfile();

    // Fetch messages
    const q = query(
      collection(db, 'messages'),
      where('orderId', '==', orderId || ''),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      // Filter for current user's conversation
      const filtered = msgs.filter(m => 
        m.senderId === auth.currentUser?.uid || 
        m.receiverId === auth.currentUser?.uid ||
        (profile?.role === 'admin' && (m.senderId === auth.currentUser?.uid || m.receiverId === auth.currentUser?.uid || m.receiverId === 'admin'))
      );
      
      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    if (!auth.currentUser || !messages.length || !profile) return;
    
    if (profile.role === 'admin') {
      const otherPartyId = messages.find(m => m.senderId !== auth.currentUser?.uid)?.senderId;
      if (otherPartyId && otherPartyId !== 'admin') {
        getDoc(doc(db, 'users', otherPartyId)).then(docSnap => {
          if (docSnap.exists()) {
            setChatPartner(docSnap.data() as UserProfile);
          }
        });
      }
    }
  }, [messages, profile]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      let receiverId = 'admin';
      
      if (profile?.role === 'admin') {
        // If admin is in this view, try to find the client
        const otherParty = messages.find(m => m.senderId !== auth.currentUser?.uid);
        receiverId = otherParty?.senderId || 'client';
      }

      const msgData = {
        senderId: auth.currentUser.uid,
        receiverId: receiverId,
        text: newMessage,
        orderId: orderId || '',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'messages'), msgData);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-[calc(100vh-160px)]">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 h-full flex overflow-hidden">
        
        {/* Sidebar: Chats List (Simplified) */}
        <div className="hidden md:flex flex-col w-80 border-r border-gray-50 bg-gray-50/30">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-2xl font-black tracking-tight flex items-center">
              <MessageSquare size={24} className="text-[#F27D26] mr-3" />
              Messages
            </h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[#F27D26]/20 shadow-lg shadow-[#F27D26]/5 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-white font-bold">
                  {profile?.role === 'admin' ? 'C' : 'A'}
                </div>
                <div>
                  <p className="font-bold text-sm">{profile?.role === 'admin' ? 'Client Support' : 'Project Manager'}</p>
                  <p className="text-xs text-[#9E9E9E] font-medium">Active now</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button className="md:hidden p-2 bg-gray-50 rounded-xl mr-2">
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center relative">
                {profile?.role === 'admin' ? <UserIcon size={24} className="text-[#1A1A1A]" /> : <ShieldCheck size={24} className="text-[#F27D26]" />}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {profile?.role === 'admin' 
                    ? (chatPartner?.displayName || chatPartner?.email || 'Client') 
                    : 'Admin Support'}
                </h3>
                <p className="text-xs text-[#9E9E9E] font-bold uppercase tracking-widest">
                  {orderId ? `Order #${orderId.slice(0, 8)}` : 'General Inquiry'}
                </p>
              </div>
            </div>
            <button className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#FDFCFB]">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === auth.currentUser?.uid;
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                    <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-[#1A1A1A] rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 text-[#9E9E9E] ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-gray-50">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4 bg-gray-50 p-2 rounded-[32px] border border-transparent focus-within:border-[#F27D26] focus-within:bg-white transition-all">
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
