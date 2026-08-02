'use client';
import React from 'react';
import { toast } from 'sonner';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    toast.error(`Error: ${error.message}`, { action: { label: 'Retry', onClick: () => this.setState({ hasError: false }) } });
  }
  render() {
    if (this.state.hasError) return <div className="h-screen flex items-center justify-center text-white">Something went wrong.</div>;
    return this.props.children;
  }
}
