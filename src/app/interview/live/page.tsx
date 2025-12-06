'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Bot, X, Wifi, WifiOff, Send } from 'lucide-react';
import { Button, ConfirmModal } from '@/components/ui';
import { ChatMessage, TypingIndicator, ChatInput } from '@/components/chat';
import { FeedbackPanel } from '@/components/feedback';
import { Timer } from '@/components/Timer';
import { MicButton } from '@/components/MicButton';
import { InterviewerAvatar } from '@/components/InterviewerAvatar';
import { useInterviewStore, useSettingsStore } from '@/stores';
import { generateId } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, Feedback } from '@/types';

const mockQuestions = [
    "Tell me about yourself and your experience as a developer.",
    "Can you describe a challenging project you've worked on recently?",
    "How do you approach debugging a complex issue in production?",
    "Tell me about a time when you had to learn a new technology quickly.",
    "How do you handle disagreements with team members about technical decisions?",
];

const generateMockFeedback = (questionId: string): Feedback => ({
    id: generateId(),
    questionId,
    scores: {
        communication: Math.floor(Math.random() * 2) + 3,
        confidence: Math.floor(Math.random() * 2) + 3,
        structure: Math.floor(Math.random() * 2) + 3,
        technicalDepth: Math.floor(Math.random() * 2) + 3,
        relevance: Math.floor(Math.random() * 2) + 4,
    },
    strengths: [
        "Clear and structured response",
        "Good use of specific examples",
        "Demonstrated problem-solving skills",
    ],
    improvements: [
        "Could provide more technical details",
        "Consider using the STAR method more explicitly",
    ],
    modelAnswer: "A strong answer would include: 1) A brief introduction of your background, 2) Specific examples of your experience, 3) How your skills align with the role, 4) Your enthusiasm for the opportunity.",
});

function LiveInterviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const settings = useSettingsStore();
    const interview = useInterviewStore();

    const [showEndModal, setShowEndModal] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sessionId) {
            interview.setSessionId(sessionId);
            interview.setTimer(settings.duration * 60);
            interview.setWebsocketConnected(true);

            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    interview.addMessage({
                        id: generateId(),
                        sender: 'interviewer',
                        message: mockQuestions[0],
                        timestamp: new Date(),
                    });
                }, 1500);
            }, 1000);
        }

        return () => {
            interview.reset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [interview.messages, isTyping]);

    const handleTimerTick = useCallback(() => {
        interview.decrementTimer();
        if (interview.timer <= 1) {
            handleEndInterview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interview.timer]);

    const handleSendMessage = async (message: string) => {
        const userMessageId = generateId();
        interview.addMessage({
            id: userMessageId,
            sender: 'user',
            message,
            timestamp: new Date(),
        });

        interview.setIsEvaluating(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const feedback = generateMockFeedback(userMessageId);
        interview.setFeedback(feedback);
        interview.setIsEvaluating(false);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < mockQuestions.length) {
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    interview.addMessage({
                        id: generateId(),
                        sender: 'interviewer',
                        message: mockQuestions[nextIndex],
                        timestamp: new Date(),
                    });
                    setCurrentQuestionIndex(nextIndex);
                }, 1500);
            }, 1000);
        }
    };

    const handleEndInterview = () => {
        setShowEndModal(false);
        router.push(`/interview/summary?session_id=${sessionId}`);
    };

    const handleMicToggle = () => {
        interview.setRecording(!interview.recording);
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Top Bar */}
            <header className="flex-shrink-0 px-6 py-4 bg-white border-b border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <InterviewerAvatar isThinking={isTyping} />
                        <div>
                            <p className="font-semibold text-[#0F172A] font-[Lora]">AI Interviewer</p>
                            <div className="flex items-center gap-2 text-sm font-[Lexend]">
                                {interview.websocketConnected ? (
                                    <span className="flex items-center gap-1 text-[#10B981]">
                                        <Wifi size={14} />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[#EF4444]">
                                        <WifiOff size={14} />
                                        Disconnected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Timer
                        seconds={interview.timer}
                        totalSeconds={settings.duration * 60}
                        onTick={handleTimerTick}
                    />

                    <Button variant="destructive" size="sm" onClick={() => setShowEndModal(true)}>
                        <X size={18} className="mr-2" />
                        End Interview
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Panel */}
                <div className="flex-1 flex flex-col border-r border-[#E5E7EB] lg:w-[70%]">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                        <AnimatePresence mode="popLayout">
                            {interview.messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                        </AnimatePresence>
                        {isTyping && <TypingIndicator />}
                    </div>

                    <div className="flex-shrink-0 p-6 border-t border-[#E5E7EB] bg-[#F8FAFC]">
                        {settings.mode === 'text' ? (
                            <ChatInput
                                onSend={handleSendMessage}
                                disabled={isTyping || interview.isEvaluating}
                                placeholder="Type your answer..."
                            />
                        ) : (
                            <div className="flex items-center justify-center gap-4">
                                <MicButton
                                    isRecording={interview.recording}
                                    onClick={handleMicToggle}
                                    disabled={isTyping || interview.isEvaluating}
                                />
                                {interview.recording && (
                                    <p className="text-[#475569] font-[Lexend]">Recording... Press again to stop</p>
                                )}
                                {!interview.recording && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleSendMessage("This is a mock voice transcription of the user's answer.")}
                                        disabled={isTyping || interview.isEvaluating}
                                    >
                                        <Send size={18} className="mr-2" />
                                        Send Transcription
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Panel */}
                <div className="hidden lg:block w-[30%] p-6 overflow-y-auto bg-[#F8FAFC]">
                    <h2 className="text-lg font-semibold text-[#0F172A] mb-6 font-[Lora]">Real-time Feedback</h2>
                    <FeedbackPanel
                        feedback={interview.feedback}
                        isEvaluating={interview.isEvaluating}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={showEndModal}
                onClose={() => setShowEndModal(false)}
                onConfirm={handleEndInterview}
                title="End Interview?"
                message="Are you sure you want to end this interview session? Your progress will be saved."
                confirmText="End Interview"
                cancelText="Continue"
                variant="destructive"
            />
        </div>
    );
}

export default function LiveInterviewPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin" />
            </div>
        }>
            <LiveInterviewContent />
        </Suspense>
    );
}
