"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation"
import Header from "../Header/page";

interface Exam {
    examId: number;
    examName: string;
    price: number;
    examCategory: Record<string, string>;
}

export default function ExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [newExam, setNewExam] = useState<{
        examName: string;
        price: number;
        examCategory: Record<string, string>; // Define as a record of string keys and string values
    }>({
        examName: '',
        price: 0,
        examCategory: {},  // Now this is explicitly a record, not just an empty object
    });
    const [editExam, setEditExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchExams = useCallback(async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/get/all-exams`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExams(res.data);
            setTotalPages(Math.ceil(res.data.length / 5));
        } catch (error) {
            console.log(error);

            toast.error("Failed to fetch exams");
            router.replace("/login")
        } finally {
            setLoading(false);
        }
    },[])


    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const handleCreateExam = async () => {
        try {
            if (!newExam.examName.trim()) return toast.error("Exam name is required");
            const token = Cookies.get("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/create-exam`,
                newExam,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewExam({ examName: "", price: 0, examCategory: {} });
            toast.success("Exam created successfully!");
            fetchExams();
        } catch (error) {
            console.log(error);
            toast.error("Failed to create exam");
        }
    };

    const handleCustomFieldChangeCreate = (key: string, value: string) => {
        setNewExam(prev => ({
            ...prev,
            examCategory: {
                ...prev.examCategory,  // Now TypeScript knows this is a Record<string, string>
                [key]: value
            }
        }));
    };


    const handleRemoveCustomFieldCreate = (key: string) => {
        setNewExam(prev => {
            const updatedFields = { ...(prev.examCategory as Record<string, string> || {}) };
            delete updatedFields[key]; // Remove the key from the object
            return { ...prev, examCategory: updatedFields };
        });
    };


    const handleUpdateExam = async () => {
        if (!editExam) return;
        try {
            const token = Cookies.get("token");
            await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/update-exam/${editExam.examId}`,
                editExam,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam updated successfully!");
            setEditExam(null);
            fetchExams();
        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam");
        }
    };


    const handleCustomFieldChange = (key: string, value: string) => {
        setEditExam(prev => {
            if (!prev) return null; // Ensure prev is not null

            return {
                ...prev,
                examCategory: {
                    ...prev.examCategory,
                    [key]: value // Update or add the key-value pair
                }
            };
        });
    };


    const handleRemoveCustomField = (key: string) => {
        setEditExam(prev => {
            if (!prev) return prev; // Ensure prev is not null

            const updatedFields = { ...(prev.examCategory as Record<string, string> || {}) };
            delete updatedFields[key]; // Remove the key from the object

            return {
                ...prev,
                examCategory: updatedFields
            } as Exam;
        });
    };





    const handleDeleteExam = async (id: number) => {
        try {
            const token = Cookies.get("token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/delete-exam/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Exam deleted successfully!");
            fetchExams();
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete exam");
        }
    };

    const filteredExams = exams
        .filter((exam) =>
            exam.examName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(currentPage * 5, (currentPage + 1) * 5);

    return (
        <>

            <Header />
            <div className="container mx-auto p-4  my-16">
                <ToastContainer />
                <h1 className="text-2xl font-bold mb-4">Exams</h1>

                <input
                    type="text"
                    placeholder="Search exams..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="border px-3 py-2 w-full mb-4"
                />

                {loading ? (
                    <p className="text-center text-xl font-semibold">Loading...</p>
                ) : (
                    <div className="users__table">
                        <table className="w-full border users__table-data">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="border px-4 py-2">ID</th>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Price</th>
                                    <th className="border px-4 py-2">Actions</th>
                                    <th className="border px-4 py-2">Categories</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.map((exam) => (
                                    <tr key={exam.examId} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2">{exam.examId}</td>
                                        <td
                                            className="border px-4 py-2 text-blue-500 cursor-pointer"
                                            onClick={() => router.push(`/exams/${exam.examId}`)}
                                        >
                                            {exam.examName}
                                        </td>
                                        {/* <td className="border px-4 py-2">{exam.examId}</td> */}
                                        <td className="border px-4 py-2">{exam.price}</td>
                                        <td className="border px-4 py-2">
                                            <button
                                                onClick={() => setEditExam(exam)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExam(exam.examId)}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                        <td className="border px-4 py-2">
                                            {Object.entries(exam.examCategory)
                                                .map(([key, value]) => `${key}: ${value} Mins`)
                                                .join(", ")}
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

                {editExam && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Edit Exam</h2>

                        {/* Exam Name */}
                        <input
                            type="text"
                            value={editExam.examName}
                            onChange={(e) => setEditExam({ ...editExam, examName: e.target.value })}
                            className="border px-3 py-2 w-full mb-2"
                            placeholder="Exam Name"
                        />

                        {/* Exam Price */}
                        <input
                            type="number"
                            value={editExam.price}
                            onChange={(e) => setEditExam({ ...editExam, price: Number(e.target.value) })}
                            className="border px-3 py-2 w-full mb-2"
                            placeholder="Exam Price"
                        />

                        {/* Dynamic Key-Value Fields */}
                        {Object.entries(editExam.examCategory).map(([key, value], index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => {
                                        const newKey = e.target.value;
                                        const newValue = editExam.examCategory[key];
                                        handleRemoveCustomField(key);
                                        handleCustomFieldChange(newKey, newValue);
                                    }}
                                    className="border px-3 py-2 w-1/2"
                                    placeholder="Enter Exam Category"
                                    required
                                />
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                    className="border px-3 py-2 w-1/2"
                                    placeholder="Enter Time in Minutes"
                                    required
                                />
                                <button
                                    onClick={() => handleRemoveCustomField(key)}
                                    className="bg-red-500 text-white px-3 py-2 rounded"
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        {/* Add Key-Value Pair Button */}
                        <button
                            onClick={() => handleCustomFieldChange("", "")}
                            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
                        >
                            + Add Category
                        </button>

                        {/* Save Button */}
                        <button onClick={handleUpdateExam} className="bg-green-500 text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                )}

                {/* Create Exam Form */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Create New Exam</h2>
                    <input
                        type="text"
                        placeholder="Exam Name"
                        value={newExam.examName}
                        onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                        className="border px-3 py-2 w-full mb-2"
                    />
                    <input
                        type="number"
                        placeholder="Exam Price"
                        value={newExam.price}
                        onChange={(e) => setNewExam({ ...newExam, price: Number(e.target.value) })}
                        className="border px-3 py-2 w-full mb-2"
                    />
                    {/* Dynamic Key-Value Fields for Creating Exam */}
                    {Object.entries(newExam.examCategory).map(([key, value], index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={key}
                                onChange={(e) => {
                                    const newKey = e.target.value;
                                    const newValue = newExam.examCategory[key];
                                    handleRemoveCustomFieldCreate(key);
                                    handleCustomFieldChangeCreate(newKey, newValue);
                                }}
                                className="border px-3 py-2 w-1/2"
                                placeholder="Enter Exam Category"
                            />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleCustomFieldChangeCreate(key, e.target.value)}
                                className="border px-3 py-2 w-1/2"
                                placeholder="Enter Time in Minutes"
                            />
                            <button
                                onClick={() => handleRemoveCustomFieldCreate(key)}
                                className="bg-red-500 text-white px-3 py-2 rounded"
                            >
                                X
                            </button>
                        </div>
                    ))}

                    {/* Add Key-Value Pair Button */}
                    <button
                        onClick={() => handleCustomFieldChangeCreate("", "")}
                        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
                    >
                        + Add Category
                    </button>

                    <button
                        onClick={handleCreateExam}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Create Exam
                    </button>
                </div>
            </div>
        </>
    );
}
