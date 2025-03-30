"use client"
import React, { useEffect, useState } from "react"
import axios, { AxiosError } from "axios"
import Cookies from 'js-cookie';
import Header from "../Header/page"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type User = {
    firstName: string;
    lastName: string;
    username: string;
    id: number;
};



export default function MakeAppointment() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = React.useState("USER");
    const [currentUsername, setCurrentUsername] = React.useState("");

    const loadCurrentUser = async () => {
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
            setCurrentUserRole(res.data.role);
            setCurrentUsername(res.data.username);
            // setUsers(res.data.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || 'Failed To Extract');
            } else {
                toast.error('An unexpected error occurred!');
            }
        } finally {
            setLoading(false);
        }
    };
    const fetchUsers = async (page: number, query: string = "") => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const url = query
                ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/search?name=${query}&page=${page}&size=15`
                : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/all-user?page=${page}&size=15`;

            const response = await axios.get(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the Authorization header
                    },
                }
            );
            // console.log(response.data?.content);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers(currentPage, searchQuery);
    }, [currentPage, searchQuery]);


    useEffect(() => {
        console.log("Updated users:", users);
    }, [users]);

    useEffect(() => {
        loadCurrentUser(); // Call the async function
    }, []); // Depend on blog so it runs when b
    // Delete User
    const deleteUser = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const token = Cookies.get("token");
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin/delete?userid=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the Authorization header
                    },
                });
            alert("User deleted successfully!");
            fetchUsers(currentPage, searchQuery); // Refresh users list
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    return (
        <>
            <Header />
            <div className="users my-16">
                {/* Search Bar */}

                <div className="users__container">
                    <div className="users__search">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(0); // Reset to first page when searching
                            }}
                        />
                    </div>
                    {loading ? (
                        <p className="text-center text-xl font-semibold">Loading...</p>
                    ) : (
                        <div className="users__table">
                            <table className="users__table-data" width="100%">
                                <thead className="users__table-data--heading">
                                    <tr className="users__table-data--row">
                                        <th>ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Username</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="users__table-data--body">
                                    {currentUserRole == "ADMIN" && users && users.map((user) => (

                                        <tr className="users__table-data--row" key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.username}</td>
                                            <td>
                                                <button disabled={user.username == currentUsername} onClick={() => deleteUser(user.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    )

                    }

                    {/* Pagination Controls */}
                    <div className="users__pagination">
                        <button className="users__pagination--prev"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </button>
                        <span> Page {currentPage + 1} of {totalPages} </span>
                        <button className="users__pagination--next"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>
        </>

    )
}