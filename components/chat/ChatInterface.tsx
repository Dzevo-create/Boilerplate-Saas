'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import {
  Conversation,
  ChatMessage as MessageType,
  ChatAttachment,
} from '@/lib/services/chat';

interface ChatInterfaceProps {
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: MessageType[];
  isGenerating?: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  onStopGeneration?: () => void;
  onRetryMessage?: (messageId: string) => void;
  className?: string;
}

export function ChatInterface({
  conversations,
  activeConversation,
  messages,
  isGenerating = false,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onPinConversation,
  onSendMessage,
  onStopGeneration,
  onRetryMessage,
  className,
}: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* Sidebar */}
      <div className={cn(
        'border-r transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
      )}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={onSelectConversation}
          onNew={onNewConversation}
          onDelete={onDeleteConversation}
          onPin={onPinConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">
              {activeConversation?.title || 'Neuer Chat'}
            </h2>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={onSendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto py-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={onRetryMessage}
                />
              ))}
              {isGenerating && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            onSendMessage={onSendMessage}
            onStopGeneration={onStopGeneration}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onSuggestionClick: (content: string) => void;
}

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    'Erkläre mir, wie Machine Learning funktioniert',
    'Schreibe mir einen Blog-Post über KI',
    'Hilf mir, einen Python-Code zu debuggen',
    'Was sind die besten Praktiken für React?',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Wie kann ich helfen?</h2>
      <p className="text-muted-foreground mb-8">
        Starte eine Unterhaltung oder wähle einen Vorschlag
      </p>
      <div className="grid gap-3 w-full max-w-md">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-3 text-left rounded-lg border hover:bg-muted transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-4">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
      </div>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
      </div>
    </div>
  );
}

