import React from 'react';
import { X } from 'lucide-react';

/**
 * MoreSheet - 판단 근거 바텀시트
 */
function MoreSheet({ isOpen, title, sections = [], onClose }) {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)] space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">
                {section.label}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="text-neutral-700 pl-3 border-l-2 border-primary/30"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MoreSheet;
