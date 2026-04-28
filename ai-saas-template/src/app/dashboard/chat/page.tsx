'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Plus,
  Send,
  MessageSquare,
  PanelLeftOpen,
  PanelLeftClose,
  Bot,
  User,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const AI_RESPONSES = [
  `好的，我来帮你解答这个问题。

## 关键要点

1. **理解上下文**：首先需要明确问题的背景和约束条件
2. **分析方案**：评估不同的实现路径及其优缺点
3. **最佳实践**：遵循业界推荐的标准做法

### 代码示例

\`\`\`typescript
function solve(input: string): string {
  // 解析输入
  const parsed = JSON.parse(input);
  // 处理逻辑
  return processData(parsed);
}
\`\`\`

希望这些信息对你有帮助！如果还有其他问题，请随时提问。`,

  `这是一个很好的问题！让我详细说明一下：

**核心概念**：这里涉及到几个重要的技术点：

- 异步处理与并发控制
- 数据流的缓冲与背压机制
- 错误处理与重试策略

> 提示：在生产环境中，建议使用成熟的库来处理这些场景，避免重复造轮子。

如果需要更深入的讨论，我可以进一步展开说明。`,

  `让我为你整理一下完整的实现方案：

### 第一步：环境准备
确保安装了所有必要的依赖项。

### 第二步：核心实现
基于你的需求，推荐采用模块化的架构设计。

### 第三步：测试验证
编写单元测试和集成测试来保证代码质量。

| 方案 | 优点 | 缺点 |
|------|------|------|
| 方案 A | 简单直接 | 扩展性一般 |
| 方案 B | 灵活可扩 | 实现复杂 |
| 方案 C | 性能最优 | 维护成本高 |

综合考虑，我推荐**方案 B**，因为它在灵活性和可维护性之间取得了较好的平衡。`,
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createNewConversation(): Conversation {
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    createdAt: new Date(),
  };
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createNewConversation(),
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const updateConversation = (id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  };

  const simulateAIResponse = async (convId: string) => {
    const responseText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    const aiMessageId = generateId();

    updateConversation(convId, (c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: aiMessageId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
      ],
    }));

    setIsStreaming(true);

    for (let i = 0; i <= responseText.length; i++) {
      await new Promise((r) => setTimeout(r, 12 + Math.random() * 18));
      const partial = responseText.slice(0, i);
      updateConversation(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === aiMessageId ? { ...m, content: partial } : m
        ),
      }));
    }

    updateConversation(convId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === aiMessageId ? { ...m, isStreaming: false } : m
      ),
    }));

    setIsStreaming(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const convId = activeId;

    updateConversation(convId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 30) : c.title,
      messages: [...c.messages, userMessage],
    }));

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await simulateAIResponse(convId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const conv = createNewConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput('');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = createNewConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(next[0].id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden flex-col border-r border-white/5 md:flex"
          >
            <div className="flex h-full w-[280px] flex-col">
              {/* New chat button */}
              <div className="p-3">
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  新对话
                </Button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto px-2 pb-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative mb-0.5 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      activeId === conv.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    )}
                    onClick={() => setActiveId(conv.id)}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="shrink-0 rounded p-1 text-gray-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/5 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-300 truncate">
            {activeConversation.title}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {activeConversation.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">开始一段新对话</h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  输入您的问题，AI 助手将竭诚为您解答。支持编程、写作、分析等多种任务。
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['解释 React hooks', '帮我写一段 Python', '什么是微服务？'].map(
                    (hint) => (
                      <button
                        key={hint}
                        onClick={() => {
                          setInput(hint);
                          textareaRef.current?.focus();
                        }}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-gray-300"
                      >
                        {hint}
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
              <AnimatePresence initial={false}>
                {activeConversation.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                          : 'glass-card'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:text-sm prose-code:text-blue-300">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.isStreaming && (
                            <span className="ml-1 inline-flex gap-0.5">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-600 to-gray-700">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-white/5 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="glass-card flex items-end gap-2 rounded-2xl px-4 py-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Shift+Enter 换行)"
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder:text-gray-500 focus:outline-none"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className={cn(
                  'h-9 w-9 shrink-0 rounded-xl transition-all',
                  input.trim() && !isStreaming
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25'
                    : 'bg-gray-700 opacity-50'
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-600">
              AI 生成的回答可能包含不准确的信息，请注意甄别
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
