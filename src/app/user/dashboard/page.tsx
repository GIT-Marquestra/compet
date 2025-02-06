"use client"
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, CheckCircle } from "lucide-react"
import { fetchContests } from '@/serverActions/fetchContests';
import axios from 'axios';
import Link from 'next/link';
import { redirect } from 'next/dist/server/api-utils';
import toast from 'react-hot-toast';
import { getDuration } from '@/serverActions/getDuration';

interface Contest {
  id: string;
  name: string;
  date: string;
  duration: string;
  participants: number;
}

interface AttemptedContest extends Contest {
  score: number;
  rank: number;
}

export default function Dashboard() {
    const [allContests, setAllContests] = useState<{
        id: number,
        startTime: Date,
        endTime: Date,
        status: string,
        createdAt: Date,
        updatedAt: Date
      }[]>([])
  // Sample data - replace with actual data fetching
  useEffect(() => {
    const func = async () => {

        const contests = await axios.get('/api/getContests')
        //@ts-ignore
        if(contests){
          setAllContests(contests.data.contests)
        } else{
          toast.error('Unable to Fetch Questions')
        }
    }

    func()

  }, [])

  

  const attemptedContests: AttemptedContest[] = [
    { id: '1', name: 'Weekly Challenge 1', date: '2024-02-10', duration: '2h', participants: 150, score: 85, rank: 12 },
  ];


  return (
    <div className="space-y-8 p-8 pt-20">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              All Contests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allContests.map((contest: any) => (
                
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">{contest.id}</TableCell>
                    <TableCell>{contest.startTime.split('T')[0]}</TableCell>
                    <TableCell>{getDuration(contest.startTime, contest.endTime)}</TableCell>
                    <TableCell>{contest.startTime.split('T')[1]}</TableCell>
                    <TableCell>{contest.status}</TableCell>
                    <TableCell><Link href={`/contest/${contest.id}`}>Attempt</Link></TableCell>
                  </TableRow>

                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Attempted Contests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attemptedContests.map((contest) => (
                  
                <TableRow key={contest.id}>
                    <TableCell className="font-medium">{contest.name}</TableCell>
                    <TableCell>{contest.date}</TableCell>
                    <TableCell>{contest.score}%</TableCell>
                    <TableCell>{contest.rank}</TableCell>
                    
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}