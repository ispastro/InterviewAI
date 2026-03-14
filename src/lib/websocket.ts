import { io, Socket } from 'socket.io-client';
import type { ChatMessage, Feedback } from '@/types';

type MessageHandler = (message: ChatMessage) => void;
type FeedbackHandler = (feedback: Feedback) => void;
type StatusHandler = (status: 'connected' | 'disconnected') => void;

class WebSocketService {
    private socket: Socket | null = null;
    private messageHandlers: MessageHandler[] = [];
    private feedbackHandlers: FeedbackHandler[] = [];
    private statusHandlers: StatusHandler[] = [];

    connect(sessionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

            this.socket = io(wsUrl, {
                query: { sessionId },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                this.notifyStatus('connected');
                resolve();
            });

            this.socket.on('disconnect', () => {
                this.notifyStatus('disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                this.notifyStatus('disconnected');
                reject(error);
            });

            // Handle incoming events
            this.socket.on('interviewer_message', (data: ChatMessage) => {
                this.messageHandlers.forEach((handler) => handler(data));
            });

            this.socket.on('evaluation_result', (data: Feedback) => {
                this.feedbackHandlers.forEach((handler) => handler(data));
            });

            this.socket.on('followup_question', (data: ChatMessage) => {
                this.messageHandlers.forEach((handler) => handler(data));
            });

            this.socket.on('session_end', () => {
                this.disconnect();
            });
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendAnswer(text: string): void {
        if (this.socket?.connected) {
            this.socket.emit('user_answer', { text, timestamp: new Date() });
        }
    }

    sendTranscript(transcript: string): void {
        if (this.socket?.connected) {
            this.socket.emit('transcript', { text: transcript, timestamp: new Date() });
        }
    }

    sendAudioChunk(chunk: Blob): void {
        if (this.socket?.connected) {
            this.socket.emit('audio_chunk', { chunk, timestamp: new Date() });
        }
    }

    endSession(): void {
        if (this.socket?.connected) {
            this.socket.emit('end_session');
        }
        this.disconnect();
    }

    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
        };
    }

    onFeedback(handler: FeedbackHandler): () => void {
        this.feedbackHandlers.push(handler);
        return () => {
            this.feedbackHandlers = this.feedbackHandlers.filter((h) => h !== handler);
        };
    }

    onStatus(handler: StatusHandler): () => void {
        this.statusHandlers.push(handler);
        return () => {
            this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
        };
    }

    private notifyStatus(status: 'connected' | 'disconnected'): void {
        this.statusHandlers.forEach((handler) => handler(status));
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

// Singleton instance
export const websocketService = new WebSocketService();
