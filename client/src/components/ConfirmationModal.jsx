import { useState } from 'react';

export default function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-[#FBF9F4] border border-[#EBE9E0] rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="font-sans text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-transparent border border-[#EBE9E0] rounded-xl hover:bg-[#EFEBE2] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
