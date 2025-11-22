
import React, { useState } from 'react';
import { Task, TaskPriority, Resident } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, User, Loader2, RotateCw } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  resident?: Resident;
  onToggleComplete: (id: string) => void;
  onGenerateAiGuide?: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, resident, onToggleComplete, onGenerateAiGuide }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const config = CATEGORY_CONFIG[task.category];
  const CategoryIcon = config.icon;

  const handleGenerateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onGenerateAiGuide) return;
    
    setIsGenerating(true);
    try {
      await onGenerateAiGuide(task.id);
      setIsExpanded(true); // Ensure expanded to show result
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`relative flex gap-4 p-4 mb-4 bg-white rounded-xl shadow-sm border-l-4 transition-all duration-300 ${task.isCompleted ? 'border-green-500 opacity-70' : `border-l-${config.color.split(' ')[0].replace('bg-', '')} border-opacity-50`}`}>
      {/* Left: Time & Status */}
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="text-lg font-bold text-gray-700 font-mono">{task.time}</span>
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-2 text-gray-400 hover:text-green-600 transition-colors"
          aria-label={task.isCompleted ? "完了としてマーク" : "未完了としてマーク"}
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <Circle className="w-8 h-8" />
          )}
        </button>
        <div className={`mt-2 h-full w-0.5 bg-gray-100 ${task.isCompleted ? 'bg-green-100' : ''} rounded-full`}></div>
      </div>

      {/* Right: Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-2">
              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {config.label}
              </div>
              {resident && (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${resident.avatarColor}`}>
                  <User className="w-3 h-3 mr-1" />
                  {resident.name}
                </div>
              )}
              {task.priority === TaskPriority.URGENT && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white animate-pulse">
                   緊急
                 </span>
              )}
            </div>
            
            <h3 className={`text-lg font-semibold text-gray-900 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
          </div>
        </div>

        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {task.description}
        </p>

        {/* Collapsible Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
             {task.imageUrl && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">添付画像:</p>
                <img 
                  src={task.imageUrl} 
                  alt="Task attachment" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            {task.aiGeneratedInstructions ? (
              <div className="bg-green-50 p-3 rounded-lg mb-2 border border-green-100 relative group">
                <div className="flex items-center gap-2 text-green-700 text-xs font-bold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI サポート手順 {resident ? `(${resident.name}様向け)` : ''}</span>
                </div>
                <div className="text-sm text-green-900 whitespace-pre-line leading-relaxed">
                  {task.aiGeneratedInstructions}
                </div>
                {onGenerateAiGuide && (
                  <button 
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="手順を再生成（最新のプロフィールを反映）"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ) : (
              onGenerateAiGuide && !task.isCompleted && (
                <button 
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-full py-2 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg text-green-700 text-xs font-bold flex items-center justify-center gap-2 hover:from-green-100 hover:to-teal-100 transition-all mb-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AIで詳細手順を生成 {resident ? `（${resident.name}様の特性を考慮）` : ''}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-2 font-medium"
        >
          {isExpanded ? (
            <>詳細を閉じる <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>詳細を表示 <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
