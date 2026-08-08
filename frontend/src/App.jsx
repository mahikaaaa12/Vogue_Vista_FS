import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';

// Shared Authentication Context & Protected Routes
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Shared Components (Landing, Auth, Navbar, Footer)
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import WardrobeCarousel from './components/WardrobeCarousel';
import HowItWorks from './components/HowItWorks';
import VideoShowcase from './components/VideoShowcase';
import AICapabilities from './components/AICapabilities';
import Testimonials from './components/Testimonials';
import Statistics from './components/Statistics';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AnalysisSelection from './components/AnalysisSelection';

// Body Analysis Module Components
import BodyAnalysisExperience from './modules/body_analysis/components/BodyAnalysisPortal';
import ManualMeasurements from './modules/body_analysis/components/ManualMeasurements';
import PhotoAnalysis from './modules/body_analysis/components/PhotoAnalysis';
import BodyAnalysisScan from './modules/body_analysis/components/AnalysisExperience';
import BodyResultsPage from './modules/body_analysis/components/ResultsPage';

// Color Analysis Module Components
import ColorAnalysisExperience from './modules/color_analysis/components/ColorAnalysisExperience';
import ColorResultsPage from './modules/color_analysis/components/ColorResultsPage';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();

  const [screen, setScreenState] = useState(() => {
    const path = window.location.pathname;
    if (path === '/analysis-selection') return 'analysis-selection';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/body-analysis') return 'body-analysis';
    if (path === '/body-analysis/measurements') return 'body-analysis-measurements';
    if (path === '/body-analysis/photo-analysis') return 'body-analysis-photo';
    if (path === '/analysis') return 'analysis-selection';
    if (path === '/results') return 'results';
    if (path === '/color-analysis') return 'color-analysis';
    if (path === '/color-analysis/results') return 'color-results';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return 'home';
  });

  const setScreen = (newScreen) => {
    setScreenState(newScreen);
    let path = '/';
    if (newScreen === 'analysis-selection') path = '/analysis-selection';
    else if (newScreen === 'dashboard') path = '/dashboard';
    else if (newScreen === 'body-analysis') path = '/body-analysis';
    else if (newScreen === 'body-analysis-measurements') path = '/body-analysis/measurements';
    else if (newScreen === 'body-analysis-photo') path = '/body-analysis/photo-analysis';
    else if (newScreen === 'analysis') path = '/analysis-selection';
    else if (newScreen === 'results') path = '/results';
    else if (newScreen === 'color-analysis') path = '/color-analysis';
    else if (newScreen === 'color-results') path = '/color-analysis/results';
    else if (newScreen === 'login') path = '/login';
    else if (newScreen === 'register') path = '/register';
    else if (newScreen === 'home') path = '/';
    else path = `/${newScreen}`;
    
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/analysis-selection') setScreenState('analysis-selection');
      else if (path === '/dashboard') setScreenState('dashboard');
      else if (path === '/body-analysis') setScreenState('body-analysis');
      else if (path === '/body-analysis/measurements') setScreenState('body-analysis-measurements');
      else if (path === '/body-analysis/photo-analysis') setScreenState('body-analysis-photo');
      else if (path === '/analysis') setScreenState('analysis');
      else if (path === '/results') setScreenState('results');
      else if (path === '/color-analysis') setScreenState('color-analysis');
      else if (path === '/color-analysis/results') setScreenState('color-results');
      else if (path === '/login') setScreenState('login');
      else if (path === '/register') setScreenState('register');
      else setScreenState('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [screen]);

  const handleScanComplete = () => {
    const goldPalette = ['#C5A880', '#DFCDA8', '#FAF8F5', '#8D7A68'];
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: goldPalette,
      disableForced3d: true
    });

    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleColorScanComplete = () => {
    const colorPalette = ['#FB923C', '#38BDF8', '#4ADE80', '#F472B6'];
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: colorPalette,
      disableForced3d: true
    });

    setScreen('color-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="noise-overlay" />
      <div className="vignette" />

      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10
        }}
      >
        {screen !== 'login' && screen !== 'register' && (
          <Header currentScreen={screen} setScreen={setScreen} theme={theme} setTheme={setTheme} />
        )}

        <main
          className={`flex-1 ${
            screen !== 'home' && screen !== 'login' && screen !== 'register'
              ? 'pt-20 md:pt-24'
              : ''
          }`}
          style={{ flex: '1 0 auto' }}
        >
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Hero setScreen={setScreen} theme={theme} />
                <About theme={theme} />
                <Features />
                <WardrobeCarousel />
                <HowItWorks />
                <VideoShowcase />
                <AICapabilities />
                <Testimonials />
                <Statistics />
                <CTA setScreen={setScreen} />
              </motion.div>
            )}

            {screen === 'analysis-selection' && (
              <motion.div
                key="analysis-selection"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <AnalysisSelection setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <Dashboard setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'body-analysis' && (
              <motion.div
                key="body-analysis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <BodyAnalysisExperience setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'body-analysis-measurements' && (
              <motion.div
                key="body-analysis-measurements"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <ManualMeasurements setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'body-analysis-photo' && (
              <motion.div
                key="body-analysis-photo"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <PhotoAnalysis setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <BodyAnalysisScan onScanComplete={handleScanComplete} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <BodyResultsPage />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'color-analysis' && (
              <motion.div
                key="color-analysis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <ColorAnalysisExperience onScanComplete={handleColorScanComplete} setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'color-results' && (
              <motion.div
                key="color-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProtectedRoute setScreen={setScreen}>
                  <ColorResultsPage setScreen={setScreen} />
                </ProtectedRoute>
              </motion.div>
            )}

            {screen === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Login setScreen={setScreen} theme={theme} setTheme={setTheme} />
              </motion.div>
            )}

            {screen === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Register setScreen={setScreen} theme={theme} setTheme={setTheme} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {screen !== 'login' && screen !== 'register' && <Footer setScreen={setScreen} />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


