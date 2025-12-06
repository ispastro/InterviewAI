'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bot, BarChart3, MessageSquare, Mic, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { InterviewerAvatar } from '@/components/InterviewerAvatar';

const features = [
  {
    icon: MessageSquare,
    title: 'Real-time Conversations',
    description: 'Practice with AI that responds naturally and adapts to your answers.',
  },
  {
    icon: BarChart3,
    title: 'Instant Feedback',
    description: 'Get detailed analysis on communication, structure, and technical depth.',
  },
  {
    icon: Mic,
    title: 'Voice & Text Modes',
    description: 'Choose your preferred interview style — type or speak your answers.',
  },
  {
    icon: Target,
    title: 'Role-Specific Questions',
    description: 'Tailored questions for Software Engineers, Product Managers, and more.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-[12px] bg-[#0F172A] flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-[#0F172A] font-[Lora]">InterviewAI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] mb-6">
                <Sparkles size={16} className="text-[#2563EB]" />
                <span className="text-sm text-[#2563EB] font-[Lexend]">AI-Powered Interview Practice</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight mb-6 font-[Lora]">
                Master Your Interviews With AI Coaching
              </h1>

              <p className="text-lg text-[#475569] mb-8 max-w-lg font-[Lexend]">
                Practice real interview scenarios, receive instant feedback, and build confidence — all powered by advanced AI technology.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/interview/setup">
                  <Button size="lg">
                    Start Mock Interview
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="lg">
                    View Dashboard
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-[#E5E7EB]">
                <div>
                  <p className="text-3xl font-bold text-[#0F172A] font-[Lora]">10K+</p>
                  <p className="text-sm text-[#94A3B8] font-[Lexend]">Mock Interviews</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#0F172A] font-[Lora]">95%</p>
                  <p className="text-sm text-[#94A3B8] font-[Lexend]">Success Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#0F172A] font-[Lora]">4.9★</p>
                  <p className="text-sm text-[#94A3B8] font-[Lexend]">User Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Main card */}
                <div className="absolute inset-8 bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0px_8px_24px_rgba(0,0,0,0.08)] p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <InterviewerAvatar size="lg" isThinking />
                    <div>
                      <p className="text-[#0F172A] font-semibold font-[Lora]">AI Interviewer</p>
                      <p className="text-sm text-[#10B981] font-[Lexend]">Ready to practice</p>
                    </div>
                  </div>

                  {/* Sample question */}
                  <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#E5E7EB]">
                    <p className="text-[#475569] text-sm font-[Lexend]">
                      &quot;Tell me about a challenging project you&apos;ve worked on and how you overcame obstacles...&quot;
                    </p>
                  </div>

                  {/* Score preview */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {['Communication', 'Confidence'].map((skill) => (
                      <div key={skill} className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#2563EB] flex items-center justify-center mb-2">
                          <span className="text-white font-semibold font-[Lexend]">4.5</span>
                        </div>
                        <p className="text-xs text-[#94A3B8] font-[Lexend]">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4 font-[Lora]">
              Everything You Need to Succeed
            </h2>
            <p className="text-[#475569] max-w-2xl mx-auto font-[Lexend]">
              Our AI-powered platform provides comprehensive interview preparation with real-time feedback and personalized coaching.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0px_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                  <feature.icon size={24} className="text-[#2563EB] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2 font-[Lora]">{feature.title}</h3>
                <p className="text-[#475569] text-sm font-[Lexend]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[20px] overflow-hidden bg-[#0F172A] p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-[Lora]">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto mb-8 font-[Lexend]">
              Join thousands of professionals who have improved their interview skills and landed their dream jobs.
            </p>
            <Link href="/interview/setup">
              <Button size="lg">
                Start Free Practice
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <span className="text-sm text-[#94A3B8] font-[Lexend]">© 2024 InterviewAI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#94A3B8] font-[Lexend]">
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
