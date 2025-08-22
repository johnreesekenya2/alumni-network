import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  author?: string;
  timestamp?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, title, author, timestamp }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="image-modal-overlay"
    >
      <div 
        className="bg-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="image-modal-content"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {author && (
              <div className="flex items-center">
                <div className="w-12 h-12 gradient-blue-emerald rounded-full flex items-center justify-center mr-4">
                  <div className="text-white font-bold text-sm">
                    {author.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold" data-testid="modal-author">{author}</h4>
                  {timestamp && (
                    <p className="text-gray-400 text-sm" data-testid="modal-timestamp">{timestamp}</p>
                  )}
                </div>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white text-2xl"
              data-testid="button-close-modal"
            >
              <X />
            </button>
          </div>
          
          <div className="mb-6">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto rounded-lg"
              data-testid="modal-image"
            />
            <p className="text-gray-300 mt-4" data-testid="modal-title">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
