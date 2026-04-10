'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-white p-6">
                    <div className="text-center max-w-md">
                        <AlertCircle size={64} className="text-[#EF4444] mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-[#0F172A] mb-3 font-[Lora]">
                            Something went wrong
                        </h1>
                        <p className="text-[#475569] mb-6 font-[Lexend]">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                            <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
