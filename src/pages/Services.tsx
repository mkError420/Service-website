import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Service, Category } from '../types';
import ServiceCard from '../components/ServiceCard';
import { Search, Filter, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, X, Star } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const qServices = query(collection(db, 'services'), where('active', '==', true));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
      setIsLoading(false);
    });

    const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
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

    // Price filtering
    result = result.filter(s => s.price >= priceRange.min && s.price <= priceRange.max);

    // Rating filtering
    if (minRating > 0) {
      result = result.filter(s => (s.rating || 0) >= minRating);
    }

    if (sortBy === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating: High to Low') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredServices(result);
    setCurrentPage(1);
  }, [services, selectedCategory, searchTerm, sortBy, priceRange, minRating]);

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
      <div className="mb-24 text-center">
        <h1 className="font-display text-6xl md:text-8xl font-black mb-8 tracking-[-0.05em] leading-[0.9]">
          All Services<span className="text-[#F27D26]">.</span>
        </h1>
        <p className="text-[#4A4A4A] max-w-2xl mx-auto text-xl font-medium opacity-60">
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

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#F27D26] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#F27D26] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-[#F27D26] text-white' : 'bg-gray-50 text-[#1A1A1A] hover:bg-gray-100'}`}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <div className="relative flex-1 md:flex-none">
              <select 
                className="w-full md:w-64 appearance-none bg-gray-50 border-transparent pl-6 pr-12 py-4 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#F27D26] focus:ring-0 transition-all cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-8 border-t border-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Categories */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#9E9E9E] mb-6">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchParams({});
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedCategory === 'All' 
                          ? 'bg-[#1A1A1A] text-white' 
                          : 'bg-gray-50 text-[#4A4A4A] hover:bg-gray-100'
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
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          selectedCategory === cat.name 
                            ? 'bg-[#1A1A1A] text-white' 
                            : 'bg-gray-50 text-[#4A4A4A] hover:bg-gray-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#9E9E9E] mb-6">Price Range</h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>${priceRange.min}</span>
                      <span>${priceRange.max}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10000" 
                      step="100"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#9E9E9E] uppercase mb-1 block">Min</label>
                        <input 
                          type="number" 
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-[#F27D26]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#9E9E9E] uppercase mb-1 block">Max</label>
                        <input 
                          type="number" 
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-[#F27D26]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#9E9E9E] mb-6">Minimum Rating</h4>
                  <div className="flex flex-wrap gap-3">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                          minRating === rating 
                            ? 'bg-[#1A1A1A] text-white' 
                            : 'bg-gray-50 text-[#4A4A4A] hover:bg-gray-100'
                        }`}
                      >
                        {rating === 0 ? 'Any' : (
                          <>
                            <span>{rating}+</span>
                            <Star size={14} className="fill-current" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {(selectedCategory !== 'All' || searchTerm || priceRange.min > 0 || priceRange.max < 10000 || minRating > 0) && (
          <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#9E9E9E] uppercase tracking-widest mr-2">Active Filters:</span>
            {selectedCategory !== 'All' && (
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchParams({}); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27D26]/10 text-[#F27D26] rounded-full text-xs font-bold hover:bg-[#F27D26]/20 transition-all"
              >
                <span>Category: {selectedCategory}</span>
                <X size={14} />
              </button>
            )}
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27D26]/10 text-[#F27D26] rounded-full text-xs font-bold hover:bg-[#F27D26]/20 transition-all"
              >
                <span>Search: {searchTerm}</span>
                <X size={14} />
              </button>
            )}
            {(priceRange.min > 0 || priceRange.max < 10000) && (
              <button 
                onClick={() => setPriceRange({ min: 0, max: 10000 })}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27D26]/10 text-[#F27D26] rounded-full text-xs font-bold hover:bg-[#F27D26]/20 transition-all"
              >
                <span>Price: ${priceRange.min} - ${priceRange.max}</span>
                <X size={14} />
              </button>
            )}
            {minRating > 0 && (
              <button 
                onClick={() => setMinRating(0)}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27D26]/10 text-[#F27D26] rounded-full text-xs font-bold hover:bg-[#F27D26]/20 transition-all"
              >
                <span>Rating: {minRating}+</span>
                <X size={14} />
              </button>
            )}
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSearchParams({});
                setPriceRange({ min: 0, max: 10000 });
                setMinRating(0);
              }}
              className="text-xs font-bold text-[#F27D26] hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-100 rounded-[3rem] h-[500px] animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" 
            : "flex flex-col gap-10"
          }>
            <AnimatePresence mode="popLayout">
              {paginatedServices.map((service, i) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  index={i} 
                  layout={viewMode}
                />
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
              setPriceRange({ min: 0, max: 10000 });
              setMinRating(0);
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
