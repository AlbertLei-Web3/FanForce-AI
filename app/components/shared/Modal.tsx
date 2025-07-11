// A reusable modal component.
// 一个可复用的模态框组件。
'use client'

import { ReactNode, FC } from 'react';

interface ModalProps {
  isOpen: boolean; // Controls whether the modal is visible. 控制模态框是否可见。
  onClose: () => void; // Function to call when the modal should be closed. 当模odal应关闭时调用的函数。
  title: string; // The title of the modal. 模态框的标题。
  children: ReactNode; // The content of the modal. 模态框的内容。
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If the modal is not open, render nothing.
  // 如果模态框未打开，则不渲染任何内容。
  if (!isOpen) return null;

  return (
    // Backdrop container, covers the entire screen.
    // 背景容器，覆盖整个屏幕。
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose} // Close the modal when clicking on the backdrop. 点击背景时关闭模态框。
    >
      {/* Modal content container */}
      {/* 模态框内容容器 */}
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 text-white transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content. 防止在模态框内容内部点击时关闭。
      >
        {/* Modal Header */}
        {/* 模态框头部 */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal" // Accessibility label for screen readers. 为屏幕阅读器提供的可访问性标签。
          >
            &#x2715; {/* A simple 'X' icon for closing. 用于关闭的简单 'X' 图标。 */}
          </button>
        </div>
        
        {/* Modal Body */}
        {/* 模态框主体 */}
        <div>
          {children}
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s forwards ease-out;
        }
      `}</style>
    </div>
  );
};

export default Modal; 