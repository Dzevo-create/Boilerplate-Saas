/**
 * Chat Service
 * 
 * Manages conversations and messages with Supabase.
 */

import { createClient } from '@/lib/supabase/client';
import { Conversation, ChatMessage } from './types';

export class ChatService {
  /**
   * Fetch all conversations for a user
   */
  static async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[ChatService] Error fetching conversations:', error);
        return [];
      }

      return (data || []).map((conv) => ({
        id: conv.id,
        title: conv.title,
        messages: [],
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        isPinned: conv.is_pinned,
        metadata: conv.metadata,
      }));
    } catch (error) {
      console.error('[ChatService] Exception:', error);
      return [];
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(
    userId: string,
    title = 'Neue Unterhaltung'
  ): Promise<Conversation | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title,
          is_pinned: false,
        })
        .select()
        .single();

      if (error) {
        console.error('[ChatService] Error creating conversation:', error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isPinned: data.is_pinned,
      };
    } catch (error) {
      console.error('[ChatService] Exception:', error);
      return null;
    }
  }

  /**
   * Update conversation
   */
  static async updateConversation(
    conversationId: string,
    updates: Partial<Pick<Conversation, 'title' | 'isPinned'>>
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch messages for a conversation
   */
  static async fetchMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('[ChatService] Error fetching messages:', error);
        return [];
      }

      return (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        attachments: msg.attachments || [],
        replyTo: msg.reply_to,
        metadata: msg.metadata,
      }));
    } catch (error) {
      console.error('[ChatService] Exception:', error);
      return [];
    }
  }

  /**
   * Create a message
   */
  static async createMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          attachments: message.attachments || [],
          reply_to: message.replyTo,
          metadata: message.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('[ChatService] Error creating message:', error);
        return null;
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return {
        id: data.id,
        role: data.role,
        content: data.content,
        timestamp: new Date(data.timestamp),
        attachments: data.attachments || [],
        replyTo: data.reply_to,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('[ChatService] Exception:', error);
      return null;
    }
  }

  /**
   * Update a message
   */
  static async updateMessage(
    messageId: string,
    updates: Partial<Pick<ChatMessage, 'content' | 'metadata'>>
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Generate conversation title from first message
   */
  static generateTitle(content: string, maxLength = 50): string {
    const cleaned = content.replace(/\n/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength - 3) + '...';
  }
}

