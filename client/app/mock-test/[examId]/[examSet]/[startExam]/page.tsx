"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/app/globals.css"

const toggleCss = ["test__body--toggle-details-answered",
    "test__body--toggle-details-no-answered",
    "test__body--toggle-details-not-visit",
    "test__body--toggle-details-review",
    "test__body--toggle-details-answered-review",
    "test__body--toggle-details-current-question"
]

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    category: string;
    examSetId: number;
    imageUrl: string;
    beforeImage: string;
    afterImage: string;
    info: boolean;
    multiQuestion: boolean;
    multiQuestionValue: number;
    userAnswer: string;
    isNotVisited: boolean;
    isReviewed: boolean;
    isAnswerReviewed: boolean;
    isAnswered: boolean;
    buttonCss: string;
}


const defaultQuestion: Question = {
    id: 0,
    question: "",
    options: [],
    answer: "",
    category: "",
    examSetId: 0,
    imageUrl: "",
    beforeImage: "",
    afterImage: "",
    info: false,
    multiQuestion: false,
    multiQuestionValue: 0,
    userAnswer: "",
    isNotVisited: true,
    isReviewed: false,
    isAnswerReviewed: false,
    isAnswered: false,
    buttonCss: toggleCss[2],
};

interface toggleValues {
    answered: number,
    noAnswered: number,
    noVisited: number,
    reviewed: number,
    ansReviewed: number
}

const defaultToggleValues: toggleValues = {
    answered: 0,
    noAnswered: 0,
    noVisited: 0,
    reviewed: 0,
    ansReviewed: 0
}

export default function StartExamPage({ params }: { params: Promise<{ examId: number, examSet: number, startExam: string }> }) {
    const router = useRouter();
    const [examId, setExamId] = useState<number | null>(null);
    const [examSetId, setExamSetId] = useState<number | null>(null);
    const [examSetQuestions, setExamSetQuestions] = useState<Question[]>([]);
    const [hasAccess, setHasAccess] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);


    const [toggleValues, setToggleValues] = useState(defaultToggleValues);

    const [category, setCategory] = useState("");
    const [selectedAnswer, setSelectedAnswer] = useState<string>(""); // ✅ Track selected answer

    const [categories, setCategories] = useState({});

    const [timer, setTimer] = useState<string>('00:00'); // Start timer in MM:SS format
    const [examName, setExamName] = useState<string>('00:00'); // Start timer in MM:SS format

    const [isFullScreen, setIsFullScreen] = useState(false);

    const examSetQuestionsRef = useRef<Question[]>([]);

    // Update the ref whenever examSetQuestions changes
    useEffect(() => {
        examSetQuestionsRef.current = examSetQuestions;
    }, [examSetQuestions]);


    // Full-Screen API methods
    const enterFullScreen = () => {
        const element = document.documentElement;

        if (element.requestFullscreen) {
            element.requestFullscreen(); // Standard method
        }

        setIsFullScreen(true);
    };

    const exitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen(); // Standard exit
        }

        setIsFullScreen(false);
    };

    const updateToggleCount = () => {
        const visitedCount = examSetQuestions.filter((question) => question.isNotVisited && !question.isReviewed && !question.isAnswered && !question.isAnswerReviewed).length;

        const answeredCount = examSetQuestions.filter((question) => question.isAnswered).length;

        const noAnsweredCount = examSetQuestions.filter((question) => !question.isAnswered && !question.isNotVisited && !question.isReviewed && !question.isAnswerReviewed).length;

        const reviewedCount = examSetQuestions.filter((question) => question.isReviewed).length;

        const ansReviewedCount = examSetQuestions.filter((question) => question.isAnswerReviewed).length;

        // console.log(visitedCount, ansReviewedCount, answeredCount, reviewedCount, noAnsweredCount);


        setToggleValues((pre) => ({ ...pre, noVisited: visitedCount, answered: answeredCount, noAnswered: noAnsweredCount, reviewed: reviewedCount, ansReviewed: ansReviewedCount }));

    }

    useEffect(() => {
        if (examSetQuestions) updateToggleCount();
    }, [examSetQuestions])



    const handleSaveAndNext = () => {
        console.log(examSetQuestions);

        if (selectedAnswer == "" && examSetQuestions[currentQuestion].userAnswer.length > 0) {
            setExamSetQuestions((prevQuestions) =>
                prevQuestions.map((q, index) =>
                    index === currentQuestion
                        ? { ...q, isAnswered: true, isNotVisited: false, isAnswerReviewed: false, isReviewed: false }
                        : q
                )
            );
            if (currentQuestion <= examSetQuestions.length - 1) {
                if (currentQuestion == examSetQuestions.length - 1) {
                    setCurrentQuestion(0);
                } else {

                    setCurrentQuestion((prev) => prev + 1);
                }
            }
            setSelectedAnswer(""); // ✅ Reset selected answer for the next question

            return;
        }
        if (selectedAnswer !== examSetQuestions[currentQuestion].userAnswer) {
            setSelectedAnswer(examSetQuestions[currentQuestion].userAnswer)

            setExamSetQuestions((prevQuestions) =>
                prevQuestions.map((q, index) =>
                    index === currentQuestion
                        ? { ...q, userAnswer: selectedAnswer, isAnswered: true, isNotVisited: false, isAnswerReviewed: false, isReviewed: false }
                        : q
                )
            );
        }
        if (selectedAnswer == "") {
            // console.log("empty Answer");

            setExamSetQuestions((prevQuestions) =>
                prevQuestions.map((q, index) =>
                    index === currentQuestion
                        ? { ...q, userAnswer: "", isNotVisited: false, isAnswerReviewed: false, isReviewed: false }
                        : q
                )
            );
        }

        // Move to next question
        if (currentQuestion <= examSetQuestions.length - 1) {
            // handleSetCurrentQuestion(1 + currentQuestion);
            if (currentQuestion == examSetQuestions.length - 1) {
                setCurrentQuestion(0);
            } else {

                setCurrentQuestion((prev) => prev + 1);
            }
            setSelectedAnswer(""); // ✅ Reset selected answer for the next question
        }
    };



    const handleSetCurrentQuestion = (idx: number) => {

        setExamSetQuestions((prevQuestions) =>
            prevQuestions.map((q, index) =>
                index === idx
                    ? { ...q, isNotVisited: false, isAnswered: q.userAnswer.length > 0 ? true : q.isAnswered } // Ensure `isNotVisited` is set to `false`
                    : q
            )
        );
        setExamSetQuestions((currentQuestions) =>
            currentQuestions.map((q, index) =>
                index === currentQuestion
                    ? { ...q, isNotVisited: false, isAnswered: q.userAnswer.length > 0 ? true : q.isAnswered } // Ensure `isNotVisited` is set to `false`
                    : q
            )
        );
        setCurrentQuestion(idx);
    };


    const handleMarkForReview = () => {

        if (selectedAnswer.length > 0 || examSetQuestions[currentQuestion].userAnswer.length > 0) {
            if (selectedAnswer == "") {
                setExamSetQuestions((prevQuestions) =>
                    prevQuestions.map((q, index) =>
                        index === currentQuestion
                            ? { ...q, userAnswer: examSetQuestions[currentQuestion].userAnswer, isAnswerReviewed: true, isAnswered: false }
                            : q
                    )
                );
            } else {
                setExamSetQuestions((prevQuestions) =>
                    prevQuestions.map((q, index) =>
                        index === currentQuestion
                            ? { ...q, userAnswer: selectedAnswer, isAnswerReviewed: true, isAnswered: false }
                            : q
                    )
                );

            }


        } else {
            setExamSetQuestions((prevQuestions) =>
                prevQuestions.map((q, index) =>
                    index === currentQuestion
                        ? { ...q, userAnswer: "", isReviewed: true, isAnswered: false }
                        : q
                )
            );
        }
        // Move to next question
        if (currentQuestion <= examSetQuestions.length - 1) {
            if (currentQuestion == examSetQuestions.length - 1) {
                setCurrentQuestion(0);
            } else {

                setCurrentQuestion((prev) => prev + 1);
            }
            setSelectedAnswer(""); // ✅ Reset selected answer for the next question
        }
    };


    const handleClearResponse = () => {
        setExamSetQuestions((prevQuestions) =>
            prevQuestions.map((q, index) =>
                index === currentQuestion
                    ? { ...q, userAnswer: "", isAnswered: false }
                    : q
            )
        );

        setSelectedAnswer("");// ✅ Reset selected answer for the next question
    };


    const handleSubmitSection = async (cat: string) => {
        try {
            const token = Cookies.get("token");

            // Use the ref to get the latest questions
            const questionsToSubmit = examSetQuestionsRef.current;
            console.log(token);
            // Remove specific fields from each object in the array
            const cleanedData = questionsToSubmit.map(
                ({ id, ...rest }) => ({
                    ...rest,        // Keep remaining properties
                    category: cat,  // Add/modify category
                    questionId: id  // Rename 'id' to 'questionId'
                })
            );


            console.log(cleanedData);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/create-question`,
                cleanedData,  // ✅ Send the array directly
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(res.data);

            toast.success("Section submitted!");
        } catch (error) {
            console.log(error);

            toast.error("Submission failed");
        }
    };








    // Unwrap `params`
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamId(resolvedParams.examId);
            setExamSetId(resolvedParams.examSet);
        });
    }, [params]);

    // Fetch Exam Sets
    useEffect(() => {
        if (examId) fetchExamsAccess();
    }, [examId]);




    // Replace forceNext state with a ref
    const forceNextRef = useRef(false);
    const currentResolver = useRef<(() => void) | null>(null);

    // Add state for tracking current category index
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const intervalIds: NodeJS.Timeout[] = [];
        const categoryEntries = Object.entries(categories);

        const processCurrentCategory = async () => {
            if (!isMounted || currentCategoryIndex >= categoryEntries.length) return;

            const [key, value] = categoryEntries[currentCategoryIndex];
            setCategory(key);

            // Fetch questions for current category
            await fetchExamSetQuestionsForCategory(key);

            let finalSeconds = Number(value) * 60;

            await new Promise<void>((resolve) => {
                currentResolver.current = () => {
                    if (!isMounted) return;
                    finalSeconds = 0;
                    setTimer(formatTime(0));
                    resolve();
                };

                const intervalId = setInterval(() => {
                    if (!isMounted) return;

                    if (forceNextRef.current) {
                        // handleSubmitSection(key);
                        console.log("user submit");

                        forceNextRef.current = false;
                        finalSeconds = 0;
                        setTimer(formatTime(0));
                    }

                    if (finalSeconds > 0) {
                        finalSeconds--;
                        setTimer(formatTime(finalSeconds));
                    } else {
                        // Timer expired - submit but don't proceed
                        handleSubmitSection(key);
                        console.log(`Timer expired for ${key}`);
                        clearInterval(intervalId);
                        resolve();
                    }
                }, 1000);

                intervalIds.push(intervalId);
            });

            // Don't auto-proceed even when timer ends
            if (isMounted) {
                handleNextCategory();
                console.log(`Finished processing ${key}, waiting for user action`);
            }
        };

        processCurrentCategory();

        return () => {
            isMounted = false;
            intervalIds.forEach(clearInterval);
            currentResolver.current = null;
        };
    }, [currentCategoryIndex, categories]);

    // Modified handleNextCategory
    const handleNextCategory = () => {
        if (currentResolver.current) {
            // Call handleSubmitSection before resolving the current timer
            const [key] = Object.entries(categories)[currentCategoryIndex];
            handleSubmitSection(key);  // <-- Ensure submission before moving to the next section

            currentResolver.current();
            currentResolver.current = null;
        }

        // Explicitly move to the next category or finish
        if (currentCategoryIndex < Object.entries(categories).length - 1) {
            setCurrentCategoryIndex(prev => prev + 1);
        } else {
            alert("Thank You for Giving Assessment");
            router.replace(`/result/${examSetId}`);
        }
    };


    // Helper function to format seconds to MM:SS
    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };



    const fetchExamSetQuestionsForCategory = async (category: string) => {
        try {

            const token = Cookies.get("token");
            // console.log(token);
            setCurrentQuestion(0);
            setQuestionsCount(0);
            // console.log("Has Access");
            const fetchQuestion = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/exam/set/question/sets/${examSetId}/${category}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // console.log(fetchQuestion.data);

            //Ensure correct data extraction
            const data: Question[] = Array.isArray(fetchQuestion.data)
                ? fetchQuestion.data.map((q) => (typeof q === "object" && q !== null ? { ...defaultQuestion, ...q } : defaultQuestion))
                : [];

            setExamSetQuestions(data);
            setQuestionsCount(data.length);
            examSetQuestionsRef.current = data;
            setToggleValues((prev) => ({ ...prev, noVisited: data.length }));

        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exam sets");
        }
    };

    const fetchExamCategories = async () => {
        try {
            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/get/by-id/${examId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // toast.success("Exam Categories Fetch successfully");
            console.log(res.data);
            setExamName(res.data.examName);

            setCategories(res.data.examCategory);

        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam set");
        }
    };



    const fetchExamsAccess = async () => {
        try {

            const token = Cookies.get("token");
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/exam/access/exams`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data, examId);
            if (res.data.includes(Number(examId))) {
                setHasAccess(true);
                fetchExamCategories();
            } else {
                router.push("/mock-test")
            }


        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch exams");
        }
    };


    const getThisButtonCss = (idx: number) => {
        if (idx === currentQuestion) {
            return toggleCss[5]; // Current question CSS
        }
        if (examSetQuestions[idx]?.isAnswered) {
            return toggleCss[0]; // Answered CSS
        }
        if (examSetQuestions[idx]?.isAnswerReviewed) {
            return toggleCss[4]; // Answered & Reviewed CSS
        }
        if (examSetQuestions[idx]?.isReviewed) {
            return toggleCss[3]; // Marked for Review CSS
        }
        if (examSetQuestions[idx]?.isNotVisited) {
            return toggleCss[2]; // Not Answered CSS
        }
        return toggleCss[1]; // Not Visited (Default)
    };

    // code for start exam and timer for each category

    return (
        <>
            {/* <Header /> */}
            <div className="container">
                <ToastContainer />
                {
                    hasAccess &&
                    <div className="test__portal">
                        <div className="test__heading">
                            <div className="test__heading--title">{examName}</div>
                            <div className="test__heading--timer">Time Left : {timer}
                            </div>
                            <button
                                onClick={isFullScreen ? exitFullScreen : enterFullScreen}
                                style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
                            >
                                {isFullScreen ? "Exit Full-Screen" : "Enter Full-Screen"}
                            </button>
                        </div>
                        <div className="test__body">
                            <div className="test__body--content">
                                <div className="test__body--content-category">{category}</div>
                                <div className="test__body--question-details">
                                    <div className="test__body--question-count">Question {currentQuestion + 1}</div>
                                    <div className="test__body--question-scheme"> Question Mark x (✅ +1 || ❌ -0.25)</div>
                                </div>
                                <div className="test__body--question-data">

                                    {questionsCount > 0 && examSetQuestions[currentQuestion].info &&
                                        <div className="test__body--question-info">

                                            <div className="test__body--question-info-beforeImage">
                                                {examSetQuestions[currentQuestion].beforeImage}
                                            </div>
                                            {
                                                examSetQuestions[currentQuestion].imageUrl &&
                                                <div className="test__body--question-info-image">
                                                    <img src={examSetQuestions[currentQuestion].imageUrl} alt="" />
                                                </div>
                                            }

                                            <div className="test__body--question-info-afterImage">
                                                {examSetQuestions[currentQuestion].afterImage}
                                            </div>

                                        </div>
                                    }

                                    <div className="test__body--question">
                                        <div className="test__body--question-name"> {questionsCount > 0 && examSetQuestions[currentQuestion].question}</div>
                                        <div className="test__body--question-option">
                                            {examSetQuestions[currentQuestion]?.options.map((option, index) => (
                                                <div key={index}>
                                                    <label className="option-label">
                                                        <input
                                                            type="radio"
                                                            name={`question-${currentQuestion}`}
                                                            value={option}
                                                            checked={selectedAnswer === option || examSetQuestions[currentQuestion]?.userAnswer === option} // ✅ Show selection immediately
                                                            onChange={() => setSelectedAnswer(option)} // ✅ Update temporary selection
                                                        />
                                                        {option}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                </div>

                                <div className="test__body--button">
                                    <div className="test__body--button-review-clear">
                                        <button onClick={handleMarkForReview}>Mark for Review & Next</button>
                                        <button onClick={handleClearResponse}>Clear Response</button>
                                    </div>
                                    <div className="test__body--button-save">
                                        <button onClick={handleSaveAndNext}>Save & Next</button>
                                    </div>
                                </div>
                            </div>
                            <div className="test__body--toggle">
                                <div className="test__body--toggle-details">
                                    <div ><span className={toggleCss[0]}>{toggleValues.answered}</span> Answered</div>
                                    <div><span className={toggleCss[1]}>{toggleValues.noAnswered}</span>Not Answered</div>
                                    <div><span className={toggleCss[2]}>{toggleValues.noVisited}</span> Not Visited</div>
                                    <div><span className={toggleCss[3]}>{toggleValues.reviewed}</span> Marked for Review</div>
                                    <div style={{ width: "100%" }}><span className={toggleCss[4]}>{toggleValues.ansReviewed}</span>Answered & Marked for Review</div>
                                </div>
                                <div className="test__body--toggle-category">Topic Category</div>
                                <div className="test__body--toggle-list">
                                    {
                                        questionsCount > 0 && [...Array(questionsCount)].map((_, i) =>
                                            <button key={i} className={getThisButtonCss(i)} onClick={() => handleSetCurrentQuestion(i)}>
                                                {i + 1}
                                            </button>

                                        )

                                    }




                                </div>
                                <div className="test__body--toggle-submit">
                                    <button
                                        onClick={handleNextCategory}
                                        className="bg-green-500 text-white p-2 rounded"
                                    >
                                        Submit Section
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                }


            </div>
        </>
    );
}
