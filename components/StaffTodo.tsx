
import React, { useState } from 'react';
import { Todo, User } from '../types';
import { CheckSquare, Plus, Trash2, Square } from 'lucide-react';

interface StaffTodoProps {
  todos: Todo[];
  currentUser: User;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const StaffTodo: React.FC<StaffTodoProps> = ({ todos, currentUser, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  // Filter todos for the current user only
  const myTodos = todos.filter(t => t.staffId === currentUser.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
        <h2 className="font-bold text-green-900 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-600" />
          自分用メモ・TODO
        </h2>
        <span className="text-xs bg-white text-green-600 px-2 py-0.5 rounded-full font-bold">
          {myTodos.filter(t => !t.isCompleted).length} 件
        </span>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいメモを追加..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button 
            type="submit"
            disabled={!newTodo.trim()}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {myTodos.length > 0 ? (
            myTodos.map(todo => (
              <div key={todo.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                <button 
                  onClick={() => onToggleTodo(todo.id)}
                  className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {todo.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <span className={`text-sm flex-1 break-all ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {todo.content}
                </span>
                <button 
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs">
              メモはありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTodo;
