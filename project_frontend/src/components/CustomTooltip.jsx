// components/ui/CustomTooltip.jsx
import React from 'react';

export const CustomTooltip = ({ 
  children, 
  content,
  position = 'left' // 'top' | 'right' | 'bottom' | 'left'
}) => {
  return (
    <div className="relative inline-flex group">
      {/* Trigger element */}
      {children}
      
      {/* Tooltip bubble */}
      <div className={`
        absolute z-50 px-3 py-2 text-sm rounded-md shadow-lg
        bg-gray-800 text-white whitespace-nowrap
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 ease-in-out
        ${position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : ''}
        ${position === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : ''}
        ${position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : ''}
        ${position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''}
      `}>
        {content}
        {/* Tooltip arrow */}
        <div className={`
          absolute w-2 h-2 bg-gray-800 transform rotate-45
          ${position === 'top' ? 'bottom-[-3px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'right' ? 'left-[-3px] top-1/2 -translate-y-1/2' : ''}
          ${position === 'bottom' ? 'top-[-3px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'left' ? 'right-[-3px] top-1/2 -translate-y-1/2' : ''}
        `} />
      </div>
    </div>
  );
};