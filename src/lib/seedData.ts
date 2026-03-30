import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const seedServices = async () => {
  const categories = [
    { name: 'MERN Stack', icon: 'Code', color: '#F27D26', createdAt: Timestamp.now() },
    { name: 'WordPress', icon: 'Monitor', color: '#1A1A1A', createdAt: Timestamp.now() },
    { name: 'Video Editing', icon: 'Video', color: '#F27D26', createdAt: Timestamp.now() },
    { name: 'Digital Marketing', icon: 'TrendingUp', color: '#1A1A1A', createdAt: Timestamp.now() },
  ];

  // Add categories first
  await Promise.all(categories.map(cat => addDoc(collection(db, 'categories'), cat)));

  const services = [
    // MERN Stack (7)
    {
      title: "Enterprise E-commerce Solution",
      description: "A robust, scalable MERN stack e-commerce platform with advanced features like multi-vendor support, real-time inventory, and AI-driven recommendations.",
      price: 2500,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089&auto=format&fit=crop",
      features: ["Multi-vendor Support", "Real-time Inventory", "Stripe/PayPal Integration", "Admin Dashboard"],
      active: true
    },
    {
      title: "Real-time Collaboration Tool",
      description: "Build a custom collaboration platform like Slack or Trello using Socket.io and MERN stack for seamless team communication.",
      price: 1800,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1522071823991-b1ae5e6a3048?q=80&w=2070&auto=format&fit=crop",
      features: ["Socket.io Integration", "File Sharing", "Task Management", "Push Notifications"],
      active: true
    },
    {
      title: "Custom SaaS Dashboard",
      description: "High-performance SaaS dashboard with complex data visualization, user management, and subscription billing.",
      price: 1500,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop",
      features: ["Data Visualization", "User Roles", "Subscription Billing", "API Integration"],
      active: true
    },
    {
      title: "Health & Fitness Tracker App",
      description: "A comprehensive health tracking application with workout plans, calorie counting, and progress charts.",
      price: 1200,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
      features: ["Workout Logs", "Calorie Tracker", "Progress Charts", "Social Sharing"],
      active: true
    },
    {
      title: "Real Estate Listing Portal",
      description: "Feature-rich real estate portal with map integration, advanced search filters, and agent management.",
      price: 2200,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
      features: ["Google Maps API", "Advanced Search", "Agent Profiles", "Lead Management"],
      active: true
    },
    {
      title: "LMS Platform Development",
      description: "Custom Learning Management System with course creation, student tracking, and certification generation.",
      price: 3000,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2074&auto=format&fit=crop",
      features: ["Course Builder", "Quiz System", "Certification", "Student Progress"],
      active: true
    },
    {
      title: "Job Board Application",
      description: "A modern job board with resume parsing, applicant tracking, and employer dashboards.",
      price: 1600,
      category: "MERN Stack",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop",
      features: ["Resume Parsing", "Applicant Tracking", "Employer Dashboard", "Job Alerts"],
      active: true
    },

    // WordPress (7)
    {
      title: "Premium Business Website",
      description: "Professional WordPress website tailored for corporate businesses with SEO optimization and mobile responsiveness.",
      price: 800,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      features: ["Custom Theme", "SEO Optimized", "Mobile Responsive", "Contact Forms"],
      active: true
    },
    {
      title: "High-Converting Landing Page",
      description: "Fast-loading, conversion-focused landing page built with Elementor Pro or Gutenberg.",
      price: 400,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop",
      features: ["Elementor Pro", "A/B Testing Ready", "Fast Loading", "Lead Capture"],
      active: true
    },
    {
      title: "WooCommerce Multi-vendor Store",
      description: "Complete multi-vendor marketplace setup using WooCommerce and Dokan/WCFM.",
      price: 1500,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop",
      features: ["Multi-vendor Setup", "Vendor Dashboard", "Commission System", "Payment Gateways"],
      active: true
    },
    {
      title: "WordPress Speed Optimization",
      description: "Boost your WordPress site speed to 90+ on Google PageSpeed Insights.",
      price: 200,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop",
      features: ["Image Optimization", "Database Cleanup", "Caching Setup", "CDN Integration"],
      active: true
    },
    {
      title: "Membership & Subscription Site",
      description: "Build a recurring revenue stream with a custom WordPress membership site.",
      price: 1200,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1556742049-0adff456a477?q=80&w=2070&auto=format&fit=crop",
      features: ["MemberPress Setup", "Content Dripping", "Subscription Billing", "User Forums"],
      active: true
    },
    {
      title: "News & Magazine Portal",
      description: "High-traffic news portal with category management, ad integration, and social sharing.",
      price: 900,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop",
      features: ["Ad Management", "Social Sharing", "Newsletter Setup", "AMP Ready"],
      active: true
    },
    {
      title: "Personal Blog Setup",
      description: "Clean, modern personal blog setup with essential plugins and SEO configuration.",
      price: 300,
      category: "WordPress",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop",
      features: ["Clean Design", "Essential Plugins", "SEO Config", "Social Links"],
      active: true
    },

    // Video Editing (6)
    {
      title: "Cinematic Brand Story",
      description: "Tell your brand's story with a high-quality cinematic video that resonates with your audience.",
      price: 1000,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070&auto=format&fit=crop",
      features: ["Color Grading", "Sound Design", "4K Export", "Storyboarding"],
      active: true
    },
    {
      title: "YouTube Channel Growth Pack",
      description: "Professional editing for 4 YouTube videos per month to boost your channel's engagement.",
      price: 500,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1524508762098-fd966ffb6ef9?q=80&w=2070&auto=format&fit=crop",
      features: ["Dynamic Cuts", "Subtitles", "B-roll Integration", "Thumbnail Design"],
      active: true
    },
    {
      title: "Social Media Reels (Pack of 10)",
      description: "10 high-energy short-form videos optimized for Instagram Reels, TikTok, and YouTube Shorts.",
      price: 300,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop",
      features: ["Vertical Format", "Trending Music", "Captions", "Fast Paced"],
      active: true
    },
    {
      title: "Corporate Event Highlights",
      description: "Capture the best moments of your corporate event with a professional highlight reel.",
      price: 1200,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
      features: ["Multi-cam Editing", "Interview Audio", "Logo Animation", "Quick Turnaround"],
      active: true
    },
    {
      title: "Product Explainer Animation",
      description: "2D animated explainer video to showcase your product's features and benefits.",
      price: 800,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
      features: ["Custom Illustration", "Voiceover", "Motion Graphics", "Script Writing"],
      active: true
    },
    {
      title: "Music Video Editing",
      description: "Creative post-production for music videos with advanced effects and rhythmic editing.",
      price: 1500,
      category: "Video Editing",
      image: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1974&auto=format&fit=crop",
      features: ["Visual Effects", "Rhythmic Editing", "Color Styling", "Multi-version Export"],
      active: true
    },

    // Digital Marketing (6)
    {
      title: "Full SEO Audit & Strategy",
      description: "Comprehensive SEO audit followed by a 6-month growth strategy to dominate search results.",
      price: 600,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?q=80&w=1974&auto=format&fit=crop",
      features: ["Keyword Research", "On-page SEO", "Backlink Audit", "Competitor Analysis"],
      active: true
    },
    {
      title: "Google Ads Management",
      description: "Expert management of your Google Search and Display ads to maximize ROI.",
      price: 1000,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop",
      features: ["Campaign Setup", "Ad Copywriting", "Conversion Tracking", "Monthly Reports"],
      active: true
    },
    {
      title: "Social Media Management (Monthly)",
      description: "Full management of 3 social media platforms with daily posts and engagement.",
      price: 800,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop",
      features: ["Content Calendar", "Graphic Design", "Community Management", "Analytics"],
      active: true
    },
    {
      title: "Email Marketing Automation",
      description: "Set up automated email sequences to nurture leads and drive sales.",
      price: 500,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop",
      features: ["Welcome Series", "Abandoned Cart", "List Segmentation", "Template Design"],
      active: true
    },
    {
      title: "Facebook Ads Campaign",
      description: "Targeted Facebook and Instagram ad campaigns to reach your ideal customers.",
      price: 700,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=2070&auto=format&fit=crop",
      features: ["Audience Targeting", "Creative Testing", "Pixel Setup", "Retargeting"],
      active: true
    },
    {
      title: "Content Marketing Plan",
      description: "A data-driven content plan including blog topics, social strategy, and distribution.",
      price: 400,
      category: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2074&auto=format&fit=crop",
      features: ["Topic Research", "Content Calendar", "Distribution Strategy", "SEO Guidelines"],
      active: true
    }
  ];

  await Promise.all(services.map(service => addDoc(collection(db, 'services'), service)));
};
