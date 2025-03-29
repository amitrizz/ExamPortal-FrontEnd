"use client"
import Link from "next/link"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        role: ""
    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [isloading, setIsloading] = React.useState(false);

    const onSignup = async () => {
        try {
            setIsloading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/register`, user);
            Cookies.set('token', res.data.token, { expires: 1, path: '/' }); // Expires in 1 day
            router.push("/");

        } catch (error) {
            // Show error notification if something went wrong
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || 'Login failed!');
            } else {
                toast.error('An unexpected error occurred!');
            }

        } finally {
            setIsloading(false);
        }
    }

    useEffect(() => {
        if (user.username.length > 0 && user.firstName.length > 0 && user.lastName.length > 0 && user.role.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user])
    return (
        <div>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
                    <h1 className="text-2xl font-semibold text-center text-gray-800">
                        {isloading ? "Processing" : "Signup"}
                    </h1>
                    <br />

                    {/* FirstName Field */}
                    <div className="mt-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            FirstName
                        </label>
                        <input
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            type="text"
                            name="name"
                            id="firstName"
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            placeholder="First Name"
                        />
                    </div>
                    {/* LastName Field */}
                    <div className="mt-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            LastName
                        </label>
                        <input
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            type="text"
                            name="name"
                            id="lastName"
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            placeholder="Last Name"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="mt-4">
                        <label htmlFor="Username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            type="text"
                            name="username"
                            id="username"
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            placeholder="Email or Unique UserName if you don't Forget"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            type="password"
                            name="password"
                            id="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            placeholder="Password"
                        />
                    </div>

                    {/* Role Dropdown */}
                    <div className="mt-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                            name="role"
                            id="role"
                            value={user.role}
                            onChange={(e) => setUser({ ...user, role: e.target.value })}
                        >
                            <option value="" disabled>
                                Select Role
                            </option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="USER">USER</option>
                        </select>
                    </div>

                    {/* Signup Button */}
                    <button
                        disabled={buttonDisabled}
                        className={`w-full py-2 mt-6 text-white rounded-lg ${buttonDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        onClick={onSignup}
                    >
                        Signup
                    </button>

                    {/* Login Link */}
                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-blue-500 hover:underline">
                            Click To Login Here
                        </Link>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}