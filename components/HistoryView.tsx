import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, ArrowRight, Calendar } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">暂无历史记录</h3>
        <p className="text-slate-500 mt-2">完成一次分析后，记录将自动保存在这里。</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-400" />
          历史记录
        </h2>
        <span className="text-sm text-slate-500">
          共 {history.length} 条记录 (本地保存)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-[#F6483B]/50 transition-all cursor-pointer group flex flex-col"
          >
            {/* Image Preview Area */}
            <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100">
              <img 
                src={item.previewUrl} 
                alt="Analyzed UI" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                <span className="text-white text-xs font-medium flex items-center gap-1">
                   查看详情 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <div className="text-3xl font-bold text-slate-900">{item.result.overallScore}</div>
                   <div className={`text-xs font-bold uppercase tracking-wider mt-1 
                     ${item.result.overallScore >= 7 ? 'text-[#F6483B]' : item.result.overallScore >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                     {item.result.ratingLevel}
                   </div>
                 </div>
                 <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                 </div>
               </div>

               <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-grow">
                 {item.result.summary}
               </p>

               <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    {Object.entries(item.result.dimensions).map(([key, score]) => (
                        <div key={key} className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 mb-0.5">{key.substring(1)}</span>
                            <span className="text-xs font-semibold text-slate-700">{score as number}</span>
                        </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={(e) => onDelete(item.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                    title="删除记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;