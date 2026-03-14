'use client';

import { useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/lib/websocket';
import { useInterviewStore } from '@/stores';
import type { ChatMessage, Feedback } from '@/types';

export function useWebSocket(sessionId: string | null) {
    const interview = useInterviewStore();
    const isConnecting = useRef(false);

    const connect = useCallback(async () => {
        if (!sessionId || isConnecting.current) return;

        isConnecting.current = true;
        try {
            await websocketService.connect(sessionId);
            interview.setWebsocketConnected(true);
        } catch (error) {
            console.error('Failed to connect:', error);
            interview.setWebsocketConnected(false);
        } finally {
            isConnecting.current = false;
        }
    }, [sessionId, interview]);

    const disconnect = useCallback(() => {
        websocketService.disconnect();
        interview.setWebsocketConnected(false);
    }, [interview]);

    const sendAnswer = useCallback((text: string) => {
        websocketService.sendAnswer(text);
    }, []);

    const sendTranscript = useCallback((transcript: string) => {
        websocketService.sendTranscript(transcript);
    }, []);

    const endSession = useCallback(() => {
        websocketService.endSession();
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        // Set up event handlers
        const unsubMessage = websocketService.onMessage((message: ChatMessage) => {
            interview.addMessage(message);
        });

        const unsubFeedback = websocketService.onFeedback((feedback: Feedback) => {
            interview.setFeedback(feedback);
            interview.setIsEvaluating(false);
        });

        const unsubStatus = websocketService.onStatus((status) => {
            interview.setWebsocketConnected(status === 'connected');
        });

        return () => {
            unsubMessage();
            unsubFeedback();
            unsubStatus();
            disconnect();
        };
    }, [sessionId, interview, disconnect]);

    return {
        connect,
        disconnect,
        sendAnswer,
        sendTranscript,
        endSession,
        isConnected: interview.websocketConnected,
    };
}
