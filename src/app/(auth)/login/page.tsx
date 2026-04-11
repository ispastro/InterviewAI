'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, AtSign, Lock, Chrome, Linkedin, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores';

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('oracle@intelligence.com');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock login
        await new Promise(r => setTimeout(r, 1500));
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] overflow-hidden font-[Lexend]">
            {/* Left Panel - The Digital Oracle */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: 'url("/images/login_bg.png")' }}
                />
                <div className="absolute inset-0 bg-[#020617]/40 backdrop-brightness-75" />

                {/* Glassmorphic Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 mx-auto my-auto p-16 max-w-lg w-full rounded-[48px] border border-white/5 bg-[#0F172A]/40 backdrop-blur-3xl shadow-2xl flex flex-col items-center text-center overflow-hidden"
                >
                    {/* Background glow for card */}
                    <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-[#A855F7]/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative mb-14">
                        {/* Outer Glow */}
                        <div className="absolute inset-x-0 -bottom-4 h-8 bg-[#22D3EE]/20 blur-2xl rounded-full" />
                        <div className="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#A855F7]/30 to-[#22D3EE]/30 flex items-center justify-center p-6 border border-white/10 shadow-2xl">
                            <Sparkles className="text-white w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                        </div>
                    </div>

                    <h2 className="text-white text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-[1.15] z-10 font-[Lora]">
                        The Digital <br />
                        <span className="text-[#93C5FD]">Oracle.</span>
                    </h2>

                    <p className="text-white/60 text-xl font-light leading-relaxed mb-14 max-w-[380px] z-10 font-[Lexend]">
                        &quot;The future of your career, predicted and perfected.&quot;
                    </p>

                    <div className="w-40 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                </motion.div>

                {/* Corner Accents */}
                <div className="absolute bottom-10 left-10 text-white/20 text-xs tracking-widest uppercase">
                    Core Intelligence // v2.0
                </div>
            </div>

            {/* Right Panel - Secure Access */}
            <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 relative overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            Interview<span className="text-[#A855F7]">Me</span>
                        </span>
                    </Link>
                    <div className="text-[10px] tracking-[0.2em] font-bold text-[#22D3EE] uppercase opacity-80">
                        Secure Access
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
                    {/* Tabs */}
                    <div className="flex gap-8 mb-12 relative">
                        <button 
                            onClick={() => setActiveTab('signin')}
                            className={`text-lg font-semibold transition-all duration-300 ${activeTab === 'signin' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => setActiveTab('signup')}
                            className={`text-lg font-semibold transition-all duration-300 ${activeTab === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Create Account
                        </button>
                        
                        {/* Tab Indicator */}
                        <motion.div 
                            animate={{ x: activeTab === 'signin' ? 0 : 92 }}
                            className="absolute -bottom-2 left-0 h-1 w-12 bg-gradient-to-r from-[#A855F7] to-[#22D3EE] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] tracking-[0.2em] font-bold text-[#22D3EE] uppercase mb-4 opacity-80">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="oracle@intelligence.com"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl h-14 px-5 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#22D3EE]/30 focus:bg-black/60 transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#22D3EE]/50 transition-colors">
                                    <AtSign size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] tracking-[0.2em] font-bold text-[#22D3EE] uppercase opacity-80">
                                    Password
                                </label>
                                <button type="button" className="text-[10px] tracking-widest font-bold text-white/30 hover:text-white/50 uppercase transition-colors">
                                    Forgot Key?
                                </button>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl h-14 px-5 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#22D3EE]/30 focus:bg-black/60 transition-all font-mono tracking-widest text-lg"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#22D3EE]/50 transition-colors">
                                    <Lock size={18} />
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#A855F7]/80 via-[#22D3EE]/80 to-[#22D3EE]/80 hover:from-[#A855F7] hover:to-[#22D3EE] text-white font-bold text-base tracking-wide shadow-xl shadow-purple-500/10 border-none transition-all duration-300 group overflow-hidden relative"
                            disabled={isLoading}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {isLoading ? 'Synchronizing...' : 'Initialize Session'}
                                {!isLoading && <MoveRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </form>

                    {/* Social Sync */}
                    <div className="mt-12 text-center">
                        <div className="text-[10px] tracking-[0.3em] font-bold text-white/20 uppercase mb-8">
                            Or Synchronize With
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 h-14 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-center gap-3 text-sm font-medium text-white/70 group">
                                <Chrome size={18} className="text-white/40 group-hover:text-white transition-colors" />
                                Google
                            </button>
                            <button className="flex-1 h-14 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-center gap-3 text-sm font-medium text-white/70 group">
                                <Linkedin size={18} className="text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                                LinkedIn
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[11px] text-white/20 tracking-wider font-light">
                        By entering, you agree to our <span className="text-[#22D3EE]/60 hover:text-[#22D3EE] cursor-pointer transition-colors">Neural Protocols</span> and <span className="text-[#22D3EE]/60 hover:text-[#22D3EE] cursor-pointer transition-colors">Privacy Vault</span>.
                    </p>
                </div>

                {/* Decorative Bottom Graphic */}
                <div className="absolute bottom-6 right-6 opacity-5 pointer-events-none select-none grayscale contrast-200">
                     <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0ZM20 36C11.1634 36 4 28.8366 4 20C4 11.1634 11.1634 4 20 4C28.8366 4 36 11.1634 36 20C36 28.8366 28.8366 36 20 36Z" fill="white"/>
                        <path d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM20 26C16.6863 26 14 23.3137 14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.6863 26 20 26Z" fill="white"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
