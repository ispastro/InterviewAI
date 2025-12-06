'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bot, ArrowLeft, Download, Share2, Home, Trophy, ArrowRight } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { RadarChart } from '@/components/charts';
import { ScoreCard } from '@/components/feedback';
import { formatDate } from '@/lib/utils';
import type { ScoreBreakdown, ChatMessage } from '@/types';

const mockSessionData = {
    id: '1',
    role: 'Software Engineer',
    date: new Date(),
    overallScore: 82,
    scores: {
        communication: 4,
        confidence: 4,
        structure: 4,
        technicalDepth: 4,
        relevance: 5,
    } as ScoreBreakdown,
    transcript: [
        { id: '1', sender: 'interviewer' as const, message: "Tell me about yourself and your experience as a developer.", timestamp: new Date('2024-12-06T14:00:00') },
        { id: '2', sender: 'user' as const, message: "I'm a software engineer with 5 years of experience primarily in full-stack development. I've worked extensively with React, Node.js, and cloud technologies like AWS. In my current role, I lead a team of 4 developers building enterprise SaaS products.", timestamp: new Date('2024-12-06T14:02:00') },
        { id: '3', sender: 'interviewer' as const, message: "Can you describe a challenging project you've worked on recently?", timestamp: new Date('2024-12-06T14:03:00') },
        { id: '4', sender: 'user' as const, message: "Recently, I led the migration of our monolithic application to a microservices architecture. The challenge was maintaining zero downtime while gradually transitioning services. We used a strangler fig pattern and implemented comprehensive monitoring. The project took 6 months and reduced our deployment time by 80%.", timestamp: new Date('2024-12-06T14:06:00') },
    ] as ChatMessage[],
    weaknesses: ['Confidence during technical questions', 'Could provide more specific metrics'],
};

function SessionSummaryContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const session = mockSessionData;

    const scoreColors = ['blue', 'green', 'purple', 'amber', 'rose'] as const;
    const scoreLabels = [
        { key: 'communication' as keyof ScoreBreakdown, label: 'Communication' },
        { key: 'confidence' as keyof ScoreBreakdown, label: 'Confidence' },
        { key: 'structure' as keyof ScoreBreakdown, label: 'Structure' },
        { key: 'technicalDepth' as keyof ScoreBreakdown, label: 'Technical Depth' },
        { key: 'relevance' as keyof ScoreBreakdown, label: 'Relevance' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <header className="sticky top-0 z-40 px-6 py-4 bg-white border-b border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] transition-colors font-[Lexend]">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-[12px] bg-[#0F172A] flex items-center justify-center">
                            <Bot size={22} className="text-white" />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="px-6 py-12 max-w-6xl mx-auto">
                {/* Success Banner */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10B981] mb-6">
                        <Trophy size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0F172A] mb-2 font-[Lora]">Interview Complete!</h1>
                    <p className="text-[#475569] font-[Lexend]">{session.role} • {formatDate(session.date)}</p>
                </motion.div>

                {/* Overall Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                    <Card className="text-center py-12">
                        <div className="relative inline-block">
                            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 45}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - session.overallScore / 100) }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div>
                                    <motion.span className="text-4xl font-bold text-[#0F172A] font-[Lora]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                                        {session.overallScore}
                                    </motion.span>
                                    <span className="text-xl text-[#94A3B8]">/100</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-lg text-[#475569] mt-4 font-[Lexend]">Overall Score</p>
                        <Badge variant={session.overallScore >= 80 ? 'success' : session.overallScore >= 60 ? 'warning' : 'error'} className="mt-2">
                            {session.overallScore >= 80 ? 'Excellent Performance' : session.overallScore >= 60 ? 'Good Progress' : 'Keep Practicing'}
                        </Badge>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="h-full">
                            <CardHeader><CardTitle>Skills Breakdown</CardTitle></CardHeader>
                            <CardContent><RadarChart scores={session.scores} /></CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="h-full">
                            <CardHeader><CardTitle>Detailed Scores</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {scoreLabels.map((item, index) => (
                                    <ScoreCard key={item.key} label={item.label} score={session.scores[item.key]} color={scoreColors[index]} />
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Weakness Areas */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
                    <Card>
                        <CardHeader><CardTitle>Areas for Improvement</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                {session.weaknesses.map((weakness, index) => (
                                    <div key={index} className="p-4 rounded-[16px] bg-[#FFFBEB] border border-[#FDE68A]">
                                        <p className="text-[#D97706] font-[Lexend]">{weakness}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transcript */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
                    <Card>
                        <CardHeader><CardTitle>Full Transcript</CardTitle></CardHeader>
                        <CardContent>
                            <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
                                {session.transcript.map((message) => (
                                    <div key={message.id} className={`p-4 rounded-[16px] ${message.sender === 'interviewer' ? 'bg-[#F1F5F9] ml-0 mr-12' : 'bg-[#E2E8F0] ml-12 mr-0'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-sm font-medium font-[Lexend] ${message.sender === 'interviewer' ? 'text-[#0F172A]' : 'text-[#2563EB]'}`}>
                                                {message.sender === 'interviewer' ? 'AI Interviewer' : 'You'}
                                            </span>
                                            <span className="text-xs text-[#94A3B8] font-[Lexend]">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[#475569] text-sm font-[Lexend]">{message.message}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="secondary"><Download size={18} className="mr-2" />Download PDF Report</Button>
                    <Button variant="secondary"><Share2 size={18} className="mr-2" />Share Results</Button>
                    <Link href="/interview/setup"><Button>Practice Again<ArrowRight size={18} className="ml-2" /></Button></Link>
                    <Link href="/dashboard"><Button variant="outline"><Home size={18} className="mr-2" />Go to Dashboard</Button></Link>
                </motion.div>
            </main>
        </div>
    );
}

export default function SessionSummaryPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin" /></div>}>
            <SessionSummaryContent />
        </Suspense>
    );
}
