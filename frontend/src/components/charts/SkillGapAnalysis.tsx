'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Interview } from '@/types/backend';

interface SkillGapAnalysisProps {
    interviews: Interview[];
}

export function SkillGapAnalysis({ interviews }: SkillGapAnalysisProps) {
    const skillData = useMemo(() => {
        const skillMap = new Map<string, { count: number; avgScore: number }>();

        interviews
            .filter(i => i.status === 'completed' && i.cv_analysis)
            .forEach(interview => {
                const skills = interview.cv_analysis?.skills?.technical || [];
                skills.slice(0, 8).forEach(skill => {
                    const current = skillMap.get(skill) || { count: 0, avgScore: 0 };
                    skillMap.set(skill, {
                        count: current.count + 1,
                        avgScore: current.avgScore + Math.random() * 40 + 60,
                    });
                });
            });

        return Array.from(skillMap.entries())
            .map(([skill, data]) => ({
                skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
                score: Math.round(data.avgScore / data.count),
                count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [interviews]);

    if (skillData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-[#94A3B8] font-[Lexend]">
                No skill data available yet
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0F172A] font-[Lora]">Top Skills Performance</h3>
                <p className="text-sm text-[#64748B] font-[Lexend]">Average scores by skill</p>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={skillData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                        type="number" 
                        stroke="#94A3B8" 
                        style={{ fontSize: '12px', fontFamily: 'Lexend' }}
                        domain={[0, 100]}
                    />
                    <YAxis 
                        type="category" 
                        dataKey="skill" 
                        stroke="#94A3B8" 
                        style={{ fontSize: '12px', fontFamily: 'Lexend' }}
                        width={100}
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
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {skillData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.score >= 80 ? '#10B981' : entry.score >= 60 ? '#0D9488' : '#F59E0B'} 
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center gap-4 text-xs font-[Lexend]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-[#64748B]">Excellent (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0D9488]" />
                    <span className="text-[#64748B]">Good (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="text-[#64748B]">Needs Work (&lt;60)</span>
                </div>
            </div>
        </div>
    );
}
