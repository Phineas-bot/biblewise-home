
import { Quiz } from "@/types/quiz";

export const quizzes: Quiz[] = [
  {
    id: 1,
    title: "Introduction to the New Testament",
    description: "Test your knowledge of the New Testament basics",
    courseId: 1,
    passingScore: 70,
    timeLimit: 15,
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "How many books are in the New Testament?",
        options: ["22", "27", "39", "46"],
        correctAnswer: "27",
        explanation: "The New Testament consists of 27 books including the Gospels, Acts, Epistles, and Revelation.",
        points: 10
      },
      {
        id: 2,
        type: "true-false",
        question: "The Gospel of John is considered one of the Synoptic Gospels.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "The Synoptic Gospels are Matthew, Mark, and Luke. John is distinct in its approach and content.",
        points: 10
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "Who wrote the majority of the Epistles in the New Testament?",
        options: ["Peter", "John", "Paul", "James"],
        correctAnswer: "Paul",
        explanation: "Paul wrote 13 (or 14 if including Hebrews) of the epistles in the New Testament.",
        points: 10
      },
      {
        id: 4,
        type: "short-answer",
        question: "What is the last book of the New Testament?",
        correctAnswer: ["Revelation", "Book of Revelation", "Revelations"],
        explanation: "The Book of Revelation, sometimes called the Apocalypse, is the final book of the New Testament.",
        points: 15
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "Which Gospel is believed to have been written first?",
        options: ["Matthew", "Mark", "Luke", "John"],
        correctAnswer: "Mark",
        explanation: "Most scholars believe Mark was written first, around 70 CE.",
        points: 10
      }
    ]
  },
  {
    id: 2,
    title: "Old Testament Figures",
    description: "Test your knowledge about key figures in the Old Testament",
    courseId: 2,
    passingScore: 75,
    timeLimit: 20,
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "Who was taken up to heaven in a whirlwind?",
        options: ["Moses", "Elijah", "Enoch", "Isaiah"],
        correctAnswer: "Elijah",
        explanation: "According to 2 Kings 2:11, Elijah was taken up to heaven in a whirlwind.",
        points: 10
      },
      {
        id: 2,
        type: "short-answer",
        question: "Who was the first king of Israel?",
        correctAnswer: ["Saul"],
        explanation: "Saul was anointed by the prophet Samuel as the first king of Israel.",
        points: 10
      }
    ]
  }
];
