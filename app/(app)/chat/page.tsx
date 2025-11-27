'use client';

import { useState, useCallback } from 'react';
import { ChatInterface } from '@/components/chat';
import {
  Conversation,
  ChatMessage,
  ChatAttachment,
} from '@/lib/services/chat';

// Demo data for showcase
const demoConversations: Conversation[] = [
  {
    id: '1',
    title: 'Willkommen im Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPinned: true,
  },
];

const demoMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Willkommen! Ich bin dein KI-Assistent. Wie kann ich dir heute helfen?',
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>(
    demoConversations[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    // In production: Load messages from ChatService
    setMessages(demoMessages);
  }, []);

  const handleNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Neue Unterhaltung',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    setMessages([]);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation?.id === id) {
      setActiveConversation(undefined);
      setMessages([]);
    }
  }, [activeConversation]);

  const handlePinConversation = useCallback((id: string, pinned: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: pinned } : c))
    );
  }, []);

  const handleSendMessage = useCallback(async (
    content: string,
    attachments?: ChatAttachment[]
  ) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response (in production: call /api/chat)
    setIsGenerating(true);
    
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Das ist eine Demo-Antwort auf: "${content}"\n\nIn der Produktion würde hier eine echte KI-Antwort erscheinen, die über die /api/chat Route generiert wird.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1500);
  }, []);

  const handleStopGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const handleRetryMessage = useCallback((messageId: string) => {
    console.log('Retry message:', messageId);
    // In production: Re-generate the message
  }, []);

  return (
    <div className="h-screen">
      <ChatInterface
        conversations={conversations}
        activeConversation={activeConversation}
        messages={messages}
        isGenerating={isGenerating}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onPinConversation={handlePinConversation}
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        onRetryMessage={handleRetryMessage}
      />
    </div>
  );
}

