"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/Header/page";

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    category: string;
    examSetId: number;
    imageUrl: string;
    beforeImage: string;
    afterImage: string;
    info: boolean;
    multiQuestion: boolean;
    multiQuestionValue: number;
}

export default function ExamSetQuestionsPage({ params }: { params: Promise<{ examId: number; examSetId: number }> }) {
    const [examId, setExamId] = useState<number | null>(null);
    const [examSetId, setExamSetId] = useState<number | null>(null);
    const [examSetQuestions, setExamSetQuestions] = useState<Question[]>([]);
    const [editExamSetQuestion, setEditExamSetQuestion] = useState<Question | null>(null);
    const [createExamSetQuestion, setCreateExamSetQuestion] = useState<{
        question: string;
        options: string[];
        answer: string;
        beforeImage: string;
        imageUrl: string;
        category: string,
        afterImage: string;
        multiQuestion: boolean;
        multiQuestionValue: number;
        info: boolean;
    }>({
        question: "",
        options: [],
        answer: "",
        beforeImage: "",
        imageUrl: "",
        category: "",
        afterImage: "",
        multiQuestion: false,
        multiQuestionValue: 0,
        info: false,
    });

    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("None");
    const [categories, setCategories] = useState<string[]>([]);

    // Unwrap params using React.use()
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamId(resolvedParams.examId);
            setExamSetId(resolvedParams.examSetId);
        });
    }, [params]);



    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/exam/set/question/sets/${examSetId}/${category}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);

            setExamSetQuestions(res.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };



    const handleCreateExamSetQuestion = async () => {
        try {
            // console.log(examSetId);
            const data = { ...createExamSetQuestion, examSetId: examSetId };
            console.log(data);
            if (createExamSetQuestion.question.length <= 0 || createExamSetQuestion.answer.length <= 0 || createExamSetQuestion.options.length <= 0) {
                alert("all Field are Required")
                return;
            }

            const token = Cookies.get("token");
            console.log(token);

            console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/exam/set/question/create-exam`);
            
            
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/exam/set/question/create-exam`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res);
            
            toast.success("Exam set Question created successfully");
            fetchQuestions(); // Refresh the list
        } catch (error) {
            console.log(error);

            toast.error("Failed to create exam set Question");
        }
    };



    const handleDeleteExamSetQuestion = async (questionId: number) => {
        try {
            const token = Cookies.get("token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/exam/set/question/delete-exam/${questionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam set deleted successfully");
            fetchQuestions(); // Refresh the list
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete exam set");
        }
    };

    const handleUpdateExamSetQuestion = async () => {
        try {
            const token = Cookies.get("token");
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/exam/set/question/update-exam/${editExamSetQuestion?.id}`,
                editExamSetQuestion,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res);
            
            toast.success("Exam set updated successfully");
            setEditExamSetQuestion(null);
            fetchQuestions(); // Refresh the list
        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam set");
        }
    };



    const fetchExamCategories = async () => {
        try {
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/get/by-id/${examId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam Categories Fetch successfully");
            const keys = Object.keys(res.data.examCategory);
            console.log(keys);
            setCategories(keys);
            setCategory(keys[0]);
        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam set");
        }
    };


    useEffect(() => {
        if (category !== "None" && examSetId && examId) fetchQuestions();
    }, [category,examSetId,examId]);



    useEffect(() => {
        if ( examSetId && examId) fetchExamCategories();
    }, [examId,examSetId]);

    return (
        <>
            <Header />
            <div className="">
                <ToastContainer />
                <h1 className="text-2xl font-bold mb-4">
                    Questions for Exam Set {examSetId} (Exam ID: {examId})
                </h1>
                {/* Create Exam Set Form */}
                <div className="exams__forms flex space-x-6">
                    {createExamSetQuestion &&
                        <div className="w-1/2 mt-6 p-4 bg-gray-100 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Create Exam Question</h2>

                            <textarea
                                value={createExamSetQuestion.question}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({ ...createExamSetQuestion, question: e.target.value })
                                }
                                required
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter question"
                            />

                            <input
                                type="text"
                                required
                                value={createExamSetQuestion.options.join(", ")}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({
                                        ...createExamSetQuestion,
                                        options: e.target.value.split(", ")
                                    })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter options (comma separated)"
                            />

                            <input
                                type="text"
                                required
                                value={createExamSetQuestion.answer}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({ ...createExamSetQuestion, answer: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter correct answer"
                            />

                            <select
                                value={createExamSetQuestion.category}
                                required
                                onChange={(e) => setCreateExamSetQuestion({ ...createExamSetQuestion, category: e.target.value })}
                                className="border p-2 rounded mx-2"
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map((categoryKey) => (
                                    <option key={categoryKey} value={categoryKey}>
                                        {categoryKey}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={createExamSetQuestion.beforeImage}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({ ...createExamSetQuestion, beforeImage: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Before Image URL"
                            />

                            <input
                                type="text"
                                value={createExamSetQuestion.imageUrl}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({ ...createExamSetQuestion, imageUrl: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Image URL"
                            />

                            <input
                                type="text"
                                value={createExamSetQuestion.afterImage}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({ ...createExamSetQuestion, afterImage: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="After Image URL"
                            />

                            <select
                                required
                                value={createExamSetQuestion.multiQuestion.toString()} // Convert boolean to string for the select value
                                onChange={(e) =>
                                    setCreateExamSetQuestion({
                                        ...createExamSetQuestion,
                                        multiQuestion: e.target.value === "true", // Convert string to boolean
                                    })
                                }
                                className="border p-2 rounded mx-2"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>

                            <input
                                type="text"
                                value={createExamSetQuestion.multiQuestionValue}
                                onChange={(e) =>
                                    setCreateExamSetQuestion({
                                        ...createExamSetQuestion,
                                        multiQuestionValue: Number(e.target.value) || 0,
                                    })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="MultiQuestion Value"
                            />

                            <select
                                required
                                value={createExamSetQuestion.info.toString()} // Convert boolean to string for the select value
                                onChange={(e) =>
                                    setCreateExamSetQuestion({
                                        ...createExamSetQuestion,
                                        info: e.target.value === "true", // Convert string to boolean
                                    })
                                }
                                className="border p-2 rounded mx-2"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>


                            <button
                                onClick={handleCreateExamSetQuestion}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Create Exam Question
                            </button>
                        </div>

                    }

                    {/* Right Form (50% width) */}
                    {editExamSetQuestion && (
                        <div className="w-1/2 p-4 bg-gray-100 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Edit Exam Question</h2>

                            <textarea
                                value={editExamSetQuestion?.question ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({ ...editExamSetQuestion, question: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter question"
                            />

                            <input
                                type="text"
                                value={editExamSetQuestion?.options?.join(", ") ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({
                                        ...editExamSetQuestion,
                                        options: e.target.value ? e.target.value.split(", ") : [],
                                    })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter options (comma separated)"
                            />

                            <input
                                type="text"
                                value={editExamSetQuestion?.answer ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({ ...editExamSetQuestion, answer: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Enter correct answer"
                            />

                            {/* Category as a dropdown with null handling */}

                            <input
                                type="text"
                                value={editExamSetQuestion?.beforeImage ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({ ...editExamSetQuestion, beforeImage: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Before Image URL"
                            />

                            <input
                                type="text"
                                value={editExamSetQuestion?.imageUrl ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({ ...editExamSetQuestion, imageUrl: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="Image URL"
                            />

                            <input
                                type="text"
                                value={editExamSetQuestion?.afterImage ?? ""}
                                onChange={(e) =>
                                    setEditExamSetQuestion({ ...editExamSetQuestion, afterImage: e.target.value })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="After Image URL"
                            />

                            <select
                                required
                                value={editExamSetQuestion.multiQuestion.toString()} // Convert boolean to string for the select value
                                onChange={(e) =>
                                    setEditExamSetQuestion({
                                        ...editExamSetQuestion,
                                        multiQuestion: e.target.value === "true", // Convert string to boolean
                                    })
                                }
                                className="border p-2 rounded mx-2"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>

                            <input
                                type="number"
                                value={editExamSetQuestion?.multiQuestionValue ?? 0}
                                onChange={(e) =>
                                    setEditExamSetQuestion({
                                        ...editExamSetQuestion,
                                        multiQuestionValue: Number(e.target.value) || 0,
                                    })
                                }
                                className="border px-3 py-2 w-full mb-2"
                                placeholder="MultiQuestion Value"
                            />

                            <select
                                required
                                value={editExamSetQuestion.info.toString()} // Convert boolean to string for the select value
                                onChange={(e) =>
                                    setEditExamSetQuestion({
                                        ...editExamSetQuestion,
                                        info: e.target.value === "true", // Convert string to boolean
                                    })
                                }
                                className="border p-2 rounded mx-2"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>



                            <button
                                onClick={handleUpdateExamSetQuestion}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <p className="text-center text-xl font-semibold">Loading...</p>
                ) : (
                    <div className="overflow-auto">
                        <table className="">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="border px-4 py-2">Sr No</th>
                                    <th className="border px-4 py-2">Question ID</th>
                                    <th className="border px-4 py-2">Question</th>
                                    <th className="border px-4 py-2">Options</th>
                                    <th className="border px-4 py-2">Answer</th>
                                    <th>
                                        {/* Category as a dropdown with null handling */}
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="border p-2 rounded mx-2"
                                        >
                                            <option value="None" disabled>Select Category</option>
                                            {categories.map((categoryKey) => (
                                                <option key={categoryKey} value={categoryKey}>
                                                    {categoryKey}
                                                </option>
                                            ))}
                                        </select>
                                    </th>


                                    <th className="border px-4 py-2">BeforeImageUrl</th>
                                    <th className="border px-4 py-2">ImageUrl</th>
                                    <th className="border px-4 py-2">AfterImageUrl</th>
                                    <th className="border px-4 py-2">MultiQuestion</th>
                                    <th className="border px-4 py-2">MultiQuestionValue</th>
                                    <th className="border px-4 py-2">Info</th>
                                    <th className="border px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {examSetQuestions && examSetQuestions.map((question, index) => (
                                    <tr key={question.id} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2 break-words max-w-xs">{index + 1}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.id}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.question}</td>
                                        <td className="border px-4 py-2">
                                            {question.options.map((option, idx) => (
                                                <p key={idx}>{idx + 1} - {option}</p> // Add key here
                                            ))}
                                        </td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.answer}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.category}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.beforeImage}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.imageUrl}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.afterImage}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.multiQuestion ? "Yes" : "No"}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.multiQuestionValue}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">{question.info}</td>
                                        <td className="border px-4 py-2 break-words max-w-xs">
                                            <button
                                                onClick={() => setEditExamSetQuestion(question)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExamSetQuestion(question.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}



            </div>
        </>
    );
}
