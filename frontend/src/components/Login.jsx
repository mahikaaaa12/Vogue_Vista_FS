import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ArrowLeft, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import Silk from './Silk';
import CoutureSparkles from './CoutureSparkles';
import { useAuth } from '../context/AuthContext';
import FormInput from './shared/FormInput';

export default function Login({ setScreen, theme, setTheme }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result.success) {
      setScreen('analysis-selection');
    }
  };

  return (
    <section className="min-h-screen py-32 relative overflow-hidden flex items-center justify-center transition-colors duration-500 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
        <Silk
          speed={1.5}
          scale={0.8}
          color={theme === 'dark' ? '#211C24' : '#A8957C'}
          noiseIntensity={0.8}
          rotation={0.05}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none opacity-100">
        <CoutureSparkles theme={theme} />
      </div>

      <div className="container-custom max-w-md relative z-20 px-4">
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-gold)] font-medium"
          >
            <ArrowLeft size={16} /> Back to Atelier
          </motion.button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--color-gold)] transition-colors duration-300"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-semibold mb-2 block">
              Atelier Portal
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-[var(--text-primary)]">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="haute@voguevista.com"
            />

            <FormInput
              label="Passcode"
              icon={Lock}
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="⁕⁕⁕⁕⁕⁕⁕⁕⁕⁕⁕"
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C6A16A] to-[#E5C38F] text-[#0A0A0B] font-semibold text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In To Atelier'} <ArrowRight size={16} color="#0A0A0B" />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Not a member yet?{' '}
              <button
                onClick={() => setScreen('register')}
                className="text-[var(--color-gold)] hover:underline font-medium ml-1"
              >
                Apply for Membership
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

