import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface QuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: any) => void;
  initialData?: any;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ open, onOpenChange, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    question_text: initialData?.question_text || '',
    question_type: initialData?.question_type || 'multiple_choice',
    correct_answer: initialData?.correct_answer || '',
    explanation: initialData?.explanation || '',
    points: initialData?.points || 1,
    options: initialData?.options || ['', '', '', '']
  });
  
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSave = () => {
    if (!formData.question_text.trim() || !formData.correct_answer.trim()) return;
    
    let processedOptions = formData.options;
    
    // For MCQ, filter out empty options
    if (formData.question_type === 'multiple_choice') {
      processedOptions = formData.options.filter(opt => opt.trim() !== '');
    }
    
    onSave({
      ...initialData,
      ...formData,
      options: processedOptions,
      id: initialData?.id || `temp-question-${Date.now()}`
    });
    
    if (!initialData) {
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        correct_answer: '',
        explanation: '',
        points: 1,
        options: ['', '', '', '']
      });
    }
    
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    }));
  };

  const handleQuestionTypeChange = (value: string) => {
    let newOptions = [];
    let newCorrectAnswer = '';

    switch (value) {
      case 'multiple_choice':
        newOptions = ['', '', '', ''];
        break;
      case 'true_false':
        newOptions = ['True', 'False'];
        newCorrectAnswer = 'True';
        break;
      case 'fill_blank':
        newOptions = [];
        break;
    }

    setFormData(prev => ({
      ...prev,
      question_type: value,
      options: newOptions,
      correct_answer: newCorrectAnswer
    }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleImageUpload = (url: string) => {
    // Insert the image URL into the question text at cursor position
    const imageMarkdown = `\n\n![Question Image](${url})\n\n`;
    setFormData(prev => ({
      ...prev,
      question_text: prev.question_text + imageMarkdown
    }));
    setShowImageUpload(false);
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (formData.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Answer Options</label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>
            
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            
            <div>
              <label className="text-sm font-medium">Correct Answer</label>
              <Select 
                value={formData.correct_answer} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {formData.options.filter(opt => opt.trim() !== '').map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div>
            <label className="text-sm font-medium">Correct Answer</label>
            <Select 
              value={formData.correct_answer} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="True">True</SelectItem>
                <SelectItem value="False">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            <label className="text-sm font-medium">Correct Answer</label>
            <Input
              name="correct_answer"
              value={formData.correct_answer}
              onChange={handleInputChange}
              placeholder="Enter the correct answer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use underscores (_____) in the question text to indicate where the blank should be
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Question Text*</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(!showImageUpload)}
              >
                <Upload className="h-3 w-3 mr-1" />
                Add Image
              </Button>
            </div>
            <Textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleInputChange}
              placeholder="Enter your question here..."
              rows={4}
            />
            
            {showImageUpload && (
              <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Upload an image for this question:</p>
                <FileUpload
                  onUpload={handleImageUpload}
                  accept="image/*"
                  maxSize={5}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Question Type</label>
              <Select value={formData.question_type} onValueChange={handleQuestionTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Points</label>
              <Input
                name="points"
                type="number"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          {renderQuestionTypeSpecificFields()}

          <div>
            <label className="text-sm font-medium">Explanation (optional)</label>
            <Textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              placeholder="Explain why this is the correct answer..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.question_text.trim() || !formData.correct_answer.trim()}
            >
              {initialData ? 'Update' : 'Add'} Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;