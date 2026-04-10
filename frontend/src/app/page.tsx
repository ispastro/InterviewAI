'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, Sparkles, Zap, Target, BarChart3, CheckCircle, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/ispastro/InterviewAI')
      .then(res => res.json())
      .then(data => setStarCount(data.stargazers_count))
      .catch(() => setStarCount(null));
  }, []);

  const formatStarCount = (count: number | null) => {
    if (!count) return '...';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <img src="/logo.png" alt="InterviewMe" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">InterviewMe</span>
          </Link>
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 text-sm">How it Works</a>
              <a 
                href="https://github.com/ispastro/InterviewAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Star</span>
                <span className="ml-1">{formatStarCount(starCount)}</span>
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="text-sm text-gray-700 hover:text-gray-900">Log In</button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="rounded-none group overflow-hidden relative">
                  <span className="invisible">Get Started</span>
                  <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                    Get Started
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    Get Started
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDFA] via-white to-[#F0F9FF] opacity-70"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#99F6E4] shadow-sm">
              <Sparkles size={16} className="text-[#0D9488]" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Interview Practice</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Ace Your Next Interview with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#06B6D4]">
                AI Coaching
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Practice with our advanced AI interviewer, get instant feedback, and land your dream job. 
              Personalized questions based on your resume and target role.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/interview/setup">
                <Button size="lg" className="text-base px-8 rounded-none group overflow-hidden relative">
                  <span className="invisible flex items-center gap-2">
                    Start Free Interview
                    <ArrowRight size={20} />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 group-hover:-translate-y-full">
                    Start Free Interview
                    <ArrowRight size={20} />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center gap-2 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    Start Free Interview
                    <ArrowRight size={20} />
                  </span>
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="text-base px-8 rounded-none group overflow-hidden relative">
                  <span className="invisible">See How It Works</span>
                  <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                    See How It Works
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    See How It Works
                  </span>
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0D9488]" />
                <span><strong className="text-gray-900">10,000+</strong> users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#0D9488]" />
                <span><strong className="text-gray-900">4.9/5</strong> rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#0D9488]" />
                <span><strong className="text-gray-900">95%</strong> success rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center mb-6">
                <Zap size={24} className="text-[#0D9488]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Questions</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized interview questions generated by advanced AI based on your resume and target job description.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center mb-6">
                <Target size={24} className="text-[#0D9488]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive real-time evaluation on your answers with detailed insights on communication, confidence, and technical depth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-[#0D9488]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your progress over time with detailed analytics and identify areas for improvement with actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Your Resume</h3>
              <p className="text-gray-600">
                Upload your CV and the job description you're targeting. Our AI analyzes both to create personalized questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice Interview</h3>
              <p className="text-gray-600">
                Engage in a realistic interview session with our AI. Answer questions via text or voice in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Feedback</h3>
              <p className="text-gray-600">
                Receive detailed feedback on your performance with scores, strengths, and areas to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful candidates who used InterviewMe to land their dream jobs
          </p>
          <Link href="/interview/setup">
            <Button size="lg" className="text-base px-12 rounded-none group overflow-hidden relative">
              <span className="invisible flex items-center gap-2">
                Start Free Interview
                <ArrowRight size={20} />
              </span>
              <span className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 group-hover:-translate-y-full">
                Start Free Interview
                <ArrowRight size={20} />
              </span>
              <span className="absolute inset-0 flex items-center justify-center gap-2 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                Start Free Interview
                <ArrowRight size={20} />
              </span>
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Free forever • Get started in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="InterviewMe" className="h-6 w-auto object-contain" />
              <span className="text-lg font-bold text-gray-900">InterviewMe</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-gray-600">© {new Date().getFullYear()} InterviewMe. All rights reserved.</p>
              <p className="text-sm text-gray-500">
                Designed and built by{' '}
                <a 
                  href="https://github.com/ispastro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0D9488] hover:text-[#0F766E] font-medium"
                >
                  Haile (ispastro)
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
