'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Bot,
    ArrowRight,
    ArrowLeft,
    Briefcase,
    MessageSquare,
    Mic,
    Gauge,
    Timer,
    Sparkles
} from 'lucide-react';
import { Button, Card, CardContent, Select } from '@/components/ui';
import { useSettingsStore } from '@/stores';
import { cn, generateId } from '@/lib/utils';

const jobRoles = [
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'fullstack-developer', label: 'Full Stack Developer' },
    { value: 'ai-engineer', label: 'AI/ML Engineer' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'ux-designer', label: 'UX Designer' },
    { value: 'hr-manager', label: 'HR Manager' },
];

const difficultyLevels = [
    { id: 'easy', label: 'Easy', description: 'Basic questions, relaxed pace' },
    { id: 'medium', label: 'Medium', description: 'Standard interview difficulty' },
    { id: 'hard', label: 'Hard', description: 'Challenging, in-depth questions' },
];

const interviewStyles = [
    { id: 'friendly', label: 'Friendly', description: 'Supportive and encouraging' },
    { id: 'neutral', label: 'Neutral', description: 'Professional and balanced' },
    { id: 'strict', label: 'Strict', description: 'Challenging and demanding' },
];

const durations = [
    { value: 5, label: '5 mins', description: 'Quick practice' },
    { value: 10, label: '10 mins', description: 'Standard session' },
    { value: 20, label: '20 mins', description: 'Full interview' },
];

export default function InterviewSetupPage() {
    const router = useRouter();
    const settings = useSettingsStore();
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = async () => {
        setIsStarting(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const sessionId = generateId();
        router.push(`/interview/live?session_id=${sessionId}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-4 bg-white border-b border-[#E5E7EB]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
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

            <main className="px-6 py-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] mb-6">
                        <Sparkles size={16} className="text-[#2563EB]" />
                        <span className="text-sm text-[#2563EB] font-[Lexend]">Customize Your Interview</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#0F172A] mb-4 font-[Lora]">
                        Set Up Your Interview
                    </h1>
                    <p className="text-[#475569] max-w-lg mx-auto font-[Lexend]">
                        Configure your mock interview session to match your preparation goals.
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Job Role */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center">
                                        <Briefcase size={20} className="text-[#2563EB]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#0F172A] font-[Lora]">Job Role</h2>
                                        <p className="text-sm text-[#475569] font-[Lexend]">What position are you interviewing for?</p>
                                    </div>
                                </div>
                                <Select
                                    options={jobRoles}
                                    value={settings.selectedRole}
                                    onChange={(value) => settings.setSelectedRole(value)}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Interview Type */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center">
                                        <MessageSquare size={20} className="text-[#10B981]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#0F172A] font-[Lora]">Interview Type</h2>
                                        <p className="text-sm text-[#475569] font-[Lexend]">How would you like to communicate?</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'text', label: 'Text Interview', icon: MessageSquare, description: 'Type your answers' },
                                        { id: 'voice', label: 'Voice Interview', icon: Mic, description: 'Speak your answers' },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => settings.setMode(type.id as 'text' | 'voice')}
                                            className={cn(
                                                'p-4 rounded-[16px] border transition-all duration-200 text-left',
                                                settings.mode === type.id
                                                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                                                    : 'bg-white border-[#E5E7EB] hover:border-[#94A3B8]'
                                            )}
                                        >
                                            <type.icon size={22} className={settings.mode === type.id ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
                                            <p className="font-medium text-[#0F172A] mt-2 font-[Lora]">{type.label}</p>
                                            <p className="text-sm text-[#475569] font-[Lexend]">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Difficulty */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#FFFBEB] flex items-center justify-center">
                                        <Gauge size={20} className="text-[#F59E0B]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#0F172A] font-[Lora]">Difficulty Level</h2>
                                        <p className="text-sm text-[#475569] font-[Lexend]">Choose the challenge level</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {difficultyLevels.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => settings.setDifficulty(level.id as 'easy' | 'medium' | 'hard')}
                                            className={cn(
                                                'p-4 rounded-[16px] border transition-all duration-200 text-center',
                                                settings.difficulty === level.id
                                                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                                                    : 'bg-white border-[#E5E7EB] hover:border-[#94A3B8]'
                                            )}
                                        >
                                            <p className="font-medium text-[#0F172A] font-[Lora]">{level.label}</p>
                                            <p className="text-xs text-[#94A3B8] mt-1 font-[Lexend]">{level.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Interview Style */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#FEF2F2] flex items-center justify-center">
                                        <Bot size={20} className="text-[#EF4444]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#0F172A] font-[Lora]">Interview Style</h2>
                                        <p className="text-sm text-[#475569] font-[Lexend]">How strict should the interviewer be?</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {interviewStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => settings.setInterviewStyle(style.id as 'friendly' | 'neutral' | 'strict')}
                                            className={cn(
                                                'p-4 rounded-[16px] border transition-all duration-200 text-center',
                                                settings.interviewStyle === style.id
                                                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                                                    : 'bg-white border-[#E5E7EB] hover:border-[#94A3B8]'
                                            )}
                                        >
                                            <p className="font-medium text-[#0F172A] font-[Lora]">{style.label}</p>
                                            <p className="text-xs text-[#94A3B8] mt-1 font-[Lexend]">{style.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Duration */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center">
                                        <Timer size={20} className="text-[#2563EB]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#0F172A] font-[Lora]">Duration</h2>
                                        <p className="text-sm text-[#475569] font-[Lexend]">How long should the interview be?</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {durations.map((duration) => (
                                        <button
                                            key={duration.value}
                                            onClick={() => settings.setDuration(duration.value as 5 | 10 | 20)}
                                            className={cn(
                                                'p-4 rounded-[16px] border transition-all duration-200 text-center',
                                                settings.duration === duration.value
                                                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                                                    : 'bg-white border-[#E5E7EB] hover:border-[#94A3B8]'
                                            )}
                                        >
                                            <p className="font-medium text-[#0F172A] font-[Lora]">{duration.label}</p>
                                            <p className="text-xs text-[#94A3B8] mt-1 font-[Lexend]">{duration.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Start Button */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pt-4">
                        <Button onClick={handleStart} className="w-full" size="lg" isLoading={isStarting}>
                            Start Interview
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
