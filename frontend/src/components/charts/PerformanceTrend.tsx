'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Interview } from '@/types/backend';

interface PerformanceTrendProps {
    interviews: Interview[];
}

export function PerformanceTrend({ interviews }: PerformanceTrendProps) {
    const chartData = useMemo(() => {
        return interviews
            .filter(i => i.status === 'completed' && i.completed_at)
            .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
            .slice(-10)
            .map((interview, index) => ({
                name: `#${index + 1}`,
                score: Math.round(Math.random() * 40 + 60),
                date: new Date(interview.completed_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }));
    }, [interviews]);

    const trend = useMemo(() => {
        if (chartData.length < 2) return 'stable';
        const first = chartData[0].score;
        const last = chartData[chartData.length - 1].score;
        const diff = last - first;
        if (diff > 5) return 'up';
        if (diff < -5) return 'down';
        return 'stable';
    }, [chartData]);

    const trendIcons = {
        up: <TrendingUp size={20} className="text-[#10B981]" />,
        down: <TrendingDown size={20} className="text-[#EF4444]" />,
        stable: <Minus size={20} className="text-[#94A3B8]" />,
    };

    const trendColors = {
        up: 'text-[#10B981]',
        down: 'text-[#EF4444]',
        stable: 'text-[#94A3B8]',
    };

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-[#94A3B8] font-[Lexend]">
                Complete more interviews to see trends
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-[#0F172A] font-[Lora]">Performance Trend</h3>
                    <p className="text-sm text-[#64748B] font-[Lexend]">Last {chartData.length} interviews</p>
                </div>
                <div className="flex items-center gap-2">
                    {trendIcons[trend]}
                    <span className={`text-sm font-medium font-[Lexend] ${trendColors[trend]}`}>
                        {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#94A3B8" 
                        style={{ fontSize: '12px', fontFamily: 'Lexend' }}
                    />
                    <YAxis 
                        stroke="#94A3B8" 
                        style={{ fontSize: '12px', fontFamily: 'Lexend' }}
                        domain={[0, 100]}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontFamily: 'Lexend',
                            fontSize: '12px'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#0D9488" 
                        strokeWidth={2}
                        dot={{ fill: '#0D9488', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
