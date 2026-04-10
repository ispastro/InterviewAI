'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    Bot,
    Play,
    Clock,
    TrendingUp,
    Calendar,
    ChevronRight,
    RotateCcw,
    LogOut,
    User
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, PageTransition, InterviewCardSkeleton } from '@/components/ui';
import { RadarChart } from '@/components/charts';
import { useUserStore } from '@/stores';
import { useUserInterviews, useUserStats } from '@/hooks/api/useInterview';
import { formatDate } from '@/lib/utils';
import type { ScoreBreakdown } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);
    const userName = user?.name || 'Guest';
    const userEmail = user?.email || 'No email provided';
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { data: interviewList, isLoading: interviewsLoading } = useUserInterviews(1, 10);
    const { data: stats, isLoading: statsLoading } = useUserStats();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const averageScore = stats?.average_score || 0;
    const mappedScore = Math.max(0, Math.min(5, averageScore / 20));
    const averageScores: ScoreBreakdown = {
        overall: averageScore,
        communication: mappedScore,
        confidence: mappedScore,
        structure: mappedScore,
        technicalDepth: mappedScore,
        relevance: mappedScore,
    };

    const sessions = (interviewList?.interviews || []).map((interview) => ({
        id: interview.id,
        role: interview.target_role || 'Interview Session',
        company: interview.target_company,
        date: new Date(interview.created_at),
        questionsAnswered: interview.current_turn || 0,
        status: interview.status,
    }));

    const inProgressInterview = sessions.find((s) => s.status === 'in_progress');

    return (
        <PageTransition>
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-1">
                        <img src="/logo.png" alt="InterviewMe" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-gray-900">InterviewMe</span>
                    </Link>

                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center">
                                <span className="text-white font-semibold">{userName.charAt(0)}</span>
                            </div>
                            <span className="text-gray-900 font-medium hidden sm:block">{userName}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-lg z-20">
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">{userName.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{userName}</p>
                                                <p className="text-sm text-gray-600 truncate">{userEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                                    >
                                        <LogOut size={18} />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="px-6 py-12 max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Hi {userName}
                    </h1>
                    <p className="text-gray-600">
                        You've completed {stats?.completed_interviews || 0} sessions
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <Link href="/interview/setup">
                        <div className="p-6 border border-gray-300 hover:border-gray-400 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                                        <Play size={22} className="text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Start New Interview</h3>
                                        <p className="text-sm text-gray-600">Practice with a fresh session</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </div>
                        </div>
                    </Link>

                    <Link href={inProgressInterview ? `/interview/live?interview_id=${inProgressInterview.id}` : '/interview/setup'}>
                        <div className="p-6 border border-gray-300 hover:border-gray-400 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                                        <RotateCcw size={22} className="text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Continue Last Session</h3>
                                        <p className="text-sm text-gray-600">
                                            {inProgressInterview ? 'Pick up where you left off' : 'No active session'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Performance Overview */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#0D9488]" />
                                Performance
                            </h2>
                            <RadarChart scores={averageScores} />
                            <div className="mt-6 text-center">
                                <p className="text-3xl font-bold text-gray-900">
                                    {averageScore ? `${Math.round(averageScore)}%` : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {statsLoading ? 'Loading...' : 'Average Score'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Previous Sessions */}
                    <div className="lg:col-span-2">
                        <div className="border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Clock size={20} className="text-[#0D9488]" />
                                    Previous Sessions
                                </h2>
                                <Link href="/sessions">
                                    <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                        View All
                                        <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {interviewsLoading && (
                                    <>
                                        <InterviewCardSkeleton />
                                        <InterviewCardSkeleton />
                                        <InterviewCardSkeleton />
                                    </>
                                )}
                                {!interviewsLoading && sessions.length === 0 && (
                                    <div className="p-4 border border-gray-200 text-gray-600">
                                        No interviews yet. Start your first session.
                                    </div>
                                )}
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#0D9488] flex items-center justify-center">
                                                    <span className="text-white font-bold">{session.questionsAnswered}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{session.role}</h4>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(session.date)}
                                                        </span>
                                                        <span>{session.questionsAnswered} turns</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'error'}>
                                                    {session.status === 'completed' ? 'Completed' : session.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                                </Badge>
                                                <Link href={session.status === 'completed' ? `/interview/summary?interview_id=${session.id}` : `/interview/live?interview_id=${session.id}`}>
                                                    <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                                        {session.status === 'completed' ? 'View' : 'Open'}
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </PageTransition>
    );
}
