"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/Header/page";
import "@/app/globals.css"

const toggleCss = ["test__body--toggle-details-answered",
    "test__body--toggle-details-no-answered",
    "test__body--toggle-details-not-visit",
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
    questionMarks: number,

    result: {
        questionMarks: number
        userAnswer: string

    }
}
interface Result {
    category: string
    examSetId: number;
    id: number
    questionId: number
    questionMarks: number
    userAnswer: string
}

interface toggleValues {
    answered: number,
    noAnswered: number,
    noVisited: number,
}

export default function StartExamPage({ params }: { params: Promise<{ setId: number, viewPaper: string }> }) {
    // const router = useRouter();
    const [examSetId, setExamSetId] = useState<number | null>(null);
    const [examSetQuestions, setExamSetQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [toggleCount, setToggleCount] = useState<toggleValues>({ answered: 0, noAnswered: 0, noVisited: 0 });


    const [categories, setCategories] = useState([]);


    const handleSetCurrentQuestion = (idx: number) => {
        setCurrentQuestion(idx);
    };

    useEffect(() => {
        console.log(categories);
    }, [categories])



    // Unwrap `params`
    useEffect(() => {
        params.then((resolvedParams) => {
            setExamSetId(resolvedParams.setId);
        });
    }, [params]);


    const fetchExamSetQuestionsForCategory = async (category: string) => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            // console.log(token);
            setCurrentQuestion(0);
            setQuestionsCount(0);
            // console.log("Has Access");
            const fetchQuestion = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/exam/set/question/sets/${examSetId}/${category}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const fetchResult = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/category/${examSetId}/${category}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // console.log(fetchQuestion.data)
            if (fetchResult.data.length > 0) {
                setHasAccess(true);
            }
            const sortedQuestion = fetchQuestion.data.sort((a: Question, b: Question) => a.id - b.id);
            const sortedResult = fetchResult.data.sort((a: Result, b: Result) => a.questionId - b.questionId);

            console.log(sortedQuestion);
            console.log(sortedResult);
            const mergedQuestionResult: Question[] = sortedQuestion.map((question: Question, index: number) => ({
                ...question,
                result: sortedResult[index] || {}
            }));

            console.log(mergedQuestionResult);
            let ans = 0;
            let noAns = 0;
            let wAns = 0;
            for (let index = 0; index < mergedQuestionResult.length; index++) {
                if (mergedQuestionResult[index]?.result?.userAnswer?.trim() == mergedQuestionResult[index].answer?.trim()) {
                    ans = ans + 1;
                }
                else if (mergedQuestionResult[index]?.result?.userAnswer?.trim() == "") {
                    noAns = noAns + 1
                } else {
                    wAns = wAns + 1;
                }
            }
            setToggleCount((pre) => ({ ...pre, answered: ans, noVisited: noAns, noAnswered: wAns }));
            setExamSetQuestions(mergedQuestionResult);
            setQuestionsCount(fetchQuestion.data.length);


        } catch (error) {
            console.log(error);

            toast.error("Failed to fetch exam sets");
        } finally {
            setLoading(false);
        }
    };

    const fetchExamCategories = async () => {
        try {
            const token = Cookies.get("token");
            console.log(token);

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/result/view-analysis/${examSetId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // toast.success("Exam Categories Fetch successfully");
            console.log(res.data);
            const data = res.data;
            const filterData = data.map((value: {category:string}) => value.category)
            console.log(filterData);

            setCategories(filterData);
            fetchExamSetQuestionsForCategory(filterData[0]);

        } catch (error) {
            console.log(error);
            toast.error("Failed to update exam set");
        }
    };

    useEffect(() => {
        if (examSetId) fetchExamCategories();
    }, [examSetId])



    const getThisButtonCss = (idx: number) => {

        if (examSetQuestions[idx]?.result?.userAnswer?.trim() == examSetQuestions[idx].answer?.trim()) {

            return toggleCss[0];
        }
        if (examSetQuestions[idx]?.result?.userAnswer?.trim() == "") {

            return toggleCss[2];
        }

        return toggleCss[1];
        // }
    };

    // code for start exam and timer for each category

    return (
        <>
            <Header />
            <div className="container-fluid">
                <ToastContainer />
                {loading ? (<div className="loading__effect">
                    <div className="loading__effect--circle">

                    </div>
                    Loading...
                </div>
                ) : (
                    <div>
                        {
                            hasAccess &&
                            <div className="test__portal">
                                <div className="test__heading">
                                    <div className="test__heading--title">Analysis</div>
                                </div>
                                <div className="test__body">
                                    <div className="test__body--content">
                                        <div className="test__body--content-category flex">
                                            {
                                                categories && categories.map((item, index) => (
                                                    <div className="px-4 border pointer mx-4 py-2 rounded-lg bg-blue-100 border" key={index}>
                                                        <button onClick={() => fetchExamSetQuestionsForCategory(item)}>
                                                            {item}
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div className="test__body--question-details">
                                            <div className="test__body--question-count">Question {currentQuestion + 1}</div>
                                            <div className="test__body--question-scheme"> Question Mark : {questionsCount > 0 && examSetQuestions[currentQuestion]?.result?.questionMarks}</div>
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
                                                <ol>
                                                    {/* {examSetQuestions[currentQuestion]?.userAnswer} */}
                                                    {examSetQuestions[currentQuestion]?.options.map((option, index) => (
                                                        <li key={index}>

                                                            {examSetQuestions[currentQuestion]?.answer?.trim() === option?.trim() ? (
                                                                <span className="bg-green-100 border-2 border-green-500 text-green-800 font-semibold px-2 py-1 rounded-md shadow-sm">
                                                                    {index + 1}) {option}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-700 px-2 py-1 hover:bg-gray-50 rounded-md transition-colors">
                                                                    {index + 1}) {option}
                                                                </span>
                                                            )}

                                                            {examSetQuestions[currentQuestion]?.result?.userAnswer?.trim() === examSetQuestions[currentQuestion]?.answer?.trim() && examSetQuestions[currentQuestion]?.result?.userAnswer?.trim() === option?.trim() &&
                                                                <span>
                                                                    ✅
                                                                </span>}


                                                            {examSetQuestions[currentQuestion]?.result?.userAnswer?.trim() !== examSetQuestions[currentQuestion]?.answer?.trim() && examSetQuestions[currentQuestion]?.result?.userAnswer?.trim() === option?.trim() &&
                                                                <span>
                                                                    ❌
                                                                </span>}


                                                        </li>
                                                    ))}
                                                </ol>

                                            </div>

                                        </div>
                                    </div>
                                    <div className="test__body--toggle">
                                        <div className="test__body--toggle-details">
                                            <div ><span className={toggleCss[0]}>{toggleCount.answered}</span> Answered</div>
                                            <div><span className={toggleCss[1]}>{toggleCount.noAnswered}</span>Wrong Answered</div>
                                            <div><span className={toggleCss[2]}>{toggleCount.noVisited}</span> No Answered</div>
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
                                    </div>
                                </div>
                            </div>

                        }
                    </div>)

                }



            </div>
        </>
    );
}
