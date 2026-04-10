'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('animate-pulse bg-[#E5E7EB] rounded-[8px]', className)} />
    );
}

export function CardSkeleton() {
    return (
        <div className="p-6 bg-white rounded-[12px] border border-[#E5E7EB]">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <div className="flex-1 max-w-[70%]">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    );
}

export function InterviewCardSkeleton() {
    return (
        <div className="p-6 bg-white rounded-[12px] border border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div className="flex gap-4 mt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}
