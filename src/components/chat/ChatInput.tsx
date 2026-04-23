'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedImage) || disabled || uploading) {
      return;
    }

    let imageUrl: string | undefined;

    if (selectedImage) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.imageUrl;
        } else {
          console.error('Failed to upload image');
          return;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      } finally {
        setUploading(false);
      }
    }

    onSend(message.trim(), imageUrl);
    setMessage('');
    handleRemoveImage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/80 p-4">
      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <img src={imagePreview} alt="Preview" className="max-h-[200px] max-w-[200px] rounded-xl object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading}>
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled || uploading}
          className="flex-1"
        />
        <Button type="button" onClick={handleSend} disabled={disabled || uploading || (!message.trim() && !selectedImage)}>
          {uploading ? <span className="animate-pulse">Sending...</span> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
