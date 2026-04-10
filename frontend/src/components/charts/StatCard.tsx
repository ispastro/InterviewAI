'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'teal' | 'blue' | 'purple' | 'orange';
}

const colorClasses = {
    teal: 'bg-[#0D9488] text-white',
    blue: 'bg-[#3B82F6] text-white',
    purple: 'bg-[#8B5CF6] text-white',
    orange: 'bg-[#F59E0B] text-white',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'teal' }: StatCardProps) {
    return (
        <div className="p-6 bg-white border border-[#E5E7EB] hover:border-[#0D9488] transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={cn('w-12 h-12 flex items-center justify-center', colorClasses[color])}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        'text-sm font-medium font-[Lexend]',
                        trend.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-[#0F172A] font-[Lora] mb-1">{value}</p>
                <p className="text-sm font-medium text-[#0F172A] font-[Lexend] mb-1">{title}</p>
                {subtitle && (
                    <p className="text-xs text-[#64748B] font-[Lexend]">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
