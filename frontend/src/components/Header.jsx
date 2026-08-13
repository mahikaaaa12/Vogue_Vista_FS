import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, Sun, Moon, Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentScreen, setScreen, theme, setTheme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const menuItems = [
    { label: 'Home', value: 'home' },
    // { label: 'AI Stylist', value: 'analysis' },
    { label: 'Body Analysis', value: 'body-analysis' },
    { label: 'Color Analysis', value: 'color-analysis' },
    { label: 'Trending', value: 'results' },
    { label: 'Wardrobe', value: '#wardrobe', isAnchor: true },
    { label: 'Inspiration', value: '#gallery', isAnchor: true },
    { label: 'Features', value: '#features', isAnchor: true },
    { label: 'About', value: '#about', isAnchor: true }
  ];

  // Scroll listener for scrolled state background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy to track active section in viewport
  useEffect(() => {
    if (currentScreen !== 'home') {
      setActiveSection(currentScreen);
      return;
    }

    const sections = ['hero', 'wardrobe', 'gallery', 'features', 'about'];
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id === 'hero') {
            setActiveSection('home');
          } else {
            setActiveSection('#' + id);
          }
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Center viewport tracking
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentScreen]);

  const handleNav = (item) => {
    setMobileMenuOpen(false);
    if (item.isAnchor) {
      if (currentScreen !== 'home') {
        setScreen('home');
        setTimeout(() => {
          const el = document.querySelector(item.value);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        const el = document.querySelector(item.value);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setScreen(item.value);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHudAction = (actionName) => {
    alert(`Vogue Vista private ${actionName} portal is reserved for Atelier members.`);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[9999] navbar-glass ${scrolled ? 'scrolled' : ''} transition-all duration-300`}>
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-[48px] h-20 md:h-24 flex justify-between items-center transition-all duration-300">
        
        {/* Left: Typography Logo */}
        <div 
          onClick={() => handleNav({ value: 'home' })}
          className="cursor-pointer flex items-baseline gap-0.5 select-none"
        >
          <span className="font-editorial text-xl md:text-2xl font-light tracking-widest text-lux-text-primary uppercase">
            Vogue
          </span>
          <span className="font-editorial text-xs font-light italic text-lux-gold ml-0.5">
            Vista
          </span>
        </div>

        {/* Center: Desktop Menu with ScrollSpy */}
        <nav className="hidden lg:flex gap-6 xl:gap-8 items-center h-full">
          {menuItems.map((item, idx) => {
            const isActive = activeSection === item.value;
            return (
              <button
                key={idx}
                onClick={() => handleNav(item)}
                className={`font-accent text-[10px] tracking-widest uppercase relative py-2 transition-colors duration-300 h-full flex items-center ${
                  isActive 
                    ? 'text-lux-text-primary font-medium' 
                    : 'text-lux-text-muted hover:text-lux-text-primary'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeUnderline"
                    className="absolute bottom-6 left-0 w-full h-[1.5px] bg-[#C8A46B]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: HUD Panel */}
        <div className="hidden lg:flex gap-2 xl:gap-2 items-center">
          {/* Search */}
          {/* <button 
            onClick={() => handleHudAction('Search')}
            className="text-lux-text-muted hover:text-lux-text-primary transition-colors duration-300"
            title="Search Styles"
          >
            <Search size={16} />
          </button>

          {/* Wishlist 
          <button 
            onClick={() => handleHudAction('Wishlist')}
            className="text-lux-text-muted hover:text-lux-text-primary transition-colors duration-300"
            title="Wishlist"
          >
            <Heart size={16} />
          </button>

          {/* Cart 
          <button 
            onClick={() => handleHudAction('Cart')}
            className="text-lux-text-muted hover:text-lux-text-primary transition-colors duration-300"
            title="Shopping Cart"
          >
            <ShoppingBag size={16} />
          </button> */}

          {/* Login / Register */}
          {!isAuthenticated && (
            <>
              <button 
                onClick={() => handleNav({ value: 'login' })}
                className={`font-accent text-[10px] tracking-widest uppercase transition-colors duration-300 ${
                  currentScreen === 'login' ? 'text-lux-gold' : 'text-lux-text-muted hover:text-lux-text-primary'
                }`}
              >
                Login
              </button>
              <span className="text-lux-border-light text-[10px] select-none">/</span>
              <button 
                onClick={() => handleNav({ value: 'register' })}
                className={`font-accent text-[10px] tracking-widest uppercase transition-colors duration-300 ${
                  currentScreen === 'register' ? 'text-lux-gold' : 'text-lux-text-muted hover:text-lux-text-primary'
                }`}
              >
                Register
              </button>
              <span className="w-px h-4 bg-lux-border-light" />
            </>
          )}

          {/* Profile */}
          {isAuthenticated && (
            <>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`text-lux-text-muted hover:text-lux-text-primary transition-colors duration-300 p-1 flex items-center ${
                    dropdownOpen ? 'text-lux-gold' : ''
                  }`}
                  title="Atelier Profile"
                >
                  <User size={16} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl border border-lux-border-light bg-[#FAF8F5]/95 dark:bg-[#121118]/95 backdrop-blur-[24px] shadow-premium p-4 z-[10000] text-left flex flex-col gap-3"
                      style={{
                        backgroundColor: 'rgba(250, 248, 245, 0.95)',
                      }}
                    >
                      <div className="flex flex-col gap-1 border-b border-lux-border-light/10 pb-2">
                        <span className="font-accent text-[9px] tracking-widest text-lux-gold uppercase font-semibold">
                          ATELIER MEMBER
                        </span>
                        <span className="font-editorial text-sm font-medium text-lux-text-primary truncate">
                          {user?.name || 'Vogue Vista Member'}
                        </span>
                        <span className="font-ui text-[9px] text-lux-text-secondary truncate">
                          {user?.email || ''}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setScreen('dashboard');
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-lux-text-secondary hover:text-lux-text-primary hover:bg-lux-gold/10 transition-colors duration-200 text-left font-ui font-light w-full"
                        >
                          <LayoutDashboard size={12} className="text-lux-gold" />
                          <span>Dashboard</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            setScreen('home');
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-left font-ui font-light w-full"
                        >
                          <LogOut size={12} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="w-px h-4 bg-lux-border-light" />
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-8 h-8 border border-lux-border-light rounded-full flex items-center justify-center text-lux-text-primary relative overflow-hidden transition-colors duration-300 hover:border-lux-gold"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <motion.div
              initial={false}
              animate={{ 
                rotate: theme === 'light' ? 0 : 180, 
                scale: theme === 'light' ? 1 : 0 
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute"
            >
              <Sun size={13} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ 
                rotate: theme === 'dark' ? 0 : -180, 
                scale: theme === 'dark' ? 1 : 0 
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute"
            >
              <Moon size={13} />
            </motion.div>
          </button>
        </div>

        {/* Mobile menu controls */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Mobile Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-8 h-8 border border-lux-border-light rounded-full flex items-center justify-center text-lux-text-primary relative overflow-hidden"
          >
            {theme === 'light' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-lux-text-primary focus:outline-none"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute top-20 left-0 w-full navbar-glass px-6 py-8 flex flex-col gap-5 lg:hidden shadow-xl z-[9999]"
            >
              {menuItems.map((item, idx) => {
                const isActive = activeSection === item.value;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNav(item)}
                    className={`font-accent text-xs tracking-widest uppercase text-left py-2 border-b border-lux-border-light/20 flex justify-between items-center ${
                      isActive ? 'text-lux-text-primary font-medium' : 'text-lux-text-muted'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C8A46B]" />}
                  </button>
                );
              })}

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-lux-border-light mt-2 justify-items-center">
                <button onClick={() => handleHudAction('Search')} className="text-lux-text-muted hover:text-lux-text-primary p-2"><Search size={16} /></button>
                <button onClick={() => handleHudAction('Wishlist')} className="text-lux-text-muted hover:text-lux-text-primary p-2"><Heart size={16} /></button>
                <button onClick={() => handleHudAction('Cart')} className="text-lux-text-muted hover:text-lux-text-primary p-2"><ShoppingBag size={16} /></button>
                <button onClick={() => { setMobileMenuOpen(false); setScreen(isAuthenticated ? 'dashboard' : 'login'); }} className="text-lux-text-muted hover:text-lux-text-primary p-2"><User size={16} /></button>
              </div>

              {/* Start Scan Mobile button */}
              <button 
                className="btn-lux w-full mt-4 flex items-center justify-center gap-2 py-3.5 text-[9px] tracking-widest"
                onClick={() => handleNav({ value: 'analysis' })}
              >
                <Sparkles size={12} className="text-lux-gold" />
                <span>START ATELIER SCAN</span>
              </button>

              {/* Mobile Login / Register or Profile/Logout Row */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3 border-t border-lux-border-light/20 pt-4 mt-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-lux-gold/20 text-lux-gold flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-accent text-[10px] font-semibold text-lux-text-primary">{user?.name || 'Atelier Member'}</span>
                      <span className="font-ui text-[8px] text-lux-text-muted">{user?.email || ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setMobileMenuOpen(false); setScreen('dashboard'); }}
                      className="font-accent text-[9px] tracking-widest uppercase text-lux-text-primary flex-1 text-center py-3 border border-lux-border-medium rounded-full hover:border-lux-gold transition-colors duration-300"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); logout(); setScreen('home'); }}
                      className="font-accent text-[9px] tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex-1 text-center py-3 rounded-full hover:opacity-90 transition-opacity duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 border-t border-lux-border-light/20 pt-4 mt-2">
                  <button 
                    onClick={() => handleNav({ value: 'login' })}
                    className="font-accent text-[9px] tracking-widest uppercase text-lux-text-primary flex-1 text-center py-3 border border-lux-border-medium rounded-full hover:border-lux-gold transition-colors duration-300"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNav({ value: 'register' })}
                    className="font-accent text-[9px] tracking-widest uppercase bg-lux-text-primary text-lux-bg-primary flex-1 text-center py-3 rounded-full hover:opacity-90 transition-opacity duration-300"
                  >
                    Register
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
