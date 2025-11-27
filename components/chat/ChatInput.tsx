'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Loader2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatAttachment } from '@/lib/services/chat';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  onStopGeneration,
  isGenerating = false,
  placeholder = 'Nachricht eingeben...',
  disabled = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isGenerating || disabled) return;

    onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: ChatAttachment = {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: reader.result as string,
          name: file.name,
          base64: reader.result as string,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('border-t bg-background', className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="h-16 rounded" />
              ) : (
                <div className="px-3 py-2 bg-muted rounded text-sm">{att.name}</div>
              )}
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating || disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating || disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-muted rounded-lg px-4 py-3',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'placeholder:text-muted-foreground',
            'disabled:opacity-50'
          )}
        />

        {isGenerating ? (
          <Button variant="destructive" size="icon" onClick={onStopGeneration}>
            <StopCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || disabled}
            size="icon"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

