'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Target, 
    Clock, 
    Award, 
    TrendingUp,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import { Button, PageTransition, InterviewCardSkeleton } from '@/components/ui';
import { PerformanceTrend, SkillGapAnalysis, StatCard, RadarChart } from '@/components/charts';
import { useUserInterviews, useUserStats } from '@/hooks/api/useInterview';
import type { ScoreBreakdown } from '@/types';

export default function AnalyticsPage() {
    const router = useRouter();
    const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
    
    const { data: interviewList, isLoading: interviewsLoading } = useUserInterviews(1, 50);
    const { data: stats, isLoading: statsLoading } = useUserStats();

    const interviews = interviewList?.interviews || [];
    const completedInterviews = interviews.filter(i => i.status === 'completed');

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

    const totalTime = stats?.total_time_minutes || 0;
    const avgTimePerInterview = completedInterviews.length > 0 
        ? Math.round(totalTime / completedInterviews.length) 
        : 0;

    const completionRate = stats?.completion_rate || 0;

    return (
        <PageTransition>
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm">Back</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300" />
                        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 text-sm font-[Lexend] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                        >
                            <option value="week">Last 7 days</option>
                            <option value="month">Last 30 days</option>
                            <option value="all">All time</option>
                        </select>
                        <Button variant="outline" size="sm">
                            <Download size={16} className="mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsLoading ? (
                        <>
                            <InterviewCardSkeleton />
                            <InterviewCardSkeleton />
                            <InterviewCardSkeleton />
                            <InterviewCardSkeleton />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Interviews"
                                value={stats?.total_interviews || 0}
                                subtitle="All time"
                                icon={Target}
                                color="teal"
                            />
                            <StatCard
                                title="Average Score"
                                value={averageScore ? `${Math.round(averageScore)}%` : 'N/A'}
                                subtitle="Across all interviews"
                                icon={Award}
                                color="blue"
                                trend={averageScore > 70 ? { value: 12, isPositive: true } : undefined}
                            />
                            <StatCard
                                title="Completion Rate"
                                value={`${Math.round(completionRate)}%`}
                                subtitle={`${stats?.completed_interviews || 0} completed`}
                                icon={TrendingUp}
                                color="purple"
                            />
                            <StatCard
                                title="Avg. Duration"
                                value={`${avgTimePerInterview}m`}
                                subtitle="Per interview"
                                icon={Clock}
                                color="orange"
                            />
                        </>
                    )}
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Performance Trend */}
                    <div className="lg:col-span-2 border border-gray-200 p-6">
                        {interviewsLoading ? (
                            <InterviewCardSkeleton />
                        ) : (
                            <PerformanceTrend interviews={completedInterviews} />
                        )}
                    </div>

                    {/* Overall Performance Radar */}
                    <div className="border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-[#0F172A] mb-6 font-[Lora]">Overall Performance</h3>
                        {statsLoading ? (
                            <InterviewCardSkeleton />
                        ) : (
                            <RadarChart scores={averageScores} />
                        )}
                    </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="border border-gray-200 p-6 mb-8">
                    {interviewsLoading ? (
                        <InterviewCardSkeleton />
                    ) : (
                        <SkillGapAnalysis interviews={completedInterviews} />
                    )}
                </div>

                {/* Role Distribution */}
                <div className="border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-4 font-[Lora]">Interview Distribution</h3>
                    <div className="space-y-3">
                        {statsLoading ? (
                            <InterviewCardSkeleton />
                        ) : Object.entries(stats?.role_distribution || {}).length > 0 ? (
                            Object.entries(stats.role_distribution).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between">
                                    <span className="text-sm text-[#0F172A] font-[Lexend]">{role}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#0D9488]"
                                                style={{ width: `${(count / (stats?.total_interviews || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-[#64748B] font-[Lexend] w-8 text-right">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-[#94A3B8] font-[Lexend]">No role data available yet</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
        </PageTransition>
    );
}
