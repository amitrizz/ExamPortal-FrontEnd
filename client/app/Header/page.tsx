"use client"
import Link from "next/link";
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";
import React from "react"
import Image from "next/image";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Header() {
    const router = useRouter();

    const [userRole, setUserRole] = useState<string>("USER");

    const fetchUserDetails = async () => {
        try {
           
            const token = Cookies.get("token");
            if (!token) {
                return;
            }

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the Authorization header
                    },
                }
            );

            console.log(res.data.role);
            setUserRole(res.data.role);

        } catch (error) {

            console.log(error);

        }
    };

    useEffect(() => {

        fetchUserDetails(); // Call the async function

    }, []); // Depend on blog so it runs when b

    const logout = () => {
        // Remove the token
        Cookies.remove('token', { path: '/' });
        router.push("/login")
    }

    return (
        <header className="text-white py-2 navbar">
            <div className="container mx-auto flex justify-between items-center p-4 pl-10 pr-10">
                {/* Logo */}
                <div>
                    <Link href="/" className="text-white text-2xl font-semibold flex items-center justify-center">
                        <div className="mx-1">Exam Portal</div>

                        <Image
                            style={{ width: "60px" }}
                            aria-hidden
                            src="/logo5.png"
                            alt="Globe icon"
                            width={60}
                            height={20}
                        />


                    </Link>
                </div>

                {/* Authentication Links */}
                <div>
                    <nav className="flex space-x-6">

                        {userRole == "ADMIN" && <Link href="/users" className="text-white hover:text-yellow-300">
                            Users
                        </Link>}
                        {userRole == "ADMIN" && <Link href="/exams" className="text-white hover:text-yellow-300">
                            Exams
                        </Link>}


                        <Link href="/mock-test" className="text-white hover:text-yellow-300">
                            Start Test
                        </Link>
                        <Link href="/profile" className="text-white hover:text-yellow-300">
                            Profile
                        </Link>
                        <button
                            onClick={logout}
                            className="px-4 text-white bg-transparent rounded hover:bg-transparent-600 focus:outline-none focus:ring-2 hover:text-yellow-300"
                        >
                            Logout
                        </button>
                    </nav>

                </div>
            </div>
            <ToastContainer />
        </header>
    );
}
