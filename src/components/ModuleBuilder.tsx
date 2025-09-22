import { useEffect, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown,
  GripVertical,
  BookOpen,
  HelpCircle,
  List
} from 'lucide-react';
import LessonModal from '@/components/modals/LessonModal';
import QuizModal from '@/components/modals/QuizModal';
import QuestionModal from '@/components/modals/QuestionModal';
import ManageQuestionsModal from '@/components/modals/ManageQuestionsModal';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  correct_answer: string;
  explanation?: string;
  points: number;
  options?: string[];
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  pdf_url?: string;
  is_free: boolean;
  order_index: number;
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
  questions: Question[];
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
}

interface SortableContentItemProps {
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
  onManageQuestions?: () => void;
}

const SortableContentItem: React.FC<SortableContentItemProps> = ({
  item,
  onEdit,
  onDelete,
  onManageQuestions
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLesson = item.type === 'lesson';
  const data = item.data as Lesson | Quiz;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center space-x-2">
        {isLesson ? (
          <BookOpen className="h-4 w-4 text-primary" />
        ) : (
          <HelpCircle className="h-4 w-4 text-secondary" />
        )}
        <Badge variant={isLesson ? "default" : "secondary"}>
          {isLesson ? 'Lesson' : 'Quiz'}
        </Badge>
      </div>

      <div className="flex-1">
        <h4 className="font-medium">{data.title}</h4>
        {!isLesson && (
          <p className="text-xs text-muted-foreground">
            {(item.data as Quiz).questions?.length || 0} questions
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {!isLesson && onManageQuestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageQuestions}
          >
            <List className="h-3 w-3 mr-1" />
            Questions ({(item.data as Quiz).questions?.length || 0})
          </Button>
        )}
        
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const ModuleBuilder: React.FC<ModuleBuilderProps> = ({ modules, onChange }) => {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<string | null>(null);
  
  const [lessonModal, setLessonModal] = useState({ open: false, moduleId: '', lesson: null as Lesson | null });
  const [quizModal, setQuizModal] = useState({ open: false, moduleId: '', quiz: null as Quiz | null });
  const [questionModal, setQuestionModal] = useState({ open: false, quiz: null as Quiz | null, question: null as Question | null });
  const [manageQuestionsModal, setManageQuestionsModal] = useState({ open: false, quiz: null as Quiz | null });
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save modules when they change
  useEffect(() => {
    // This would typically save to localStorage or trigger a parent auto-save
    const saveTimeout = setTimeout(() => {
      console.log('Auto-saving modules...', modules.length);
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [modules]);

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
      setLessonModal({ open: true, moduleId, lesson: null });
    } else {
      setQuizModal({ open: true, moduleId, quiz: null });
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
        id: `content-${Date.now()}`,
        type: 'lesson',
        data: { ...lesson, order_index: module.content.length }
      };
      newContent = [...module.content, newItem];
    }

    updateModule(lessonModal.moduleId, { content: newContent });
    setLessonModal({ open: false, moduleId: '', lesson: null });
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
          ? { ...item, data: quiz }
          : item
      );
    } else {
      // Add new quiz
      const newItem: ContentItem = {
        id: `content-${Date.now()}`,
        type: 'quiz',
        data: { ...quiz, order_index: module.content.length, questions: [] }
      };
      newContent = [...module.content, newItem];
    }

    updateModule(quizModal.moduleId, { content: newContent });
    setQuizModal({ open: false, moduleId: '', quiz: null });
  };

  const editContentItem = (moduleId: string, item: ContentItem) => {
    if (item.type === 'lesson') {
      setLessonModal({ open: true, moduleId, lesson: item.data as Lesson });
    } else {
      setQuizModal({ open: true, moduleId, quiz: item.data as Quiz });
    }
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

  const manageQuestions = (quiz: Quiz) => {
    setManageQuestionsModal({ open: true, quiz });
    setCurrentQuizQuestions(quiz.questions || []);
  };

  const saveQuestion = (question: Question) => {
    if (!manageQuestionsModal.quiz && !questionModal.quiz) return;
    
    const targetQuiz = manageQuestionsModal.quiz || questionModal.quiz;
    
    const updatedQuestions = questionModal.question
      ? currentQuizQuestions.map(q => 
          q.id === question.id ? question : q
        )
      : [...currentQuizQuestions, question];
    
    setCurrentQuizQuestions(updatedQuestions);
    
    // Update the quiz in the modules
    const updatedModules = modules.map(module => ({
      ...module,
      content: module.content.map(item => {
        if (item.type === 'quiz' && item.data.id === targetQuiz!.id) {
          return {
            ...item,
            data: {
              ...item.data,
              questions: updatedQuestions,
              total_questions: updatedQuestions.length
            }
          };
        }
        return item;
      })
    }));
    
    onChange(updatedModules);
  };
  
  const editQuestion = (question: Question) => {
    setQuestionModal({
      open: true,
      quiz: manageQuestionsModal.quiz,
      question
    });
  };
  
  const createQuestion = () => {
    setQuestionModal({
      open: true,
      quiz: manageQuestionsModal.quiz,
      question: null
    });
  };
  
  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = currentQuizQuestions.filter(q => q.id !== questionId);
    setCurrentQuizQuestions(updatedQuestions);
    
    if (!manageQuestionsModal.quiz) return;
    
    // Update the quiz in the modules
    const updatedModules = modules.map(module => ({
      ...module,
      content: module.content.map(item => {
        if (item.type === 'quiz' && item.data.id === manageQuestionsModal.quiz!.id) {
          return {
            ...item,
            data: {
              ...item.data,
              questions: updatedQuestions,
              total_questions: updatedQuestions.length
            }
          };
        }
        return item;
      })
    }));
    
    onChange(updatedModules);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Modules</h3>
        <Button onClick={addModule} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No modules yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your course by adding your first module.
          </p>
          <Button onClick={addModule}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Module
          </Button>
        </Card>
      )}

      {modules.map((module, moduleIndex) => (
        <Card key={module.id} className="overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleModule(module.id)}
                >
                  {openModules.has(module.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {editingModule === module.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(module.id, { title: e.target.value })}
                      onBlur={() => setEditingModule(null)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') setEditingModule(null);
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <Badge variant="outline">
                        {module.content.length} items
                      </Badge>
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveModule(module.id, 'up')}
                  disabled={moduleIndex === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveModule(module.id, 'down')}
                  disabled={moduleIndex === modules.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingModule(module.id)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteModule(module.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {openModules.has(module.id) && (
            <CardContent className="space-y-4 p-4">
              {editingModule === module.id && (
                <div>
                  <Textarea
                    value={module.description}
                    onChange={(e) => updateModule(module.id, { description: e.target.value })}
                    placeholder="Module description..."
                    rows={2}
                  />
                </div>
              )}

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
                        onManageQuestions={
                          item.type === 'quiz' 
                            ? () => manageQuestions(item.data as Quiz)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {module.content.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No content added yet</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => addContentItem(module.id, 'lesson')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addContentItem(module.id, 'quiz')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <LessonModal
        open={lessonModal.open}
        onOpenChange={(open) => setLessonModal(prev => ({ ...prev, open }))}
        onSave={saveLesson}
        initialData={lessonModal.lesson}
      />

      <QuizModal
        open={quizModal.open}
        onOpenChange={(open) => setQuizModal(prev => ({ ...prev, open }))}
        onSave={saveQuiz}
        initialData={quizModal.quiz}
      />

      <ManageQuestionsModal
        open={manageQuestionsModal.open}
        onOpenChange={(open) => setManageQuestionsModal({ open, quiz: null })}
        questions={currentQuizQuestions}
        onEditQuestion={editQuestion}
        onDeleteQuestion={deleteQuestion}
        onCreateQuestion={createQuestion}
        quizTitle={manageQuestionsModal.quiz?.title || ''}
      />

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