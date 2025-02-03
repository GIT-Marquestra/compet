"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  id: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  difficulty: "Beginner" | "Easy" | "Medium" | "Hard" | "VeryHard";
  tags: string[];
  slug: string;
}

export default function AllQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get<{ questions: Question[] }>("/api/getQuestions");
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const addToTest = (question: Question) => {
    setSelectedQuestions([...selectedQuestions, { ...question, difficulty: "Beginner" }]);
  };

  const updateDifficulty = (index: number, difficulty: Question["difficulty"]) => {
    const updated = [...selectedQuestions];
    updated[index].difficulty = difficulty;
    setSelectedQuestions(updated);
  };

  const handleCreateTest = async () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question to create a test.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/createTest", { questions: selectedQuestions });
      alert("Test created successfully!");
      setSelectedQuestions([]); 
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Failed to create test.");
    }
    setLoading(false);
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">All Questions</h2>

      <div className="border p-4 mb-5">
        <h3 className="text-lg font-semibold">Available Questions</h3>
        {questions.map((q) => (
          <div key={q.id} className="border p-3 mb-2 flex justify-between items-center">
            <div>
              <p className="font-semibold">{q.slug}</p>
              <p>Tags: {q.tags.join(", ")}</p>
            </div>
            <button
              onClick={() => addToTest(q)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add to Test
            </button>
          </div>
        ))}
      </div>

      <div className="border p-4">
        <h3 className="text-lg font-semibold">Selected Questions</h3>
        {selectedQuestions.length === 0 ? (
          <p>No questions selected.</p>
        ) : (
          selectedQuestions.map((q, index) => (
            <div key={q.id} className="border p-3 mb-2">
              <p className="font-semibold">{q.slug}</p>
              <select
                value={q.difficulty}
                onChange={(e) => updateDifficulty(index, e.target.value as Question["difficulty"])}
                className="border p-2 w-full mt-2"
              >
                <option value="Beginner">Beginner</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="VeryHard">Very Hard</option>
              </select>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleCreateTest}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? "Creating Test..." : "Create Test"}
      </button>
    </div>
  );
}