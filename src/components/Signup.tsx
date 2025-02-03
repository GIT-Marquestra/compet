"use client";
import axios from "axios";
import React, { useState } from "react";

interface Form {
  username: string;
  email: string;
  password: string;
  leetcodeUsername: string;
  codeforcesUsername: string;
  enrollmentNum: string;
  section: string;
}

function Signup() {
  const [formdata, setFormData] = useState<Form>({
    username: "",
    email: "",
    password: "",
    leetcodeUsername: "",
    codeforcesUsername: "",
    enrollmentNum: "",
    section: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const arr = formdata.email.split('@')
    if(!(arr[1] === 'nst.rishihood.edu.in')){
      window.alert('Enter college Email')
      setFormData({
        username: "",
        email: "",
        password: "",
        leetcodeUsername: "",
        codeforcesUsername: "",
        enrollmentNum: "",
        section: "",
      })
      return 
    }
    
    try {
      const response = await axios.post("/api/auth/signup", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      console.log(response)
      // @ts-ignore
      if (response.status === 200) {
        window.alert("Signup successful!");
      } 

      if(response.status === 400){
        window.alert("Recheck your Inputs")
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input className="text-black" type="text" name="username" placeholder="Enter username" onChange={handleChange} required />

        <label>Email</label>
        <input className="text-black" type="email" name="email" placeholder="Enter email" onChange={handleChange} required />

        <label>Password</label>
        <input className="text-black" type="text" name="password" placeholder="Enter password" onChange={handleChange} required />

        <label>Leetcode Username</label>
        <input className="text-black" type="text" name="leetcodeUsername" placeholder="Enter Leetcode Username" onChange={handleChange} required />

        <label>Codeforces Username</label>
        <input className="text-black" type="text" name="codeforcesUsername" placeholder="Enter Codeforces Username" onChange={handleChange} required />

        <label>Enrollment Number</label>
        <input className="text-black" type="text" name="enrollmentNum" placeholder="Enter Enrollment Number" onChange={handleChange} required />

        <label>Select your NST section</label>
        <select name="section" onChange={handleChange} required>
          <option value="">Select Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Signup;