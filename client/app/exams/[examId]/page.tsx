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

export default function ExamSetPage({ params }: { params: Promise<{ examId: number }> }) {

    const router = useRouter();
    const [examId, setExamId] = useState<number | null>(null);
    const [examSets, setExamSets] = useState<ExamSet[]>([]);
    const [editExamSet, setEditExamSet] = useState<ExamSet | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [examSetName, setExamSetName] = useState<string>("");
    const [isAttempted, setIsAttempted] = useState<boolean>(false);

    // Unwrap params using React.use()
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamId(resolvedParams.examId);
        });
    }, [params]);

    const fetchExamSets = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/set/exam-sets/${examId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExamSets(res.data);
            setTotalPages(Math.ceil(res.data.length / 5));
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exam sets");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExamSet = async () => {
        try {
            const token = Cookies.get("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/set/exam-set`,
                { examSetName, examId, isAttempted },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam set created successfully");
            fetchExamSets(); // Refresh the list
        } catch (error) {
            console.log(error);
            toast.error("Failed to create exam set");
        }
    };

    const handleDeleteExamSet = async (setId: number) => {
        try {
            const token = Cookies.get("token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/set/delete-exam/${setId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam set deleted successfully");
            fetchExamSets(); // Refresh the list
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete exam set");
        }
    };

    const handleUpdateExamSet = async () => {
        try {
            const token = Cookies.get("token");
            console.log(editExamSet?.isAttempted);
            // console.log(editExamSet);
            
            await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/set/exam-set/${editExamSet?.setId}`,
                { examSetName: editExamSet?.examSetName, examId: editExamSet?.examId,isAttempted:editExamSet?.isAttempted },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam set updated successfully");
            fetchExamSets(); // Refresh the list
        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam set");
        }
    };

    useEffect(() => {
        if (examId) fetchExamSets();
    }, [examId]);

    return (
        <>
            <Header />
            <div className="container mx-auto p-4  my-16">
                <ToastContainer />
                <h1 className="text-2xl font-bold mb-4">Exam Sets for Exam ID: {examId}</h1>

                {/* Create Exam Set Form */}
                <div className="exams__forms flex space-x-6">
                    {/* Left Form (50% width) */}
                    <div className="w-1/2">
                        <div className="mb-4">
                            <label htmlFor="examSetName" className="block text-sm font-medium text-gray-700">
                                Exam Set Name
                            </label>
                            <input
                                id="examSetName"
                                type="text"
                                value={examSetName}
                                onChange={(e) => setExamSetName(e.target.value)}
                                placeholder="Enter exam set name"
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="isAttempted" className="block text-sm font-medium text-gray-700">
                                Attempted
                            </label>
                            <select
                                id="isAttempted"
                                value={isAttempted ? "Yes" : "No"}
                                onChange={(e) => setIsAttempted(e.target.value === "Yes")}
                                className="border p-2 rounded w-full"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={handleCreateExamSet}
                                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                            >
                                Create Exam Set
                            </button>
                        </div>
                    </div>

                    {/* Right Form (50% width) */}
                    {editExamSet && (
                        <div className="w-1/2 p-4 bg-gray-100 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Edit Exam</h2>
                            <div className="mb-4">
                                <label htmlFor="editExamSetName" className="block text-sm font-medium text-gray-700">
                                    Exam Set Name
                                </label>
                                <input
                                    id="editExamSetName"
                                    type="text"
                                    value={editExamSet.examSetName}
                                    onChange={(e) => setEditExamSet({ ...editExamSet, examSetName: e.target.value })}
                                    className="border px-3 py-2 w-full mb-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="isAttempted" className="block text-sm font-medium text-gray-700">
                                    Attempted
                                </label>
                                <select
                                    id="isAttempted"
                                    value={editExamSet.isAttempted ? "Yes" : "No"}
                                    onChange={(e) => setEditExamSet({
                                        ...editExamSet,
                                        isAttempted: e.target.value === "Yes" // Convert string to boolean
                                    })}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>



                            <div className="mb-4">
                                <button
                                    onClick={handleUpdateExamSet}
                                    className="bg-green-500 text-white px-4 py-2 rounded w-full"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>



                {loading ? (
                    <p className="text-center text-xl font-semibold">Loading...</p>
                ) : (
                    <div className="users__table">
                        <table className="w-full border users__table-data">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="border px-4 py-2">Set ID</th>
                                    <th className="border px-4 py-2">Set Name</th>
                                    <th className="border px-4 py-2">Created At</th>
                                    <th className="border px-4 py-2">Is Attempted</th>
                                    <th className="border px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examSets
                                    .slice(currentPage * 5, (currentPage + 1) * 5)
                                    .map((set) => (
                                        <tr key={set.setId} className="hover:bg-gray-100">
                                            <td className="border px-4 py-2">{set.setId}</td>
                                            <td
                                                className="border px-4 py-2 text-blue-500 cursor-pointer"
                                                onClick={() => router.push(`/exams/${examId}/${set.setId}`)}
                                            >
                                                {set.examSetName}
                                            </td>

                                            <td className="border px-4 py-2">{set.createdAt}</td>
                                            <td className="border px-4 py-2">{set.isAttempted ? "Yes" : "No"}</td>
                                            <td className="border px-4 py-2">
                                                <button
                                                    onClick={() => setEditExamSet(set)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExamSet(set.setId)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
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

                    </div>
                )}
            </div>
        </>
    );
}
