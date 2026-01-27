import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

const normalizeMarkdown = (content: string) => {
  return (content || "")
    .replace(/!\[([^\]]+)\]\s+\(/g, '![$1](')
    .replace(/\n\n+/g, "\n\n");
};

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  attempts_allowed: number;
  course_id: string;
  is_free: boolean;
}

const QuizAttempt = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const hasCheckedAttempts = useRef(false);
  const quizInProgress = useRef(false);
  const userLeftTab = useRef(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  useEffect(() => {
    if (quizId && user && !hasCheckedAttempts.current) {
      fetchQuizData();
    }
  }, [quizId, user]);

  // Tab switch detection - only during active quiz
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (quizInProgress.current && !showResults) {
        if (document.visibilityState === 'hidden') {
          // User left the tab during quiz
          userLeftTab.current = true;
        } else if (document.visibilityState === 'visible' && userLeftTab.current) {
          // User came back after leaving - trigger auto-submit
          userLeftTab.current = false;
          setAutoSubmitTriggered(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showResults]);

  // Handle auto-submit when triggered by tab switch
  useEffect(() => {
    const doAutoSubmit = async () => {
      if (!autoSubmitTriggered || !attemptId || showResults || submitting) return;
      
      try {
        setSubmitting(true);
        quizInProgress.current = false;

        // Calculate score
        let earnedScore = 0;
        questions.forEach(question => {
          if (answers[question.id] === question.correct_answer) {
            earnedScore += question.points;
          }
        });

        const percentage = maxScore > 0 ? (earnedScore / maxScore) * 100 : 0;

        // Update attempt
        const { error } = await supabase
          .from('quiz_attempts')
          .update({
            answers,
            score: earnedScore,
            max_score: maxScore,
            percentage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', attemptId);

        if (error) throw error;

        setScore(earnedScore);
        setShowResults(true);
        toast.warning('Quiz auto-submitted due to tab switch');
      } catch (error) {
        console.error('Error auto-submitting quiz:', error);
        toast.error('Failed to auto-submit quiz');
      } finally {
        setSubmitting(false);
        setAutoSubmitTriggered(false);
      }
    };

    doAutoSubmit();
  }, [autoSubmitTriggered, attemptId, showResults, submitting, questions, answers, maxScore]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, showResults]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);

      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData as any);

      // Check enrollment for non-free quizzes
      if (!(quizData as any).is_free) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', quizData.course_id)
          .eq('student_id', user?.id)
          .single();

        if (!enrollmentData) {
          toast.error('You must be enrolled in this course to take this quiz');
          navigate(-1);
          return;
        }
      }

      // Check previous attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', user?.id);

      if (attemptsError) throw attemptsError;

      hasCheckedAttempts.current = true;

      if (attempts && attempts.length >= quizData.attempts_allowed) {
        toast.error('You have used all your attempts for this quiz');
        navigate(-1);
        return;
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
      
      const typedQuestions = (questionsData || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      }));
      
      setQuestions(typedQuestions);
      
      const totalPoints = typedQuestions.reduce((sum, q) => sum + q.points, 0);
      setMaxScore(totalPoints);

      // Create attempt record
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: user?.id,
          answers: {},
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attemptData.id);
      quizInProgress.current = true;

      // Start timer if time limit exists
      if (quizData.time_limit_minutes) {
        setTimeRemaining(quizData.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (submitting || !attemptId) return;

    try {
      setSubmitting(true);

      // Calculate score
      let earnedScore = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          earnedScore += question.points;
        }
      });

      const percentage = maxScore > 0 ? (earnedScore / maxScore) * 100 : 0;

      // Update attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score: earnedScore,
          max_score: maxScore,
          percentage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId);

      if (error) throw error;

      setScore(earnedScore);
      setShowResults(true);
      quizInProgress.current = false;
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">Quiz not found or has no questions</p>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2 text-primary">
                  {percentage}%
                </div>
                <p className="text-xl text-muted-foreground">
                  You scored {score} out of {maxScore} points
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const isCorrect = answers[question.id] === question.correct_answer;
                  
                  return (
                    <Card key={question.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium mb-2 prose prose-sm max-w-none">
                              <span>{index + 1}. </span>
                              <span className="inline">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkMath]} 
                                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                                >
                                  {question.question_text}
                                </ReactMarkdown>
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium">Your answer:</span>{' '}
                                <span className={answers[question.id] ? '' : 'text-muted-foreground'}>
                                  {answers[question.id] || 'Not answered'}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  <span className="font-medium text-green-600">Correct answer:</span>{' '}
                                  {question.correct_answer}
                                </p>
                              )}
                              {question.explanation && (
                                <p className="text-muted-foreground italic mt-2">
                                  {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '+' : '0'}{isCorrect ? question.points : 0} pts
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="text-center pt-4">
                <Button onClick={() => navigate(-1)}>
                  Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          {/* Quiz Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && (
                <div 
                  className="text-muted-foreground text-sm md:text-md prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: quiz.description }}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Progress: {answeredCount} of {questions.length} answered
                  </p>
                  <Progress value={progress} className="w-64" />
                </div>
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="h-5 w-5" />
                    <span className={timeRemaining < 60 ? 'text-red-600' : ''}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1} ({question.points} {question.points === 1 ? 'point' : 'points'})
                  </CardTitle>
                  <div className="text-base font-normal prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                      {question.question_text}
                    </ReactMarkdown>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-start space-x-2 mb-3">
                        <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} className="mt-1" />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer flex-1">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex, rehypeRaw]}
                            >
                              {option}
                            </ReactMarkdown>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {answeredCount === questions.length 
                    ? 'All questions answered. Ready to submit!' 
                    : `${questions.length - answeredCount} question(s) remaining`}
                </p>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
