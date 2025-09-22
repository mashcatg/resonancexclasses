import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Video, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  passing_score: number;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  quizzes: Quiz[];
}

interface ModuleBuilderProps {
  modules: Module[];
  onChange: (modules: Module[]) => void;
}

const ModuleBuilder: React.FC<ModuleBuilderProps> = ({ modules, onChange }) => {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

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
      lessons: [],
      quizzes: []
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
    
    // Update order_index
    newModules.forEach((module, index) => {
      module.order_index = index;
    });

    onChange(newModules);
  };

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newLesson: Lesson = {
      id: `temp-lesson-${Date.now()}`,
      title: `Lesson ${module.lessons.length + 1}`,
      description: '',
      video_url: '',
      duration_minutes: 0,
      is_free: false,
      order_index: module.lessons.length
    };

    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson]
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedLessons = module.lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    );

    updateModule(moduleId, { lessons: updatedLessons });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedLessons = module.lessons
      .filter(lesson => lesson.id !== lessonId)
      .map((lesson, index) => ({ ...lesson, order_index: index }));

    updateModule(moduleId, { lessons: updatedLessons });
  };

  const addQuiz = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newQuiz: Quiz = {
      id: `temp-quiz-${Date.now()}`,
      title: `Quiz ${module.quizzes.length + 1}`,
      description: '',
      time_limit_minutes: 30,
      attempts_allowed: 3,
      passing_score: 70,
      order_index: module.quizzes.length
    };

    updateModule(moduleId, {
      quizzes: [...module.quizzes, newQuiz]
    });
  };

  const updateQuiz = (moduleId: string, quizId: string, updates: Partial<Quiz>) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedQuizzes = module.quizzes.map(quiz =>
      quiz.id === quizId ? { ...quiz, ...updates } : quiz
    );

    updateModule(moduleId, { quizzes: updatedQuizzes });
  };

  const deleteQuiz = (moduleId: string, quizId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedQuizzes = module.quizzes
      .filter(quiz => quiz.id !== quizId)
      .map((quiz, index) => ({ ...quiz, order_index: index }));

    updateModule(moduleId, { quizzes: updatedQuizzes });
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
                    <Badge variant="secondary">{module.lessons.length} lessons</Badge>
                    <Badge variant="secondary">{module.quizzes.length} quizzes</Badge>
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

                {/* Lessons Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      Lessons
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addLesson(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>

                  {module.lessons.map((lesson) => (
                    <Card key={lesson.id} className="p-4 bg-accent/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                            placeholder="Lesson title"
                            className="font-medium"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLesson(module.id, lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium">YouTube Video URL</label>
                            <Input
                              value={lesson.video_url}
                              onChange={(e) => updateLesson(module.id, lesson.id, { video_url: e.target.value })}
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Duration (minutes)</label>
                            <Input
                              type="number"
                              value={lesson.duration_minutes}
                              onChange={(e) => updateLesson(module.id, lesson.id, { duration_minutes: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <Textarea
                          value={lesson.description}
                          onChange={(e) => updateLesson(module.id, lesson.id, { description: e.target.value })}
                          placeholder="Lesson description"
                          rows={2}
                        />

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`lesson-free-${lesson.id}`}
                            checked={lesson.is_free}
                            onChange={(e) => updateLesson(module.id, lesson.id, { is_free: e.target.checked })}
                            className="rounded border-border"
                          />
                          <label htmlFor={`lesson-free-${lesson.id}`} className="text-sm">
                            Free lesson (available to all users)
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Quizzes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Quizzes
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuiz(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Quiz
                    </Button>
                  </div>

                  {module.quizzes.map((quiz) => (
                    <Card key={quiz.id} className="p-4 bg-accent/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={quiz.title}
                            onChange={(e) => updateQuiz(module.id, quiz.id, { title: e.target.value })}
                            placeholder="Quiz title"
                            className="font-medium"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuiz(module.id, quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium">Time Limit (minutes)</label>
                            <Input
                              type="number"
                              value={quiz.time_limit_minutes || ''}
                              onChange={(e) => updateQuiz(module.id, quiz.id, { time_limit_minutes: parseInt(e.target.value) || undefined })}
                              placeholder="No limit"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Attempts Allowed</label>
                            <Input
                              type="number"
                              value={quiz.attempts_allowed}
                              onChange={(e) => updateQuiz(module.id, quiz.id, { attempts_allowed: parseInt(e.target.value) || 1 })}
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Passing Score (%)</label>
                            <Input
                              type="number"
                              value={quiz.passing_score}
                              onChange={(e) => updateQuiz(module.id, quiz.id, { passing_score: parseInt(e.target.value) || 70 })}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>

                        <Textarea
                          value={quiz.description}
                          onChange={(e) => updateQuiz(module.id, quiz.id, { description: e.target.value })}
                          placeholder="Quiz description"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
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
    </div>
  );
};

export default ModuleBuilder;