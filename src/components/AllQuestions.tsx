"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  id: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  tags: string[];
  slug: string;
}

export default function AllQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dateError, setDateError] = useState("");

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
    setSelectedQuestions([...selectedQuestions, { ...question }]);
  };

  const validateDates = () => {
    if (!startTime || !endTime) {
      setDateError("Please select both start and end times");
      return false;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      setDateError("Start time cannot be in the past");
      return false;
    }

    if (end <= start) {
      setDateError("End time must be after start time");
      return false;
    }

    setDateError("");
    return true;
  };

  const formatDateForPrisma = (dateString: string) => {
    const date = new Date(dateString);
    // Get the user's timezone offset in minutes
    const offset = date.getTimezoneOffset();
    // Adjust the date by adding the offset (to convert to UTC)
    const utcDate = new Date(date.getTime() - (offset * 60000));
    // Return in ISO format that Prisma expects
    return utcDate.toISOString();
  };

  const handleCreateTest = async () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question to create a test.");
      return;
    }

    if (!validateDates()) {
      return;
    }

    setLoading(true);
    try {
      const testData = {
        questions: selectedQuestions,
        startTime: formatDateForPrisma(startTime),
        endTime: formatDateForPrisma(endTime)
      };

      const res = await axios.post("/api/createTest", testData);
      alert("Test created successfully!");
      setSelectedQuestions([]);
      setStartTime("");
      setEndTime("");
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
              {/* @ts-ignore */}
              <p>{q.difficulty}</p>
              {/* @ts-ignore */}
              <p>Tags: {q.questionTags.map((p) => (
                <span className="mx-1">{p.name}</span>
              ))}</p>
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

      <div className="border p-4 mb-5">
        <h3 className="text-lg font-semibold mb-4">Test Schedule</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded p-2 w-full"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded p-2 w-full"
              min={startTime}
            />
          </div>
          {dateError && (
            <p className="text-red-500 text-sm">{dateError}</p>
          )}
        </div>
      </div>

      <div className="border p-4">
        <h3 className="text-lg font-semibold">Selected Questions</h3>
        {selectedQuestions.length === 0 ? (
          <p>No questions selected.</p>
        ) : (
          selectedQuestions.map((q, index) => (
            <div key={q.id} className="border p-3 mb-2">
              <p className="font-semibold">{q.slug}</p>
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