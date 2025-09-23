import React from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  options?: string[];
  explanation?: string;
  order_index: number;
}

interface ManageQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCreateQuestion: () => void;
  onReorderQuestions: (questions: Question[]) => void;
  quizTitle: string;
}

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  index,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between p-4 border border-border rounded-lg bg-card"
    >
      <div className="flex items-start space-x-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
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
      </div>
      
      <div className="flex space-x-1 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  open,
  onOpenChange,
  questions,
  onEditQuestion,
  onDeleteQuestion,
  onCreateQuestion,
  onReorderQuestions,
  quizTitle
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      // Update order_index for all questions
      const updatedQuestions = reorderedQuestions.map((question, index) => ({
        ...question,
        order_index: index
      }));
      
      onReorderQuestions(updatedQuestions);
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() => onEditQuestion(question)}
                  onDelete={() => onDeleteQuestion(question.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

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