export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isTyping?: boolean;
  }
  
  export interface QuickAction {
    id: string;
    text: string;
    emoji: string;
    action: string;
  }