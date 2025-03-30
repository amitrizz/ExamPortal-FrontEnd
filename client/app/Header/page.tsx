"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>("USER");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const fetchUserDetails = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) return;

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUserRole(res.data.role);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const logout = () => {
        Cookies.remove("token", { path: "/" });
        router.push("/login");
    };

    return (
        <header className="bg-white text-black fixed w-full top-0 left-0 z-50 shadow-md">
            <div className="container mx-auto flex justify-between items-center px-10">
                {/* Logo Section */}
                <Link href="/" className="text-white text-2xl font-semibold flex items-center">
                    <div className="mr-2 text-black">Exam Portal</div>
                    <Image src="/logo5.png" alt="Globe icon" width={60} height={20} className="w-12" />
                </Link>

                {/* Hamburger Menu (Mobile) */}
                <button
                    className="md:hidden focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? "✖" : "☰"}
                </button>

                {/* Navigation Links */}
                <nav
                    className={`absolute md:static py-4 top-16 left-0 w-full md:w-auto bg-white md:bg-transparent md:flex space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left transition-all duration-300 ${isMenuOpen ? "block" : "hidden md:flex"
                        }`}
                >
                    {userRole === "ADMIN" && (
                        <>
                            <Link href="/users" className="block md:inline-block  p-2">Users</Link>
                            <Link href="/exams" className="block md:inline-block  p-2">Exams</Link>
                        </>
                    )}
                    <Link href="/mock-test" className="block md:inline-block p-2">Start Test</Link>
                    <Link href="/profile" className="block md:inline-block  p-2">Profile</Link>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-[#25cd71] hover:bg-blue-100 rounded text-white focus:outline-none transition"
                    >
                        Logout
                    </button>
                </nav>
            </div>
            <ToastContainer />
        </header>
    );
}
