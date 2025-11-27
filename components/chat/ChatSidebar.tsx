'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Pin, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Conversation } from '@/lib/services/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  className?: string;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onPin,
  className,
}: ChatSidebarProps) {
  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const recentConversations = conversations.filter((c) => !c.isPinned);

  return (
    <div className={cn('flex flex-col h-full bg-muted/30', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <Button onClick={onNew} className="w-full" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Pinned */}
        {pinnedConversations.length > 0 && (
          <div>
            <h3 className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
              Angepinnt
            </h3>
            <div className="space-y-1">
              {pinnedConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onPin={onPin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recentConversations.length > 0 && (
          <div>
            <h3 className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
              Kürzlich
            </h3>
            <div className="space-y-1">
              {recentConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onPin={onPin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {conversations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Noch keine Chats</p>
            <p className="text-xs">Starte einen neuen Chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  onSelect: (conversation: Conversation) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
}

function ConversationItem({
  conversation,
  active,
  onSelect,
  onDelete,
  onPin,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
        'hover:bg-muted transition-colors',
        active && 'bg-muted'
      )}
      onClick={() => onSelect(conversation)}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{conversation.title}</p>
        <p className="text-xs text-muted-foreground">
          {conversation.updatedAt.toLocaleDateString('de-DE')}
        </p>
      </div>

      {conversation.isPinned && (
        <Pin className="h-3 w-3 text-primary flex-shrink-0" />
      )}

      {/* Actions Menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-popover border rounded-lg shadow-lg py-1 min-w-32">
              {onPin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(conversation.id, !conversation.isPinned);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {conversation.isPinned ? 'Lösen' : 'Anpinnen'}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversation.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-muted"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Löschen
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

