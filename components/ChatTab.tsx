
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { Send, Image as ImageIcon, Video, Plus, MessageCircle, ExternalLink, Check, Share2 } from 'lucide-react';

interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, file?: File) => void;
  currentUser: User;
  isLineConnected: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ messages, onSendMessage, currentUser, isLineConnected }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage("", file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenLine = () => {
      window.open("https://line.me/", "_blank");
  };

  const handleShareMessageToLine = (msg: ChatMessage) => {
    let text = msg.content;
    if (msg.type !== 'text') {
      text = `[${msg.type === 'image' ? '画像' : '動画'}が送信されました] ${msg.senderName}より`;
    }
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-gray-100 rounded-t-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white p-3 shadow-sm border-b flex justify-between items-center">
        <div>
            <h3 className="font-bold text-gray-700">スタッフ共有連絡（チャット）</h3>
            {isLineConnected && (
                <p className="text-[10px] text-[#06C755] font-bold flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> LINE連携中
                </p>
            )}
        </div>
        
        {isLineConnected ? (
            <button 
                onClick={handleOpenLine}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#06C755] text-white rounded-lg text-xs font-bold hover:bg-[#05b34c] transition-colors shadow-sm"
            >
                <MessageCircle className="w-3 h-3 fill-white" />
                LINEグループ
                <ExternalLink className="w-3 h-3" />
            </button>
        ) : (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">オンライン</span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderName === currentUser.name;
          
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'} group`}>
              
              {/* Avatar for Other Users */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {msg.senderName[0]}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                {/* Sender Name & Timestamp Header */}
                <div className="flex items-baseline gap-2 mb-1">
                   {isMe ? (
                      <>
                        <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                        <span className="text-xs font-bold text-gray-800">{msg.senderName}</span>
                      </>
                   ) : (
                      <>
                        <span className="text-xs font-bold text-gray-800">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                      </>
                   )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl p-3 shadow-sm relative group-hover:shadow-md transition-shadow ${
                   isMe 
                     ? 'bg-green-600 text-white rounded-tr-none' 
                     : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                 }`}>
                   {msg.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>}
                   
                   {msg.type === 'image' && msg.mediaUrl && (
                     <img 
                       src={msg.mediaUrl} 
                       alt="shared" 
                       className="mt-2 rounded-lg max-h-48 object-cover border border-white/20"
                     />
                   )}

                   {msg.type === 'video' && msg.mediaUrl && (
                     <video 
                       src={msg.mediaUrl} 
                       controls 
                       className="mt-2 rounded-lg max-h-48 w-full bg-black border border-white/20"
                     />
                   )}
                </div>
                
                {/* Action Line (Sent status or Share) */}
                <div className="flex items-center gap-2 mt-0.5 min-h-[16px]">
                    {isMe && isLineConnected && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 opacity-50">
                            <Check className="w-3 h-3" /> LINE送信済
                        </span>
                    )}
                    {/* Share Button (Visible on hover/group interaction) */}
                    {isLineConnected && (
                        <button 
                            onClick={() => handleShareMessageToLine(msg)}
                            className="text-gray-300 hover:text-[#06C755] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="LINEで転送"
                        >
                            <Share2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
              </div>

              {/* Avatar for Me */}
              {isMe && (
                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                   {msg.senderName[0]}
                 </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex gap-2 items-end">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors flex-shrink-0"
            title="写真・動画を添付"
          >
            <Plus className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileSelect}
          />
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isLineConnected ? "メッセージを入力 (LINEにも送信されます)" : "メッセージを入力..."}
            rows={1}
            className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none resize-none min-h-[44px] max-h-24 text-sm"
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-2.5 text-white rounded-full shadow-md transition-all flex-shrink-0 disabled:opacity-50 disabled:shadow-none ${isLineConnected ? 'bg-[#06C755] hover:bg-[#05b34c]' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-4 px-2 mt-2 text-gray-400">
           <span className="text-[10px] flex items-center gap-1">
             <ImageIcon className="w-3 h-3" /> 写真・動画対応
           </span>
           {isLineConnected && (
               <span className="text-[10px] flex items-center gap-1 text-[#06C755]">
                   <MessageCircle className="w-3 h-3" /> LINE連携有効
               </span>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
