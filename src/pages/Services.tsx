import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Service, Category } from '../types';
import ServiceCard from '../components/ServiceCard';
import { Search, Filter, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'All');
  const [sortBy, setSortBy] = useState('Newest');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const qServices = query(collection(db, 'services'), where('active', '==', true));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error (services):", error);
    });

    const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      console.error("Firestore Error (categories):", error);
    });

    return () => {
      unsubServices();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    let result = services;

    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    setFilteredServices(result);
    setCurrentPage(1);
  }, [services, selectedCategory, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">All Services<span className="text-[#F27D26]">.</span></h1>
        <p className="text-[#4A4A4A] max-w-2xl mx-auto text-lg">
          Browse our curated selection of high-end digital services designed to help you succeed in the digital age.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 mb-16 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search services..."
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="relative w-full md:w-auto">
            <select 
              className="w-full md:w-64 appearance-none bg-gray-50 border-transparent pl-6 pr-12 py-4 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Categories List (Static) */}
        <div className="pt-6 border-t border-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchParams({});
              }}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === 'All' 
                  ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10' 
                  : 'bg-gray-50 text-[#4A4A4A] hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSearchParams({ cat: cat.name });
                }}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === cat.name 
                    ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10' 
                    : 'bg-gray-50 text-[#4A4A4A] hover:bg-gray-100 border border-transparent hover:border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-100 rounded-[40px] h-[500px] animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {paginatedServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${
                      currentPage === page
                        ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10'
                        : 'bg-white border border-gray-100 text-[#4A4A4A] hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No services found</h3>
          <p className="text-[#9E9E9E]">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSearchParams({});
            }}
            className="mt-8 text-[#F27D26] font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
