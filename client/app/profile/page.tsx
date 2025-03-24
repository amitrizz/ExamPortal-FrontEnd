"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import Cookies from 'js-cookie';
import Header from "../Header/page"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


type User = {
    firstName?: string;
    lastName?: string;
    username?: string;
};



export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isloading, setIsloading] = React.useState(false);

    const fetchUserDetails = async () => {
        try {
            setIsloading(true);
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
                username: res.data?.username
            });
            
            // console.log(res.data.user);
            // setUser(res.data.user)

        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || 'Login failed!');
            } else {
                toast.error('An unexpected error occurred!');
            }
        } finally {
            setIsloading(false);
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
    return (<>
        <Header />

        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
                <h1 className="text-2xl font-semibold text-center text-gray-800">Profile</h1>
                <br />
                <h1 className="text-2xl font-semibold text-center text-gray-800">{user?.firstName}</h1>
                <br />
                <h1 className="text-2xl font-semibold text-center text-gray-800">{user?.lastName}</h1>
                <br />
                <h1 className="text-2xl font-semibold text-center text-gray-800">{user?.username}</h1>
                <br />
                <button
                    onClick={logout}
                    className="w-full py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                    Logout
                </button>
            </div>
        </div>
        <ToastContainer />

    </>

    )
}