'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, ExternalLink, CheckCircle, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Difficulty } from '@prisma/client';
import { fetchLatestSubmissionsCodeForces, fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch';
import axios from 'axios';

interface Question {
  id: string;
  contestId: number;
  questionId: string;
  createdAt: Date;
  question: {
    id: string;
    leetcodeUrl: string | null;
    codeforcesUrl: string | null;
    difficulty: Difficulty;
    points: number;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface LeetCodeSubmission {
  titleSlug: string;
  statusDisplay: string;
  timestamp: string;
}

interface CodeForcesSubmission {
  problem: {
    name: string;
  };
  verdict: string;
  creationTimeSeconds: number;
}

interface ApiResponse {
  status: number;
  questions?: Question[];
  message?: string;
  remainingTime?: number
  expiryTime?: number
}

const ContestQuest: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [show, setShow] = useState<boolean>(false);
  const params = useParams();
  const id = params.num?.[0];
  const [resLeet, setResLeet] = useState<string>();
  const [resCodef, setResCodef] = useState<string>();
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(7200); // 2 hours in seconds
  const [questions, setQuestions] = useState<Question[]>([]);
  const [verifiedProblems, setVerifiedProblems] = useState<Set<string>>(new Set());
  const [isScoreUpdating, setIsScoreUpdating] = useState<boolean>(false);
  const [isEndingTest, setIsEndingTest] = useState<boolean>(false);
  const animateScoreUpdate = (oldScore: number, newScore: number) => {
    setIsScoreUpdating(true);
    let current = oldScore;
    const step = Math.ceil((newScore - oldScore) / 20); // Divide animation into 20 steps
    
    const animate = () => {
      if (current < newScore) {
        current = Math.min(current + step, newScore);
        setScore(current);
        requestAnimationFrame(animate);
      } else {
        setIsScoreUpdating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const handleEndTest = async (): Promise<void> => {
    setIsEndingTest(true);
    const loader = toast.loading('Verifying all questions...');

    try {
      for (const question of questions) {
        if (!verifiedProblems.has(question.id)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleVerify(
            question.question.leetcodeUrl ? 'Leetcode' : 'Codeforces',
            question.question.slug,
            question.id,
            question.question.points
          );
        }
      }

      // console.log({
      //   contestId: id,
      //   userEmail: session?.user?.email,
      //   finalScore: score,
      //   questions: Array(verifiedProblems)
      // })

      console.log(verifiedProblems)

      const res = await axios.post('/api/endContest', {
        contestId: id,
        userEmail: session?.user?.email,
        finalScore: score,
        questions: Array.from(verifiedProblems)
      });

      if(res.data.status === 200) toast.success('Test ended successfully!');
      router.push('/user/dashboard');
    } catch (error) {
      toast.error('Error ending test');
      console.error('End test error:', error);
    } finally {
      setIsEndingTest(false);
      toast.dismiss(loader)
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (show && !isEndingTest) {
        e.preventDefault();
        e.returnValue = 'You have an ongoing test. Please end the test before leaving.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [show, isEndingTest]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleEndTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [show, timeLeft]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    //@ts-ignore
    const colors: Record<Difficulty, string> = {
      EASY: 'bg-green-500/10 text-green-500',
      MEDIUM: 'bg-yellow-500/10 text-yellow-500',
      HARD: 'bg-red-500/10 text-red-500'
    };
    return colors[difficulty] || 'bg-gray-500/10 text-gray-500';
  };

  const handleVerify = async (
    platform: 'Leetcode' | 'Codeforces', 
    problemName: string, 
    questionId: string,
    points: number
  ): Promise<void> => {
    if (verifiedProblems.has(questionId)) {
      toast.error('Problem already verified!');
      return;
    }

    const username = 'Abhi_Verma2678'; // This should come from user profile
    try {
      if (platform === "Leetcode") {
        const res = await fetchLatestSubmissionsLeetCode(username);
        if (res?.recentSubmissionList) {
          const solved = res.recentSubmissionList.find(//@ts-ignore
            (p: LeetCodeSubmission) => p.titleSlug === problemName && p.statusDisplay === 'Accepted' && p.timestamp > resLeet
          );
          if (solved) {
            setVerifiedProblems(prev => new Set([...prev, questionId]));
            animateScoreUpdate(score, score + points);
            toast.success(`Problem verified! +${points} points`);
          } else {
            toast.error('No accepted submission found');
          }
        }
      } else {
        const res = await fetchLatestSubmissionsCodeForces(username);
        if (res) {
          const solved = res.find(//@ts-ignore
            (p: CodeForcesSubmission) => p.problem.name === problemName && p.verdict === 'OK' && p.creationTimeSeconds > parseInt(resCodef)
          );
          if (solved) {
            setVerifiedProblems(prev => new Set([...prev, questionId]));
            animateScoreUpdate(score, score + points);
            toast.success(`Problem verified! +${points} points`);
          } else {
            toast.error('No accepted submission found');
          }
        }
      }

      try {
        await axios.post('/api/updateScore', {
          contestId: id,
          //@ts-ignore
          userId: session?.user?.id,
          score: score + points,
          questionId: questionId
        });
      } catch (error) {
        console.error('Failed to update score on server:', error);
      }

    } catch (error) {
      toast.error('Error verifying submission');
      console.error('Verification error:', error);
    }
  };

  const handleStartTest = async (): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse>('/api/startContest', {
        headers: { "Content-Type": "application/json" },
        body: { user: session?.user, contestId: id }
      });

      console.log(response)
      // console.log(response.data.remainingTime)

        const resLeet = await fetchLatestSubmissionsLeetCode('Abhi_Verma2678')
        if(!resLeet) return 
        if(!(resLeet.recentSubmissionList)) return
        const leetTime = resLeet?.recentSubmissionList[0].timestamp
        if(leetTime) setResLeet(leetTime)
        
        const resCodef = await fetchLatestSubmissionsCodeForces('Abhi_Verma2678')
        if(!resCodef) return
        const codefTime = resCodef[0].creationTimeSeconds
        setResCodef(codefTime)
        if(resCodef) setResCodef(resCodef)
        if (response.data.questions) {
          setShow(true);
          setQuestions(response.data.questions);
        }
      if (response.data.status === 200) {
        toast.success('Test Started')
      } else {
        const errorMessages: Record<number, string> = {
          420: 'Test Entry Closed!',
          404: 'To attempt Tests become member of a Group',
          400: 'Not Authenticated, Please SignIn',
        };
        toast.error(errorMessages[response.data.status] || "Unknown Error");
        if (response.data.status === 404) {
          setTimeout(() => router.push('/user/dashboard'), 2000);
        }
      }
    } catch (error) {
      toast.error('Failed to start test');
      console.error('Start test error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      {!show ? (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleStartTest}>
            Start Test
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <span className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-500' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Score</p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                    isScoreUpdating ? 'text-green-500' : ''
                  }`}>
                    {score}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleEndTest}
                  disabled={isEndingTest}
                  className="ml-4"
                >
                  {isEndingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ending Test...
                    </>
                  ) : (
                    'End Test'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {questions.map((q, index) => {
              const isVerified = verifiedProblems.has(q.id);
              return (
                <Card 
                  key={q.id}
                  className={`transition-colors duration-200 ${
                    isVerified ? 'bg-green-500/5 border-green-500/20' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          Question {index + 1}
                        </CardTitle>
                        {isVerified && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getDifficultyColor(q.question.difficulty)} ${
                          isVerified ? 'opacity-75' : ''
                        }`}
                      >
                        {q.question.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Points: {q.question.points}
                      </p>
                      <div className="flex space-x-4">
                        <Link 
                          href={q.question.leetcodeUrl || q.question.codeforcesUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={isVerified ? 'opacity-75' : ''}
                          >
                            Solve <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant={isVerified ? "ghost" : "outline"}
                          size="sm"
                          disabled={isVerified}
                          onClick={() => handleVerify(
                            q.question.leetcodeUrl ? 'Leetcode' : 'Codeforces',
                            q.question.slug,
                            q.id,
                            q.question.points
                          )}
                          className={isVerified ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                        >
                          {isVerified ? (
                            <>Verified <Check className="ml-2 h-4 w-4" /></>
                          ) : (
                            <>Verify <CheckCircle className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestQuest;