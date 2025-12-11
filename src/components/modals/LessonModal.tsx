import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/FileUpload';

interface LessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lesson: any) => void;
  initialData?: any;
}

const LessonModal: React.FC<LessonModalProps> = ({ open, onOpenChange, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    is_free: false,
    pdf_url: ''
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        video_url: initialData?.video_url || '',
        duration_minutes: initialData?.duration_minutes || 0,
        is_free: initialData?.is_free || false,
        pdf_url: initialData?.pdf_url || ''
      });
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (initialData) {
      if (!window.confirm("Are you sure you want to update this lesson?")) {
        return;
      }
    }
    
    onSave({
      ...initialData,
      ...formData,
      video_url: formData.video_url.trim(),
      id: initialData?.id || `temp-lesson-${Date.now()}`
    });
    
    if (!initialData) {
      setFormData({
        title: '',
        description: '',
        video_url: '',
        duration_minutes: 0,
        is_free: false,
        pdf_url: ''
      });
    }
    
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lesson Title*</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Lesson description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">YouTube Video URL</label>
              <Input
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">PDF Resource (optional)</label>
            <FileUpload
              bucket="course-resources"
              currentFile={formData.pdf_url}
              onUpload={(url) => setFormData(prev => ({ ...prev, pdf_url: url }))}
              accept={{
                'application/pdf': ['.pdf']
              }}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            {formData.pdf_url && (
              <p className="text-xs text-muted-foreground mt-2">
                Current PDF: {formData.pdf_url.split('/').pop()}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_free"
              checked={formData.is_free}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
            />
            <label htmlFor="is_free" className="text-sm font-medium">
              Free lesson (available to all users)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {initialData ? 'Update' : 'Add'} Lesson
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal;