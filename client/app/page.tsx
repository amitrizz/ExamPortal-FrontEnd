"use client"
import Header from "./Header/page";
import { useEffect } from "react";
import React from "react"
import axios from "axios"
import Cookies from 'js-cookie';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation"


export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const fetchUserDetails = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/login")
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/check-token`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to the Authorization header
          },
        }
      );

      console.log(res);

      console.log(res?.status);
      if (res?.status == 200) {
        setIsAuthenticated(true)
      }

      //console.log(res.data.user);
      // setUser(res.data.user)

    } catch (error) {
      Cookies.remove('token', { path: '/' });
      router.push("/login")
      console.log(error);

    } 
  };

  useEffect(() => {

    fetchUserDetails(); // Call the async function

  }, []); // Depend on blog so it runs when b
  return (
    <>
    {isAuthenticated && <Header />}

      <main className="bg-gray-50 min-h-screen py-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-400 to-indigo-200 text-white py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="header">

              <h1 className="text-4xl font-bold mb-6 type">
                Welcome to Exam Test Portal
              </h1>
            </div>
            <p className="text-xl mb-8">
              Practice makes perfect! Access 1000+ exams and boost your performance.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => router.replace(`/mock-test`)} className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start New Test
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 -mt-10">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-blue-600">1000+</h3>
            <p className="text-gray-600">Practice Tests</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-green-600">50+</h3>
            <p className="text-gray-600">Exam Categories</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-purple-600">24/7</h3>
            <p className="text-gray-600">Availability</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-red-600">10k+</h3>
            <p className="text-gray-600">Active Users</p>
          </div>
        </div>

        {/* Featured Exams */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Exam Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">CGL</h3>
                <p className="text-gray-600">200+ practice tests available</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">GATE</h3>
                <p className="text-gray-600">150+ practice tests available</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Banking</h3>
                <p className="text-gray-600">300+ coding challenges</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-2xl font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Exam</h3>
                <p className="text-gray-600">Select from various categories and difficulty levels</p>
              </div>
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-2xl font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Take the Test</h3>
                <p className="text-gray-600">Complete the exam in timed or practice mode</p>
              </div>
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-2xl font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Get Results</h3>
                <p className="text-gray-600">Detailed analysis with correct answers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Exam Portal</h3>
              <p className="text-gray-400">
                Your one-stop destination for online practice exams and skill assessment.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Exam Categories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-gray-400">Email: support@examportal.com</p>
              <p className="text-gray-400">Phone: (846) 892-3343</p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © 2024 Exam Test Portal. All rights reserved.
          </div>
        </footer>
      </main>
      <ToastContainer />
    </>
  );
}
