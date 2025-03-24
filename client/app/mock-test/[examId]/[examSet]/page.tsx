"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
export default function StartExamPageButton({ params }: { params: Promise<{ examId: number, examSet: number }> }) {
    const router = useRouter();
    const [examId, setExamId] = useState<number | null>(null);
    const [examSetId, setExamSetId] = useState<number | null>(null);
    const [examSetQuestions, setExamSetQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    // Unwrap `params`
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamId(resolvedParams.examId);
            setExamSetId(resolvedParams.examSet);
        });
    }, [params]);

    // Fetch Exam Sets
    useEffect(() => {
        if (examId) fetchExamsAccess();
    }, [examId]);

    

    const fetchExamsAccess = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/access/exams`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data, examId);
            if (res.data.includes(Number(examId))) {
                console.log("Has Access");
                setHasAccess(true);

            } else {
                router.push("/give-exam")
            }


        } catch (error) {
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <ToastContainer />
                {hasAccess &&
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Exam Instructions</h2>
                        <ul className="list-decimal pl-5 space-y-2 text-gray-700">
                            <li>
                                Test contains a total of <strong>100 questions</strong>. Each correct answer gives <strong>+ve marks</strong>, and each wrong answer may get <strong>-ve marks</strong> based on the exam pattern.
                            </li>
                            <li>You can use rough sheets while taking the test.</li>
                            <li>Do not click the <strong>"Submit"</strong> button before answering all questions. A test once submitted cannot be resumed.</li>
                            <li>
                                The Question Palette on the right side of the screen will show the status of each question:
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center">
                                        <span className="bg-gray-300 px-2 py-1 rounded mr-2">1</span> You have not visited the question yet.
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-red-500 text-white px-2 py-1 rounded mr-2">1</span> You have not answered the question.
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-green-500 text-white px-2 py-1 rounded mr-2">1</span> You have answered the question.
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-[#5b179c] text-white px-2 py-1 rounded mr-2">1</span> You have NOT answered the question but marked it for review.
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-[#5b179c] text-white px-2 py-1 rounded mr-2 flex items-center">1 <span className="text-xs ml-1">✔</span></span> The question is "Answered and Marked for Review" and will be considered for evaluation.
                                    </div>
                                </div>
                            </li>
                            <li>
                                <strong>Procedure for answering multiple-choice questions:</strong>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>To select your answer, click on one of the options.</li>
                                    <li>To deselect your chosen answer, click on it again or use the <strong>Clear Response</strong> button.</li>
                                    <li>To change your answer, click on another option.</li>
                                    <li>To save your answer, click the <strong>Save & Next</strong> button.</li>
                                    <li>To mark a question for review, click the <strong>Mark for Review & Next</strong> button.</li>
                                </ul>
                            </li>
                        </ul>
                        <div className="w-full text-center pt-1">

                            <button
                                onClick={() => router.replace(`/mock-test/${examId}/${examSetId}/start`)}
                                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                            >
                                Start
                            </button>
                        </div>
                    </div>

                }
            </div>
        </>
    );
}
