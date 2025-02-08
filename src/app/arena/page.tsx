'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Difficulty } from '@prisma/client';
import { fetchLatestSubmissionsCodeForces, fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Question {
  id: string;
  contestId: number;
  question: {
    id: string;
    leetcodeUrl: string | null;
    codeforcesUrl: string | null;
    difficulty: Difficulty;
    points: number;
    slug: string;
    questionTags: QuestionTag[];
  };
  submissions?: {
    status: string;
    score: number;
  }[];
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

interface QuestionTag {
  id: string;
  name: string;
}

const AVAILABLE_TAGS = [
  "PrefixSum",
  "TwoPointers",
  "1D Arrays",
  "Graph",
  "2D Arrays",
  "Time complexity",
  "Basic Maths",
  "Space complexity",
  "BinarySearch",
  "DP",
  "Sorting",
  "Linear search",
  "Exponentiation",
  "Recursion"
];

const DIFFICULTIES = [
  { value: 'ALL', label: 'All Difficulties' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
  { value: 'VERYHARD', label: 'Very Hard' },
];

const QuestionSolving = () => {
  const [verifiedProblems, setVerifiedProblems] = useState<Set<string>>(new Set());
  const [cUsername, setCUsername] = useState('')
  const [lUsername, setLUsername] = useState('')
  const [score, setScore] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [isScoreUpdating, setIsScoreUpdating] = useState<boolean>(false);
  const [resLeet, setResLeet] = useState<string>();
  const [resCodef, setResCodef] = useState<string>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const getDifficultyColor = (difficulty: Difficulty): string => {
    const colors: Record<Difficulty, string> = {
      BEGINNER: 'bg-green-500/10 text-green-500',
      EASY: 'bg-green-500/10 text-green-500',
      MEDIUM: 'bg-yellow-500/10 text-yellow-500',
      HARD: 'bg-red-500/10 text-red-500',
      VERYHARD: 'bg-red-700/10 text-red-700'
    };
    return colors[difficulty] || 'bg-gray-500/10 text-gray-500';
  };

  const animateScoreUpdate = (oldScore: number, newScore: number) => {
    setIsScoreUpdating(true);
    let current = oldScore;
    const step = Math.ceil((newScore - oldScore) / 20);
    
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

  const checkExistingSubmission = async (problemName: string) => {
    const response = await axios.post('/api/checkExistingSubmission', {
      problemName
    })

    return response.data.solved

  }

  const handleVerify = async (
    platform: 'Leetcode' | 'Codeforces',
    problemName: string,
    questionId: string,
    contestId: number,
    points: number
  ): Promise<void> => {
    if (verifiedProblems.has(questionId)) {
      toast.error('Problem already verified!');
      return;
    }

    setIsVerifying({ ...isVerifying, [questionId]: true });
    try {
      if (platform === "Leetcode") {
        const res = await fetchLatestSubmissionsLeetCode(lUsername);
        if(!resLeet) return
        if (res?.recentSubmissionList) {
          let solved = res.recentSubmissionList.find(
            (p: LeetCodeSubmission) => 
              p.titleSlug === problemName && 
              p.statusDisplay === 'Accepted' && 
              p.timestamp > resLeet
          );
          if(solved){
            const r = await checkExistingSubmission(problemName)
            if(r){
              solved = undefined
              toast.success('Already Attempted Question')
            } 
          }
          if (solved) {
            setVerifiedProblems(prev => new Set([...prev, questionId]));
            const awardedPoints = Math.floor(points / 2);
            animateScoreUpdate(score, score + awardedPoints);
            toast.success(`Problem verified! +${awardedPoints} points`);
            await updateScoreInDatabase(questionId, contestId, awardedPoints);
          } else {
            toast.error('No accepted submission found');
          }
        }
      } else {
        const res = await fetchLatestSubmissionsCodeForces(cUsername);
        if(!resCodef) return
        if (res) {
          let solved = res.find(
            (p: CodeForcesSubmission) => 
              p.problem.name === problemName && 
              p.verdict === 'OK' && 
              p.creationTimeSeconds > parseInt(resCodef)
          );

          if(solved){
            const r = await checkExistingSubmission(problemName)
            if(r){
              solved = undefined
              toast.success('Already Attempted Question')
            } 
          }
          
          if (solved) {
            setVerifiedProblems(prev => new Set([...prev, questionId]));
            const awardedPoints = Math.floor(points / 2);
            animateScoreUpdate(score, score + awardedPoints);
            toast.success(`Problem verified! +${awardedPoints} points`);
            await updateScoreInDatabase(questionId, contestId, awardedPoints);
          } else {
            toast.error('No accepted submission found');
          }
        }
      }
    } catch (error) {
      toast.error('Error verifying submission');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying({ ...isVerifying, [questionId]: false });
    }
  };

  const updateScoreInDatabase = async (questionId: string, contestId: number, points: number) => {
    try {
      const response = await axios.post('/api/updatePracticeScore', {
        questionId,
        contestId,
        score: points,
        headers: { 'Content-Type': 'application/json' },
      });
      if(response.status === 200){
        toast.success('Score Updated')
      }
    } catch (error) {
      console.error('Failed to update score on server:', error);
      toast.error('Score not Updated');
    }
  };

  useEffect(() => {
    const func = async () => {
      const response = await axios.post('/api/questions');
      const responseCodeforcesUsername = await axios.post('/api/user/codeforces/username')
      const responseLeetcodeUsername = await axios.post('/api/user/leetcode/username')
      console.log(responseCodeforcesUsername, responseLeetcodeUsername)
      setCUsername(responseCodeforcesUsername.data.codeforcesUsername)
      setLUsername(responseLeetcodeUsername.data.leetcodeUsername)
      setQuestions(response.data.questions);
      console.log(response.data.questions)
      setScore(response.data.individualPoints)
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
    };
    func();
  }, []);

  useEffect(() => {
    let filtered = questions;

    
    if (selectedDifficulty !== 'ALL') {
      filtered = filtered.filter(q => q.question.difficulty === selectedDifficulty);
    }

   
    if (selectedTags.length > 0) {
      filtered = filtered.filter(q => {
        const questionTagNames = q.question.questionTags.map(tag => tag.name);
        return selectedTags.some(selectedTag => questionTagNames.includes(selectedTag));
      });
    }

    setFilteredQuestions(filtered);
  }, [selectedTags, selectedDifficulty, questions]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto p-4 mt-16">
      <Card className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Practice Questions</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className={`text-2xl font-bold transition-colors duration-200 ${
                isScoreUpdating ? 'text-green-500' : ''
              }`}>
                {score}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Filter by difficulty:</p>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map(difficulty => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className="rounded-full"
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 overflow-y-auto">
        {filteredQuestions.map((q) => {
          const isVerified = verifiedProblems.has(q.id);
          const hasSubmission = q.submissions?.some(s => s.status === 'ACCEPTED');

          return (
            <Card 
              key={q.id}
              className={`transition-colors duration-200 ${
                (isVerified || hasSubmission) ? 'bg-green-500/5 border-green-500/20' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">
                      {q.question.slug}
                    </CardTitle>
                    {(isVerified || hasSubmission) && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getDifficultyColor(q.question.difficulty)} ${
                      (isVerified || hasSubmission) ? 'opacity-75' : ''
                    }`}
                  >
                    {q.question.difficulty}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {q.question.questionTags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs bg-background/80"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Practice Points: {Math.floor(q.question.points / 2)}
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
                        className={(isVerified || hasSubmission) ? 'opacity-75' : ''}
                      >
                        Solve <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant={(isVerified || hasSubmission) ? "ghost" : "outline"}
                      size="sm"
                      disabled={isVerified || hasSubmission || isVerifying[q.id]}
                      onClick={() => handleVerify(
                        q.question.leetcodeUrl ? 'Leetcode' : 'Codeforces',
                        q.question.slug,
                        q.id,
                        q.contestId,
                        q.question.points
                      )}
                      className={(isVerified || hasSubmission) ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                    >
                      {isVerifying[q.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (isVerified || hasSubmission) ? (
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
  );
};

export default QuestionSolving;