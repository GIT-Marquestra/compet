"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

interface Question {
  leetcodeUrl: string;
  codeforcesUrl: string;
  difficulty: "BEGINNER" | "EASY" | "MEDIUM" | "HARD" | "VERYHARD";
  points: number;
  tags: string[];
  slug: string;
  platform: "Leetcode" | "Codeforces";
}

const extractSlug = (url: string, platform: "leetcode" | "codeforces") => {
  if (platform === "leetcode") {
    const match = url.match(/problems\/([\w-]+)\//);
    return match ? match[1] : "";
  } else if (platform === "codeforces") {
    const match = url.match(/contest\/(\d+)\/problem\/(\w+)/);
    return match ? `${match[1]}-${match[2]}` : "";
  }
  return "";
};

const difficultyPoints = {
  BEGINNER: 20,
  EASY: 40,
  MEDIUM: 80,
  HARD: 120,
  VERYHARD: 140,
};

const availableTags = ["PrefixSum", "TwoPointers", "BinarySearch", "DP", "Graph", "Sorting"];

export default function QuestionForm() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        leetcodeUrl: "",
        codeforcesUrl: "",
        difficulty: "BEGINNER",
        points: 20,
        tags: [],
        slug: "",
        platform: "Leetcode",
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, [field]: value };
          
          // Clear the other platform's URL when platform changes
          if (field === "platform") {
            updatedQuestion.leetcodeUrl = value === "Leetcode" ? updatedQuestion.leetcodeUrl : "";
            updatedQuestion.codeforcesUrl = value === "Codeforces" ? updatedQuestion.codeforcesUrl : "";
            updatedQuestion.slug = ""; // Reset slug on platform change
          }
          
          // Update slug based on the active platform's URL
          if (field === "leetcodeUrl" && updatedQuestion.platform === "Leetcode") {
            updatedQuestion.slug = extractSlug(value, "leetcode");
          } else if (field === "codeforcesUrl" && updatedQuestion.platform === "Codeforces") {
            updatedQuestion.slug = extractSlug(value, "codeforces");
          } else if (field === "difficulty") {
            updatedQuestion.points = difficultyPoints[value as keyof typeof difficultyPoints];
          }
          
          return updatedQuestion;
        }
        return q;
      })
    );
  };

  const handleTagChange = (index: number, selectedTags: string[]) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => (i === index ? { ...q, tags: selectedTags } : q))
    );
  };

  const handleSubmit = async () => {
    try {
      console.log("Sending request", questions)
      const response = await axios.post("/api/questionsInput", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questions),
      });
      if(response.status === 200){
        toast.success('Questions Added Successfully')
      } 
    } catch (error) {
      console.error("Error submitting questions", error);
      toast.error('Questions were not created!')
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Create Contest Questions</h2>
      {questions.map((q, index) => (
        <div key={index} className="border p-3 mb-3">
          <select
            value={q.platform}
            onChange={(e) => updateQuestion(index, "platform", e.target.value)}
            className="border p-2 w-full mb-2"
          >
            <option value="Leetcode">Leetcode</option>
            <option value="Codeforces">Codeforces</option>
          </select>

          {q.platform === "Leetcode" && (
            <input
              type="text"
              placeholder="Leetcode URL"
              value={q.leetcodeUrl}
              onChange={(e) => updateQuestion(index, "leetcodeUrl", e.target.value)}
              className="border p-2 w-full mb-2"
            />
          )}
          
          {q.platform === "Codeforces" && (
            <input
              type="text"
              placeholder="Codeforces URL"
              value={q.codeforcesUrl}
              onChange={(e) => updateQuestion(index, "codeforcesUrl", e.target.value)}
              className="border p-2 w-full mb-2"
            />
          )}

          <select
            value={q.difficulty}
            onChange={(e) => updateQuestion(index, "difficulty", e.target.value)}
            className="border p-2 w-full mb-2"
          >
            {Object.keys(difficultyPoints).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <div className="border p-2 w-full mb-2">
            <label className="block mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={tag}
                    checked={q.tags.includes(tag)}
                    onChange={(e) => {
                      const newTags = e.target.checked
                        ? [...q.tags, tag]
                        : q.tags.filter((t) => t !== tag);
                      handleTagChange(index, newTags);
                    }}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <p>Slug: {q.slug}</p>
          <p>Points: {q.points}</p>
        </div>
      ))}
      <button onClick={addQuestion} className="bg-blue-500 text-white px-4 py-2 rounded mr-3">
        Add Question
      </button>
      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </div>
  );
}