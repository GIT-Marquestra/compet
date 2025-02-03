"use client";

import axios from "axios";
import { useState } from "react";

interface Question {
  leetcodeUrl: string;
  codeforcesUrl: string;
  difficulty: "Beginner" | "Easy" | "Medium" | "Hard" | "VeryHard";
  points: number;
  tags: string[];
  slug: string;
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
  Beginner: 20,
  Easy: 40,
  Medium: 80,
  Hard: 120,
  VeryHard: 140,
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
        difficulty: "Beginner",
        points: 20,
        tags: [],
        slug: "",
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, [field]: value };
          if (field === "leetcodeUrl") {
            updatedQuestion.slug = extractSlug(value, "leetcode");
          } else if (field === "codeforcesUrl") {
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
      const response = await axios.post("/api/questionsInput", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questions),
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error submitting questions", error);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Create Contest Questions</h2>
      {questions.map((q, index) => (
        <div key={index} className="border p-3 mb-3">
          <input
            type="text"
            placeholder="Leetcode URL"
            value={q.leetcodeUrl}
            onChange={(e) => updateQuestion(index, "leetcodeUrl", e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Codeforces URL"
            value={q.codeforcesUrl}
            onChange={(e) => updateQuestion(index, "codeforcesUrl", e.target.value)}
            className="border p-2 w-full mb-2"
          />
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

          {/* Multi-select for tags */}
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