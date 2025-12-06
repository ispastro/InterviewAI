'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight,
    Bot,
    Play,
    Clock,
    TrendingUp,
    Calendar,
    ChevronRight,
    RotateCcw
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { RadarChart } from '@/components/charts';
import { useUserStore } from '@/stores';
import { formatDate, calculateAverageScore } from '@/lib/utils';
import type { SessionSummary, ScoreBreakdown } from '@/types';

// Mock data
const mockSessions: SessionSummary[] = [
    {
        id: '1',
        role: 'Software Engineer',
        date: new Date('2024-12-05'),
        overallScore: 85,
        scores: { communication: 4, confidence: 4, structure: 5, technicalDepth: 4, relevance: 4 },
        questionsAnswered: 8,
    },
    {
        id: '2',
        role: 'Frontend Developer',
        date: new Date('2024-12-03'),
        overallScore: 78,
        scores: { communication: 4, confidence: 3, structure: 4, technicalDepth: 4, relevance: 4 },
        questionsAnswered: 6,
    },
    {
        id: '3',
        role: 'Full Stack Engineer',
        date: new Date('2024-12-01'),
        overallScore: 72,
        scores: { communication: 3, confidence: 3, structure: 4, technicalDepth: 4, relevance: 4 },
        questionsAnswered: 7,
    },
];

const averageScores: ScoreBreakdown = {
    communication: 3.7,
    confidence: 3.3,
    structure: 4.3,
    technicalDepth: 4,
    relevance: 4,
};

export default function DashboardPage() {
    const user = useUserStore((state) => state.user);
    const userName = user?.name || 'Guest';

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-4 bg-white border-b border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-[12px] bg-[#0F172A] flex items-center justify-center">
                            <Bot size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-semibold text-[#0F172A] font-[Lora]">InterviewAI</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center">
                                <span className="text-white font-semibold font-[Lexend]">{userName.charAt(0)}</span>
                            </div>
                            <span className="text-[#0F172A] font-medium hidden sm:block font-[Lexend]">{userName}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-6 py-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="overflow-hidden bg-[#0F172A] border-none">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 font-[Lora]">
                                    Hi {userName}, ready for today&apos;s practice?
                                </h1>
                                <p className="text-[#94A3B8] font-[Lexend]">
                                    You&apos;ve completed {mockSessions.length} sessions. Keep up the great work!
                                </p>
                            </div>
                            <Link href="/interview/setup">
                                <Button size="lg">
                                    <Play size={18} className="mr-2" />
                                    Start New Interview
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-6 mb-8"
                >
                    <Card hover className="cursor-pointer group">
                        <Link href="/interview/setup" className="block p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                                        <Play size={22} className="text-[#2563EB] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#0F172A] font-[Lora]">Start New Interview</h3>
                                        <p className="text-sm text-[#475569] font-[Lexend]">Practice with a fresh session</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                            </div>
                        </Link>
                    </Card>

                    <Card hover className="cursor-pointer group">
                        <Link href="/interview/live?session_id=last" className="block p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center group-hover:bg-[#10B981] transition-colors">
                                        <RotateCcw size={22} className="text-[#10B981] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#0F172A] font-[Lora]">Continue Last Session</h3>
                                        <p className="text-sm text-[#475569] font-[Lexend]">Pick up where you left off</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                            </div>
                        </Link>
                    </Card>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Performance Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp size={20} className="text-[#2563EB]" />
                                    Performance Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadarChart scores={averageScores} />
                                <div className="mt-4 text-center">
                                    <p className="text-3xl font-bold text-[#0F172A] font-[Lora]">
                                        {calculateAverageScore(averageScores)}%
                                    </p>
                                    <p className="text-sm text-[#94A3B8] font-[Lexend]">Average Score</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Previous Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock size={20} className="text-[#2563EB]" />
                                    Previous Sessions
                                </CardTitle>
                                <Link href="/sessions">
                                    <Button variant="ghost" size="sm">
                                        View All
                                        <ArrowRight size={16} className="ml-1" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockSessions.map((session, index) => (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F1F5F9] transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[12px] bg-[#2563EB] flex items-center justify-center">
                                                        <span className="text-white font-bold font-[Lexend]">{session.overallScore}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#0F172A] font-[Lora]">{session.role}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-[#94A3B8] font-[Lexend]">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(session.date)}
                                                            </span>
                                                            <span>{session.questionsAnswered} questions</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={session.overallScore >= 80 ? 'success' : session.overallScore >= 60 ? 'warning' : 'error'}>
                                                        {session.overallScore >= 80 ? 'Excellent' : session.overallScore >= 60 ? 'Good' : 'Needs Work'}
                                                    </Badge>
                                                    <Link href={`/interview/summary?session_id=${session.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View Report
                                                            <ChevronRight size={16} />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
