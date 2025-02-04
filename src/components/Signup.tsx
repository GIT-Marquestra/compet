"use client";

import axios from "axios";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Form {
  username: string;
  email: string;
  password: string;
  leetcodeUsername: string;
  codeforcesUsername: string;
  enrollmentNum: string;
  section: string;
}

export default function Signup() {
  const [formdata, setFormData] = useState<Form>({
    username: "",
    email: "",
    password: "",
    leetcodeUsername: "",
    codeforcesUsername: "",
    enrollmentNum: "",
    section: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formdata.email.endsWith("@nst.rishihood.edu.in")) {
      window.alert("Enter college Email");
      setFormData({
        username: "",
        email: "",
        password: "",
        leetcodeUsername: "",
        codeforcesUsername: "",
        enrollmentNum: "",
        section: "",
      });
      return;
    }

    try {
      const response = await axios.post("/api/auth/signup", formdata, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) window.alert("Signup successful!");
      else if (response.status === 400) window.alert("Recheck your Inputs");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md border border-gray-700 bg-black">
        <CardHeader>
          <CardTitle className="text-center text-white">Signup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input type="text" name="username" placeholder="Enter username" onChange={handleChange} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
            </div>
            <div>
              <Label>Leetcode Username</Label>
              <Input type="text" name="leetcodeUsername" placeholder="Enter Leetcode Username" onChange={handleChange} required />
            </div>
            <div>
              <Label>Codeforces Username</Label>
              <Input type="text" name="codeforcesUsername" placeholder="Enter Codeforces Username" onChange={handleChange} required />
            </div>
            <div>
              <Label>Enrollment Number</Label>
              <Input type="text" name="enrollmentNum" placeholder="Enter Enrollment Number" onChange={handleChange} required />
            </div>
            <div>
              <Label>Section</Label>
              <Select onValueChange={(value) => setFormData({ ...formdata, section: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-300">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
