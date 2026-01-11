import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/RichTextEditor';

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (quiz: any) => void;
  initialData?: any;
}

const QuizModal: React.FC<QuizModalProps> = ({ open, onOpenChange, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    time_limit_minutes: initialData?.time_limit_minutes || null,
    attempts_allowed: initialData?.attempts_allowed || 3,
    points_per_question: initialData?.points_per_question || 1,
    points_deducted_per_error: initialData?.points_deducted_per_error || 0,
    total_questions: initialData?.total_questions || 0,
    is_free: initialData?.is_free || false
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        time_limit_minutes: initialData?.time_limit_minutes || null,
        attempts_allowed: initialData?.attempts_allowed || 3,
        points_per_question: initialData?.points_per_question || 1,
        points_deducted_per_error: initialData?.points_deducted_per_error || 0,
        total_questions: initialData?.total_questions || 0,
        is_free: initialData?.is_free || false
      });
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (!formData.title.trim()) return;
    
    onSave({
      ...initialData,
      ...formData,
      id: initialData?.id || `temp-quiz-${Date.now()}`
    });
    
    if (!initialData) {
      setFormData({
        title: '',
        description: '',
        time_limit_minutes: null,
        attempts_allowed: 3,
        points_per_question: 1,
        points_deducted_per_error: 0,
        total_questions: 0,
        is_free: false
      });
    }
    
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseInt(value) || 0) : value
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Quiz Title*</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Quiz description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input
                name="time_limit_minutes"
                type="number"
                value={formData.time_limit_minutes || ''}
                onChange={handleInputChange}
                placeholder="No limit"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Attempts Allowed</label>
              <Input
                name="attempts_allowed"
                type="number"
                value={formData.attempts_allowed}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Points per Question</label>
              <Input
                name="points_per_question"
                type="number"
                value={formData.points_per_question}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Points Lost per Error</label>
              <Input
                name="points_deducted_per_error"
                type="number"
                value={formData.points_deducted_per_error}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Total Questions</label>
              <Input
                name="total_questions"
                type="number"
                value={formData.total_questions}
                onChange={handleInputChange}
                min="0"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_free"
              checked={formData.is_free}
              onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_free" className="text-sm font-medium cursor-pointer">
              Free Quiz (Available to all users)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {initialData ? 'Update' : 'Add'} Quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;