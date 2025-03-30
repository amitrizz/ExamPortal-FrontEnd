"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/Header/page";

interface ExamSet {
    setId: number;
    examSetName: string;
    examId: number;
    createdAt: string;
    isAttempted: boolean;
}

interface ExamSetId {
    examSetId: number;
}

export default function GiveExamSetPage({ params }: { params: Promise<{ examId: number }> }) {
    const router = useRouter();
    const [examId, setExamId] = useState<number | null>(null);
    const [examSets, setExamSets] = useState<ExamSet[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ Added Search State
    const [hasAccess, setHasAccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [givenExamSets, setGivenExamSets] = useState<ExamSetId[]>([]);
    const itemsPerPage = 5;

    // Unwrap `params`
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamId(resolvedParams.examId);
        });
    }, [params]);

    // Fetch Exam Sets
    useEffect(() => {
        if (examId) fetchExamsAccess();
    }, [examId]);

    const fetchExamSets = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const examSets = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/set/exam-sets/${examId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const givenExamSets = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/given/sets`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log(givenExamSets.data);
            const filteredData = givenExamSets.data.map((set: ExamSetId) => set.examSetId);

            const sortedExamSet = [...examSets.data].sort((a: ExamSet, b: ExamSet) => 
                a.examSetName.localeCompare(b.examSetName)
            );
            
            const availableSortExamSet = sortedExamSet.filter((e: ExamSet) => e.isAttempted);


            setGivenExamSets(filteredData);
            setExamSets(availableSortExamSet);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exam sets");
        } finally {
            setLoading(false);
        }
    };

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
                fetchExamSets();
                setHasAccess(true);

            } else {
                router.push("/mock-exam")
            }


        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };


    // ✅ Filter Exam Sets based on Search Query
    const filteredExamSets = examSets.filter((exam) =>
        exam.examSetName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ✅ Pagination Logic
    const totalPages = Math.ceil(filteredExamSets.length / itemsPerPage);
    const paginatedExamSets = filteredExamSets.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    return (
        <>
            <Header />
            <div className="container mx-auto p-4  my-16">
                <ToastContainer />
                <h1 className="text-2xl font-bold mb-4">ExamSets</h1>

                {/* ✅ Search Input */}

                <input
                    type="text"
                    placeholder="Search examSets..."
                    className="border px-3 py-2 w-full mb-4"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(0); // ✅ Reset to first page on search
                    }}
                />


                {loading ? (
                    <p className="text-center text-xl font-semibold">Loading...</p>
                ) : (

                    <div className="exam__test">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-wrap justify-center gap-6">
                                {hasAccess && paginatedExamSets.length > 0 ? (
                                    paginatedExamSets.map((exam, index) => (
                                        <div key={index} className="w-full sm:w-[48%] md:w-[30%] lg:w-[22%]">
                                            <div className="bg-white rounded-[25px] w-full h-[300px] shadow-md hover:scale-105 transition-transform duration-300 ease-in-out">
                                                {/* Exam Image */}
                                                <div className="relative w-full h-[225px] rounded-t-[25px] flex justify-center items-center overflow-hidden" style={{ background: "#4c76e0" }}>
                                                    <img
                                                        src="https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/237/landscape/figma-1-logo.png"
                                                        className="h-[120px] w-[130px] object-cover z-10 transition-transform duration-300 ease-in-out hover:scale-110"
                                                        alt={exam.examSetName}
                                                    />
                                                </div>

                                                {/* Exam Details */}
                                                <div className="w-full text-center pt-1">
                                                    {exam.examSetName}
                                                    <br></br>

                                                    {!givenExamSets.includes(exam.setId as unknown as ExamSetId) ? (
                                                        <button
                                                            onClick={() => router.replace(`/mock-test/${examId}/${exam.setId}`)}
                                                            className="border  px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition"
                                                        >

                                                            Attempt Test
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => router.replace(`/result/${exam.setId}`)}
                                                            className="border  px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition"
                                                        >

                                                            View Ranks
                                                        </button>
                                                    )

                                                    }

                                                </div>

                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 w-full">No ExamSets found.</p>
                                )}
                            </div>
                        </div>

                        {/* ✅ Pagination Controls */}
                        {hasAccess && totalPages > 1 && (
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                    className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
