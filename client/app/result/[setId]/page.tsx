"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/Header/page";

interface UserRankingProjection {
    marks: number;
    rankOrder: number;
    userId: number;
}
interface Ranks {
    marks: number;
    rankOrder: number;
    userId: number;
}

interface Rankings {
    userRankingProjection: UserRankingProjection;
    userName: String;
}

interface UserResult {
    category: string;
    correctAns: number;
    totalMarks: number;
    totalQuestion: number;
}
export default function StartExamPageButton({ params }: { params: Promise<{ setId: number }> }) {
    const router = useRouter();
    const [setId, setSetId] = useState<number | null>(null);
    const [userRankResult, setUserRankResult] = useState<Ranks | null>(null);
    const [examSetRanks, setExamSetRanks] = useState<Rankings[]>([]);
    const [userResult, setUserResult] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isViewDetails, setIsViewDetails] = useState(false);

    // Unwrap `params`
    useEffect(() => {
        params.then((resolvedParams) => {
            setSetId(resolvedParams.setId);
        });
    }, [params]);

    // Fetch Exam Sets
    useEffect(() => {
        if (setId) {
            loadExamSetResults();
            loadUserSetResult();
        }
    }, [setId]);



    const loadUserSetResult = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/user/rank/${setId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);
            setUserRankResult(res.data);


        } catch (error) {
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };

    const loadExamSetResults = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/set/ranks/${setId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);
            setExamSetRanks(res.data);


        } catch (error) {
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };
    const handleUserResult = async () => {
        try {
            if (isViewDetails) {
                return;
            }
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/set/details/${setId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);
            setUserResult(res.data);
            setIsViewDetails(true);

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

                {userRankResult &&
                    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg flex">
                        <div className="flex-col justify-center items-center w-1/3">
                            <div className="px-4 py-2 ">You Exam Result</div>
                            <div className="px-4 py-2">Rank : {userRankResult.rankOrder}</div>
                            {/* <td className="border px-4 py-2">{exam.examId}</td> */}
                            <div className="px-4 py-2">Marks {userRankResult.marks}</div>

                            {isViewDetails ?
                                (
                                    <button className="bg-gray-100 px-4 py-2" onClick={() => router.replace(`/result/${setId}/viewPaper`)}>View Paper Analysis</button>
                                ) : (
                                    <button className="bg-gray-100 px-4 py-2" onClick={handleUserResult}>View Details Marks</button>
                                )}

                        </div>
                        <div className="user__result--page-ranks">

                            {
                                isViewDetails && userResult.map((category, index) => (
                                    <div key={index} style={{ display: "flex" }} className="w-[200px] h-[200px] bg-sky-50 border rounded-full flex-col justify-center items-center">
                                        <div className="text-sm text-gray-500 px-4 py-2">{category.category}</div>
                                        <div className="text-sm text-gray-500 px-4 py-2">Marks : {category.totalMarks}</div>
                                        <div className="text-sm text-gray-500 px-4 py-2">  {category.correctAns}/{category.totalQuestion}</div>

                                    </div>
                                ))}
                        </div>


                    </div>

                }

                <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
                    LeaderBoard
                    <table className="w-full border">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="border px-4 py-2">Rank</th>
                                <th className="border px-4 py-2">Marks</th>
                                <th className="border px-4 py-2">User Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examSetRanks && examSetRanks.map((rank, index) => (

                                <tr key={index} className={`${rank.userRankingProjection && rank.userRankingProjection.userId == userRankResult?.userId ? "bg-blue-300" : "hover:bg-gray-100"}`}>
                                    <td className="border px-4 py-2">{rank.userRankingProjection && rank.userRankingProjection.rankOrder}</td>
                                    {/* <td className="border px-4 py-2">{exam.examId}</td> */}
                                    <td className="border px-4 py-2">{rank.userRankingProjection && rank.userRankingProjection.marks}</td>
                                    <td className="border px-4 py-2">{rank.userRankingProjection && rank.userName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="w-full text-center pt-1">

                        {/* <button
                                onClick={() => router.replace(`/mock-test/${examId}/${examSetId}/start`)}
                                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                            >
                                Start
                            </button> */}
                    </div>
                </div>


            </div>
        </>
    );
}
