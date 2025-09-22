import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Video, FileText, HelpCircle, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LessonModal from './modals/LessonModal';
import QuizModal from './modals/QuizModal';
import QuestionModal from './modals/QuestionModal';

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  is_free: boolean;
  order_index: number;
  pdf_url?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes?: number;
  attempts_allowed: number;
  points_per_question: number;
  points_deducted_per_error: number;
  total_questions: number;
  order_index: number;
  questions?: Question[];
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order_index: number;
}

interface ContentItem {
  id: string;
  type: 'lesson' | 'quiz';
  data: Lesson | Quiz;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  content: ContentItem[];
}

interface ModuleBuilderProps {
  modules: Module[];
  onChange: (modules: Module[]) => void;
  onAutoSave?: () => void;
}

// Sortable Content Item Component
const SortableContentItem: React.FC<{
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
  onManageQuestions?: () => void;
}> = ({ item, onEdit, onDelete, onManageQuestions }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isQuiz = item.type === 'quiz';
  const quizData = item.data as Quiz;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-accent/20 rounded-lg p-3 flex items-center justify-between group hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent/50 rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center space-x-2">
          {isQuiz ? (
            <HelpCircle className="h-4 w-4 text-primary" />
          ) : (
            <Video className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">{item.data.title}</span>
        </div>
        
        {isQuiz && (
          <Badge variant="secondary" className="text-xs">
            {quizData.questions?.length || 0} questions
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isQuiz && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onManageQuestions}
            title="Manage Questions"
          >
            <FileText className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          title="Edit"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const ModuleBuilder: React.FC<ModuleBuilderProps> = ({ modules, onChange, onAutoSave }) => {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [lessonModal, setLessonModal] = useState<{ open: boolean; moduleId?: string; lesson?: Lesson }>({ open: false });
  const [quizModal, setQuizModal] = useState<{ open: boolean; moduleId?: string; quiz?: Quiz }>({ open: false });
  const [questionModal, setQuestionModal] = useState<{ open: boolean; quizId?: string; question?: Question }>({ open: false });
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      onAutoSave?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [modules, onAutoSave]);

  const toggleModule = (moduleId: string) => {
    const newOpen = new Set(openModules);
    if (newOpen.has(moduleId)) {
      newOpen.delete(moduleId);
    } else {
      newOpen.add(moduleId);
    }
    setOpenModules(newOpen);
  };

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      description: '',
      order_index: modules.length,
      content: []
    };
    onChange([...modules, newModule]);
    setOpenModules(new Set([...openModules, newModule.id]));
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId ? { ...module, ...updates } : module
    );
    onChange(updatedModules);
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = modules.filter(module => module.id !== moduleId)
      .map((module, index) => ({ ...module, order_index: index }));
    onChange(updatedModules);
    const newOpen = new Set(openModules);
    newOpen.delete(moduleId);
    setOpenModules(newOpen);
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === modules.length - 1)
    ) {
      return;
    }

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newModules[currentIndex], newModules[targetIndex]] = 
    [newModules[targetIndex], newModules[currentIndex]];
    
    newModules.forEach((module, index) => {
      module.order_index = index;
    });

    onChange(newModules);
  };

  const handleDragEnd = (event: DragEndEvent, moduleId: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const oldIndex = module.content.findIndex(item => item.id === active.id);
    const newIndex = module.content.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newContent = arrayMove(module.content, oldIndex, newIndex);
      // Update order_index for all items
      newContent.forEach((item, index) => {
        item.data.order_index = index;
      });
      
      updateModule(moduleId, { content: newContent });
    }
  };

  const addContentItem = (moduleId: string, type: 'lesson' | 'quiz') => {
    if (type === 'lesson') {
      setLessonModal({ open: true, moduleId });
    } else {
      setQuizModal({ open: true, moduleId });
    }
  };

  const saveLesson = (lesson: Lesson) => {
    if (!lessonModal.moduleId) return;

    const module = modules.find(m => m.id === lessonModal.moduleId);
    if (!module) return;

    let newContent;
    if (lessonModal.lesson) {
      // Update existing lesson
      newContent = module.content.map(item =>
        item.type === 'lesson' && item.data.id === lesson.id
          ? { ...item, data: lesson }
          : item
      );
    } else {
      // Add new lesson
      const newItem: ContentItem = {
        id: lesson.id,
        type: 'lesson',
        data: { ...lesson, order_index: module.content.length }
      };
      newContent = [...module.content, newItem];
    }

    updateModule(lessonModal.moduleId, { content: newContent });
    setLessonModal({ open: false });
  };

  const saveQuiz = (quiz: Quiz) => {
    if (!quizModal.moduleId) return;

    const module = modules.find(m => m.id === quizModal.moduleId);
    if (!module) return;

    let newContent;
    if (quizModal.quiz) {
      // Update existing quiz
      newContent = module.content.map(item =>
        item.type === 'quiz' && item.data.id === quiz.id
          ? { ...item, data: { ...quiz, questions: currentQuizQuestions } }
          : item
      );
    } else {
      // Add new quiz
      const newItem: ContentItem = {
        id: quiz.id,
        type: 'quiz',
        data: { ...quiz, order_index: module.content.length, questions: [] }
      };
      newContent = [...module.content, newItem];
    }

    updateModule(quizModal.moduleId, { content: newContent });
    setQuizModal({ open: false });
    setCurrentQuizQuestions([]);
  };

  const deleteContentItem = (moduleId: string, itemId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newContent = module.content.filter(item => item.id !== itemId)
      .map((item, index) => ({
        ...item,
        data: { ...item.data, order_index: index }
      }));

    updateModule(moduleId, { content: newContent });
  };

  const editContentItem = (moduleId: string, item: ContentItem) => {
    if (item.type === 'lesson') {
      setLessonModal({ open: true, moduleId, lesson: item.data as Lesson });
    } else {
      const quiz = item.data as Quiz;
      setQuizModal({ open: true, moduleId, quiz });
      setCurrentQuizQuestions(quiz.questions || []);
    }
  };

  const manageQuizQuestions = (quiz: Quiz) => {
    setCurrentQuizQuestions(quiz.questions || []);
    setQuestionModal({ open: true, quizId: quiz.id });
  };

  const saveQuestion = (question: Question) => {
    let newQuestions;
    if (questionModal.question) {
      // Update existing question
      newQuestions = currentQuizQuestions.map(q =>
        q.id === question.id ? question : q
      );
    } else {
      // Add new question
      newQuestions = [...currentQuizQuestions, { ...question, order_index: currentQuizQuestions.length }];
    }

    setCurrentQuizQuestions(newQuestions);
    setQuestionModal({ open: false });
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = currentQuizQuestions.filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, order_index: index }));
    setCurrentQuizQuestions(newQuestions);
  };

  const editQuestion = (question: Question) => {
    setQuestionModal({ open: true, quizId: questionModal.quizId, question });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Modules</h3>
        <Button onClick={addModule} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {modules.map((module, moduleIndex) => (
        <Card key={module.id} className="border-l-4 border-l-primary">
          <Collapsible open={openModules.has(module.id)} onOpenChange={() => toggleModule(module.id)}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <Badge variant="secondary">{module.content.length} items</Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveModule(module.id, 'up');
                      }}
                      disabled={moduleIndex === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveModule(module.id, 'down');
                      }}
                      disabled={moduleIndex === modules.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(module.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Module Title</label>
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(module.id, { title: e.target.value })}
                      placeholder="Enter module title"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={module.description}
                    onChange={(e) => updateModule(module.id, { description: e.target.value })}
                    placeholder="Enter module description"
                    rows={2}
                  />
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Module Content</h4>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addContentItem(module.id, 'lesson')}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addContentItem(module.id, 'quiz')}
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Add Quiz
                      </Button>
                    </div>
                  </div>

                  {module.content.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, module.id)}
                    >
                      <SortableContext
                        items={module.content.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {module.content.map((item) => (
                            <SortableContentItem
                              key={item.id}
                              item={item}
                              onEdit={() => editContentItem(module.id, item)}
                              onDelete={() => deleteContentItem(module.id, item.id)}
                              onManageQuestions={item.type === 'quiz' ? () => manageQuizQuestions(item.data as Quiz) : undefined}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No content added yet</p>
                      <p className="text-sm">Add lessons and quizzes to build your module</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {modules.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No modules yet. Start building your course content!</p>
          <Button onClick={addModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Module
          </Button>
        </Card>
      )}

      {/* Modals */}
      <LessonModal
        open={lessonModal.open}
        onOpenChange={(open) => setLessonModal({ open })}
        onSave={saveLesson}
        initialData={lessonModal.lesson}
      />

      <QuizModal
        open={quizModal.open}
        onOpenChange={(open) => setQuizModal({ open })}
        onSave={saveQuiz}
        initialData={quizModal.quiz}
      />

      {/* Question Management Modal */}
      {questionModal.open && (
        <Dialog open={true} onOpenChange={() => setQuestionModal({ open: false })}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Quiz Questions</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {currentQuizQuestions.length} questions
                </p>
                <Button
                  onClick={() => setQuestionModal({ open: true, quizId: questionModal.quizId })}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {currentQuizQuestions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Question {index + 1}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{question.question_text}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{question.question_type.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{question.points} points</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editQuestion(question)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {currentQuizQuestions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No questions added yet</p>
                  <p className="text-sm">Add questions to create your quiz</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setQuestionModal({ open: false })}
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <QuestionModal
        open={questionModal.open}
        onOpenChange={(open) => setQuestionModal(prev => ({ ...prev, open }))}
        onSave={saveQuestion}
        initialData={questionModal.question}
      />
    </div>
  );
};

export default ModuleBuilder;