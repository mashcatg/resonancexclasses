import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  options?: string[];
  explanation?: string;
}

interface ManageQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCreateQuestion: () => void;
  quizTitle: string;
}

const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  open,
  onOpenChange,
  questions,
  onEditQuestion,
  onDeleteQuestion,
  onCreateQuestion,
  quizTitle
}) => {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Questions - {quizTitle}</DialogTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{questions.length} questions</span>
            <span>{totalPoints} total points</span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {questions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {question.question_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{question.question_text}</p>
                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="text-xs text-muted-foreground">
                      Options: {question.options.length}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditQuestion(question)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions added yet</p>
              <p className="text-sm">Add questions to create your quiz</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCreateQuestion}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageQuestionsModal;