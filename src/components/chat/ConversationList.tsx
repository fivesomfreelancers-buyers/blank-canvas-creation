import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import OnlineIndicator from '@/components/presence/OnlineIndicator';
import type { ConversationItem } from '@/hooks/useConversations';

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSelect: (conversationId: string, partnerId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  searchQuery,
  setSearchQuery,
  onSelect,
}) => {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Conversations</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conversationId}
              onClick={() => onSelect(conv.conversationId, conv.partnerId)}
              className={`p-4 cursor-pointer hover:bg-accent border-b transition-colors ${
                selectedConversationId === conv.conversationId ? 'bg-accent border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.partnerImage || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(conv.partnerName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0">
                    <OnlineIndicator userId={conv.partnerId} dotOnly />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground text-sm truncate">{conv.partnerName}</p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs ml-2">{conv.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-muted-foreground">
                    {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;
