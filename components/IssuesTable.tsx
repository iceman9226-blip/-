import React from 'react';
import { UsabilityIssue, PriorityLevel, IssueSeverity, IssueFrequency, FixCost } from '../types';
import { AlertOctagon, AlertTriangle, AlertCircle, Hammer } from 'lucide-react';

interface Props {
  issues: UsabilityIssue[];
}

const IssuesTable: React.FC<Props> = ({ issues }) => {
  // Sort issues by priority score descending
  const sortedIssues = [...issues].sort((a, b) => b.priorityScore - a.priorityScore);

  const getPriorityBadge = (level: PriorityLevel) => {
    switch (level) {
      case PriorityLevel.URGENT:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><AlertOctagon className="w-3 h-3" /> 紧急</span>;
      case PriorityLevel.HIGH:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3" /> 高</span>;
      case PriorityLevel.MEDIUM:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3" /> 中</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">低</span>;
    }
  };

  const getLabel = (val: number, type: 'sev' | 'freq' | 'cost') => {
      // Simplified mapping for UI display
      if (type === 'cost') {
          return val === 1.5 ? '高' : val === 1 ? '中' : '低';
      }
      return val === 3 ? '高' : val === 2 ? '中' : '低';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">问题与位置</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">描述</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">评估因子</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">优先级</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedIssues.map((issue) => (
            <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 align-top">
                <div className="font-medium text-slate-900">{issue.title}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="font-mono bg-slate-100 px-1 rounded">@{issue.location}</span>
                </div>
              </td>
              <td className="py-4 px-6 align-top">
                <p className="text-sm text-slate-600 leading-relaxed">{issue.description}</p>
              </td>
              <td className="py-4 px-6 align-top">
                <div className="flex justify-center gap-2 text-xs">
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">严重</span>
                        <span className="font-medium text-slate-700">{getLabel(issue.severity, 'sev')}</span>
                    </div>
                    <div className="w-px bg-slate-200 h-8 mx-1"></div>
                     <div className="flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">频率</span>
                        <span className="font-medium text-slate-700">{getLabel(issue.frequency, 'freq')}</span>
                    </div>
                    <div className="w-px bg-slate-200 h-8 mx-1"></div>
                     <div className="flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">成本</span>
                        <span className="font-medium text-slate-700">{getLabel(issue.fixCost, 'cost')}</span>
                    </div>
                </div>
              </td>
              <td className="py-4 px-6 align-top text-right">
                {getPriorityBadge(issue.priorityLevel)}
                <div className="text-[10px] text-slate-400 mt-1">分数: {issue.priorityScore.toFixed(1)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {issues.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
            未发现显著的易用性问题。做得太棒了！
        </div>
      )}
    </div>
  );
};

export default IssuesTable;