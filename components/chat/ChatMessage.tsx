'use client';

import { User, Bot, Copy, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage as MessageType } from '@/lib/services/chat';

interface ChatMessageProps {
  message: MessageType;
  onRetry?: (messageId: string) => void;
  className?: string;
}

export function ChatMessage({ message, onRetry, className }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      'group flex gap-3 py-4',
      isUser ? 'flex-row-reverse' : 'flex-row',
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%] space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment, idx) => (
              <AttachmentPreview key={idx} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={cn(
          'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            title="Kopieren"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {!isUser && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground"
              title="Erneut generieren"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: MessageType['attachments'] extends (infer T)[] ? T : never;
}

function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  if (!attachment) return null;
  
  if (attachment.type === 'image') {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        className="max-w-xs rounded-lg border"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
      <span className="text-sm">{attachment.name}</span>
    </div>
  );
}

