'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images.json';

interface ImageUploadProps {
  onImageUpload: (dataUrl: string) => void;
  initialImage?: string | null;
}

export default function ImageUpload({ onImageUpload, initialImage = null }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onImageUpload(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const clearImage = () => {
    setPreview(null);
  };
  
  const uploadPlaceholder = placeholderImages.find(p => p.id === 'upload-placeholder');

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative group aspect-video w-full">
          <Image
            src={preview}
            alt="Scan preview"
            fill
            className="rounded-lg object-contain border bg-slate-100"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="destructive" onClick={clearImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          {uploadPlaceholder && (
             <Image
                src={uploadPlaceholder.imageUrl}
                alt={uploadPlaceholder.description}
                data-ai-hint={uploadPlaceholder.imageHint}
                fill
                className="rounded-lg object-cover opacity-10"
             />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <UploadCloud className="h-12 w-12" />
            <p className="font-semibold">
              {isDragActive ? 'Drop the file here' : 'Drag & drop scan image here'}
            </p>
            <p className="text-sm">or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );
}
