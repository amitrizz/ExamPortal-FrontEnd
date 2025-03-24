"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation"
import Header from "../Header/page";
// import "../"

interface Exam {
    examId: number;
    examName: string;
    price: number;
}
declare global {
    interface Window {
        Razorpay: any;
    }
}

type User = {
    firstName?: string;
    lastName?: string;
    username?: string;
    userId?: string

};

export default function GiveExamsPage() {
    const router = useRouter();
    const token = Cookies.get("token");
    const [exams, setExams] = useState<Exam[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [examAccessIds, setExamAccessIds] = useState<Number[]>([]);

    const [user, setUser] = useState<User | null>(null);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the Authorization header
                    },
                }
            );
            // console.log(res);
            setUser({
                firstName: res.data?.firstName,
                lastName: res.data?.lastName,
                username: res.data?.username,
                userId: res.data?.id
            });

        } catch (error) {
            console.log(error);
            toast.error('An unexpected error occurred!');

        } finally {
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/get/all-exams`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExams(res.data);
            setTotalPages(Math.ceil(res.data.length / 8));
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };

    const fetchExamsAccess = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/access/exams`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExamAccessIds(res.data);

        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };




    useEffect(() => {
        fetchUserDetails();
        fetchExams();
        fetchExamsAccess();
    }, []);

    useEffect(() => {
        // Dynamically load Razorpay checkout script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);



    const handlePayment = async (amount: number, examId: number) => {
        setLoading(true);
        try {
            // Step 1: Request an order from the backend
            // console.log(token);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/payment/create-order`,
                { "amount": amount, "examId": examId, "userId": user?.userId }, // Amount in rupees
                { headers: { Authorization: `Bearer ${token}` } } // Add authentication if needed
            );

            const { orderId } = res.data;

            // Step 2: Initialize Razorpay
            const options = {
                key: "rzp_test_9rFQmYIZaQ40mW", // Replace with your Razorpay Key
                amount: amount * 100, // Amount in paisa
                currency: "INR",
                name: "Test Portal",
                description: "Test Transaction",
                order_id: orderId, // Order ID from backend
                handler: async (response: any) => {
                    // Step 3: Verify payment with backend
                    const verifyRes = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/payment/verify-payment`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }, { headers: { Authorization: `Bearer ${token}` } });

                    console.log(verifyRes);

                    if (verifyRes.data.isValid) {
                        alert("Payment Successful!");
                        window.location.reload();
                    } else {
                        alert("Payment Failed!");
                    }
                },
                prefill: {
                    email: "user@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Failed to initiate payment.");
        }
        setLoading(false);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const filteredExams = exams
        .filter((exam) =>
            exam.examName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(currentPage * 8, (currentPage + 1) * 8);

    return (
        <>

            <Header />
            <div className="container mx-auto p-4">
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
                    <div className="exam__test">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-wrap justify-center gap-6">
                                {filteredExams && filteredExams.map((exam, index) => (


                                    <div key={index} className="w-full sm:w-[48%] md:w-[30%] lg:w-[22%]">
                                        <div className="bg-white rounded-[25px] w-full h-[300px] shadow-md hover:scale-105 transition-transform duration-300 ease-in-out">
                                            {/* Exam Image */}
                                            <div className="relative w-full h-[225px] rounded-t-[25px] flex justify-center items-center overflow-hidden" style={{ background: "#4c76e0" }}>
                                                <img
                                                    src={"https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/237/landscape/figma-1-logo.png"}
                                                    className="h-[120px] w-[130px] object-cover z-10 transition-transform duration-300 ease-in-out hover:scale-110"
                                                    alt={exam.examName}
                                                />
                                                <img
                                                    src={"https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/237/landscape/figma-1-logo.png"}
                                                    className="h-[120px] w-[130px] absolute filter blur-[19px] transition-transform duration-300 ease-in-out hover:scale-150"
                                                    alt=""
                                                />
                                            </div>

                                            {/* Exam Details */}
                                            <div className="p-4 text-center">
                                                <h4 className="font-ubuntu font-bold text-[14px] leading-[16px] text-black/75">
                                                    {exam.examName}
                                                </h4>

                                                {/* Conditional Rendering - Show Link or Pay Button */}
                                                {examAccessIds.includes(exam.examId) ? (
                                                    <button
                                                        onClick={() => router.replace(`/mock-test/${exam.examId}`)}
                                                        className="border px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition"
                                                    >

                                                        View Sets
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayment(exam.price, exam.examId)}
                                                        className="border px-4 py-2 rounded bg-red-500 text-white hover:bg-blue-700 transition"
                                                    >
                                                        Pay ₹{exam.price}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    // <div key={exam.examId} className="card">
                                    //     <div>Exam Name : {exam.examName}</div>
                                    //     <div>Exam Price : {exam.price}</div>
                                    //     <button onClick={() => handlePayment(exam.price, exam.examId)} className="border px-4 py-2"> Pay</button>
                                    // </div>
                                ))}
                            </div>
                        </div>
                        {/* Pagination Controls */}
                        < div className="flex justify-between mt-4" >
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
