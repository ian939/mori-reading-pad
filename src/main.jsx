import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Home,
  Library,
  LockKeyhole,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { getRegisteredBook, registerBook } from "./bookApi";
import { enableKidSafeInteractions } from "./kidSafeInteractions";
import "./styles.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const DEFAULT_BOOKS = [
  {
    id: "money",
    title: "돈이 뭐야?",
    tag: "생활 · 경제",
    cover: asset("assets/money-cover-v2.png"),
    color: "#ff735c",
    light: "#fff0e7",
    age: "6–8세",
    minutes: 12,
    desc: "오영이의 방에 찾아온 또보와 함께 돈의 쓰임, 가격, 저축을 알아봐요.",
    creature: {
      emoji: "🐷",
      name: "저금통 또보",
      fact: "동전을 차곡차곡 모으는 든든한 저금통 친구",
    },
    quizVersion: 2,
    questions: [
      {
        kind: "completion",
        skill: "completion",
        method: "Completion",
        type: "빈칸 채우기",
        q: "빈칸에 들어갈 말을 골라 문장을 완성해 보세요.",
        sentence: "물건을 사려면 필요한 돈의 양을 ____이라고 해요.",
        options: ["가격", "무게", "날짜", "이름"],
        answer: 0,
        why: "가격은 그 물건을 사기 위해 돈이 얼마나 필요한지 알려 주는 말이에요.",
      },
      {
        kind: "recall",
        skill: "recall",
        method: "Recall",
        type: "기억 꺼내기",
        q: "책을 잠깐 덮고, 또보가 오영이에게 처음 보여 준 두 가지를 말해 보세요.",
        prompts: [
          "두 가지 모두 기억했어요",
          "한 가지가 먼저 떠올랐어요",
          "힌트를 보고 다시 말했어요",
        ],
        hint: "둥글고 단단한 것과 네모난 종이 모양을 떠올려 보세요.",
        exampleAnswer: "또보는 동전과 지폐를 보여 주었어요.",
        why: "그림과 낱말을 보지 않고 다시 떠올리면 이야기 속 정보가 더 오래 기억에 남아요.",
      },
      {
        kind: "choice",
        skill: "wh-question",
        method: "Wh-question",
        type: "왜 질문",
        q: "왜 친구들이 종이에 그린 돈은 가게에서 쓸 수 없었을까요?",
        options: [
          "종이가 너무 커서",
          "마음대로 만든 가짜 돈이어서",
          "그림의 색이 흐려서",
          "숫자가 너무 커서",
        ],
        answer: 1,
        why: "돈은 모두가 진짜라고 약속한 것을 사용해야 해요. 마음대로 그린 돈은 그 약속에 들어 있지 않아요.",
      },
      {
        kind: "completion",
        skill: "completion",
        method: "Completion",
        type: "빈칸 채우기",
        q: "책에서 배운 내용을 떠올려 문장을 완성해 보세요.",
        sentence: "돈은 일을 한 대가로 ____.",
        options: ["벌 수 있어요", "그릴 수 있어요", "주울 수만 있어요", "숨길 수만 있어요"],
        answer: 0,
        why: "책에서는 일을 하고 그 대가로 돈을 얻는 것을 ‘돈을 번다’고 설명해요.",
      },
      {
        kind: "choice",
        skill: "wh-question",
        method: "Wh-question",
        type: "어떻게 질문",
        q: "오영이가 사탕을 사기 전에 어떻게 살 수 있는지 확인해야 할까요?",
        options: [
          "사탕의 가격과 가진 돈을 비교해요",
          "사탕의 색깔만 살펴봐요",
          "가게 지붕의 높이를 재요",
          "동전을 모두 숨겨요",
        ],
        answer: 0,
        why: "가격과 가진 돈을 비교하면 지금 살 수 있는지, 돈이 얼마나 더 필요한지 알 수 있어요.",
      },
      {
        kind: "recall",
        skill: "recall",
        method: "Recall",
        type: "기억 꺼내기",
        q: "책에서 돈으로 할 수 있다고 나온 일을 두 가지 이상 기억해서 말해 보세요.",
        prompts: [
          "두 가지 이상 말했어요",
          "한 가지를 자세히 설명했어요",
          "힌트를 보고 다시 떠올렸어요",
        ],
        hint: "사고, 타고, 모으고, 일을 돕는 장면을 떠올려 보세요.",
        exampleAnswer: "물건을 사고, 서비스를 이용하고, 저축할 수 있어요. 일을 한 대가로 벌기도 해요.",
        why: "돈은 물건을 사는 데만 쓰이지 않아요. 서비스를 이용하고, 나중을 위해 모으는 데도 쓰여요.",
      },
      {
        kind: "open-ended",
        skill: "open-ended",
        method: "Open-ended",
        type: "생각 넓히기",
        q: "만약 세상에 돈이 하나도 없다면, 물건을 필요한 사람에게 어떻게 나누면 좋을까요?",
        prompts: [
          "나는 이렇게 나누면 좋겠어요…",
          "서로 바꾸는 방법도 있어요…",
          "공평하려면 이런 약속이 필요해요…",
        ],
        why: "정답은 하나가 아니에요. 돈이 하는 역할을 다른 방법으로 바꾸어 생각하면 교환과 공평함을 함께 이해할 수 있어요.",
      },
      {
        kind: "open-ended",
        skill: "open-ended",
        method: "Open-ended",
        type: "선택 살펴보기",
        q: "오영이가 동전을 바로 쓰지 않고 또보에게 넣었어요. 이 선택의 좋은 점과 아쉬운 점은 무엇일까요?",
        prompts: [
          "좋은 점은…, 아쉬운 점은…",
          "지금 쓰면…, 모아 두면…",
          "내가 오영이라면… 왜냐하면…",
        ],
        why: "저축하면 더 큰 목표를 이룰 수 있지만 지금 원하는 것을 미뤄야 해요. 두 면을 함께 보는 것이 좋은 선택의 시작이에요.",
      },
      {
        kind: "distancing",
        skill: "distancing",
        method: "Distancing",
        type: "나의 경험 잇기",
        q: "사고 싶었지만 기다리거나 사지 않기로 한 것이 있나요? 그때 무엇을 생각하고 결정했는지 말해 보세요.",
        prompts: [
          "나도 기다려 본 적이 있어요…",
          "다른 것을 고른 적이 있어요…",
          "아직 없지만 다음에는…",
        ],
        why: "책 속 오영이의 선택을 내 경험과 연결하면 ‘필요한 것’과 ‘원하는 것’을 구분하는 힘이 자라요.",
      },
      {
        kind: "distancing",
        skill: "distancing",
        method: "Distancing",
        type: "나의 계획 세우기",
        q: "1,000원이 생긴다면 쓰기·저축하기·나누기 중 어떻게 사용할지 이유와 함께 말해 보세요.",
        prompts: [
          "나는 ___원은 쓰고 ___원은 모을래요…",
          "먼저 저축할래요. 왜냐하면…",
          "누군가와 나누고 싶어요. 왜냐하면…",
        ],
        why: "금액을 스스로 나누고 까닭을 설명하면 계획해서 쓰는 습관과 수 감각을 함께 연습할 수 있어요.",
      },
    ],
  },
  {
    id: "origin",
    quizVersion: 2,
    title: "우리가 어디서 왔게?",
    tag: "자연 · 음식",
    cover: asset("assets/origin-cover-v2.png"),
    color: "#67a85b",
    light: "#edf7df",
    age: "6–8세",
    minutes: 13,
    desc: "우주 친구들과 마트 음식의 고향을 찾아 농장과 공장으로 출발해요.",
    creature: {
      emoji: "🍎",
      name: "새콤 사과",
      fact: "나무에서 자라 주스와 잼 같은 여러 음식으로 변신해요",
    },
    questions: [
      {
        kind: "completion",
        method: "Completion",
        type: "빈칸 채우기",
        q: "배추의 여행이 시작되는 장면을 완성해 보세요.",
        sentence: "배추는 흙에 심은 작은 ____에서 여행을 시작해요.",
        options: ["씨앗", "접시", "병", "상자"],
        answer: 0,
        why: "배추는 밭의 흙에 심은 작은 씨앗에서 자라기 시작해요.",
      },
      {
        kind: "recall",
        method: "Recall",
        type: "장면 회상",
        q: "책에서 나온 음식 하나를 골라, 농장이나 밭에서 식탁까지 어떻게 왔는지 기억나는 순서대로 말해 보세요.",
        prompts: [
          "처음·가운데·마지막을 모두 말했어요",
          "두 장면을 이어 말했어요",
          "힌트를 보고 다시 말했어요",
        ],
        hint: "배추, 우유, 토마토 중 하나를 고르고 ‘자란 곳 → 바뀐 곳 → 도착한 곳’을 떠올려 보세요.",
        exampleAnswer: "예: 토마토는 농장에서 자라 트럭을 타고 공장으로 가서 케첩이 된 뒤 마트에 도착해요.",
        why: "사건을 처음·가운데·마지막 순서로 떠올리면 이야기의 흐름을 더 단단하게 기억할 수 있어요.",
      },
      {
        kind: "choice",
        method: "Wh-question",
        type: "어디 질문",
        q: "우유의 여행은 어디에서 시작되나요?",
        options: ["젖소를 기르는 농장", "토마토밭", "빵 공장", "마트 계산대"],
        answer: 0,
        why: "우유는 젖소를 기르는 농장에서 얻은 뒤 여러 곳으로 여행해요.",
      },
      {
        kind: "completion",
        method: "Completion",
        type: "낱말 빈칸",
        q: "책에서 배운 낱말로 문장을 완성해 보세요.",
        sentence: "음식을 만드는 데 바탕으로 쓰는 것을 ____라고 해요.",
        options: ["재료", "가격", "간판", "장난감"],
        answer: 0,
        why: "재료는 다른 물건이나 음식을 만들 때 바탕으로 쓰는 것이에요.",
      },
      {
        kind: "choice",
        method: "Wh-question",
        type: "왜 질문",
        q: "왜 농장에서 모은 우유를 냉장 트럭에 실어 옮길까요?",
        options: [
          "차갑게 지켜 상하지 않게 하려고",
          "트럭을 하얗게 칠하려고",
          "젖소를 마트에 데려가려고",
          "배추를 심으려고",
        ],
        answer: 0,
        why: "우유는 상하지 않도록 차갑게 보관하며 공장이나 가게로 옮겨야 해요.",
      },
      {
        kind: "recall",
        method: "Recall",
        type: "핵심 회상",
        q: "치즈·빵·배추·토마토가 한곳에 모여 무엇이 되었는지, 재료 이름과 함께 말해 보세요.",
        prompts: [
          "네 가지 재료와 완성된 음식을 말했어요",
          "재료 두 가지 이상을 말했어요",
          "힌트를 보고 다시 말했어요",
        ],
        hint: "빵 사이에 여러 재료를 넣어 먹는 음식을 떠올려 보세요.",
        exampleAnswer: "예: 치즈, 빵, 배추, 토마토가 모여 샌드위치가 되었어요.",
        why: "여러 재료와 완성된 음식의 관계를 말로 다시 엮으면 핵심 내용을 더 잘 기억할 수 있어요.",
      },
      {
        kind: "open-ended",
        method: "Open-ended",
        type: "설명 만들기",
        q: "모든 음식이 처음부터 마트에서 생긴다고 생각하는 친구에게 책의 내용을 어떻게 설명해 줄까요?",
        prompts: [
          "먼저 농장과 밭에서는…",
          "그다음 공장과 트럭은…",
          "마지막으로 마트와 식탁에는…",
        ],
        why: "책의 중심 생각을 자기 말로 설명하면 정보를 고르고 이어 말하는 힘이 자라요.",
      },
      {
        kind: "open-ended",
        method: "Open-ended",
        type: "상상 추론",
        q: "토마토가 케첩이 되는 여행에서 공장이나 트럭이 사라진다면 어떤 일이 생길까요?",
        prompts: [
          "공장이 없다면…",
          "트럭이 없다면…",
          "다른 방법을 찾는다면…",
        ],
        why: "과정의 한 부분을 바꾸어 상상하면 원인과 결과, 각 역할의 중요성을 함께 생각하게 돼요.",
      },
      {
        kind: "distancing",
        method: "Distancing",
        type: "내 식탁과 연결",
        q: "오늘 먹은 음식 하나를 떠올려 보세요. 그 음식의 재료는 어디에서 시작해 어떻게 왔을까요?",
        prompts: [
          "내가 먹은 ___의 재료는…",
          "밭이나 농장에서 시작해…",
          "잘 모르지만 포장지에서 찾아볼래요…",
        ],
        why: "책의 과정을 오늘 먹은 음식에 적용하면 배운 내용을 실제 생활 속에서 다시 발견할 수 있어요.",
      },
      {
        kind: "distancing",
        method: "Distancing",
        type: "고마움과 연결",
        q: "농부·공장 사람·운전기사·가게 직원 중 한 사람에게 고마운 마음을 전한다면 누구에게 무엇이라고 말하고 싶나요?",
        prompts: [
          "농부에게…",
          "만들고 옮겨 준 사람에게…",
          "가게에서 만난 사람에게…",
        ],
        why: "음식의 여행을 내 마음과 연결하면 서로 돕는 사람들의 역할과 고마움을 발견할 수 있어요.",
      },
    ],
  },
];

const starsForScore = (score, total = 5) => {
  if (!total) return 0;
  const ratio = score / total;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.55) return 2;
  return 1;
};

const questionKind = (question) => question.kind || "choice";
const REFLECTIVE_KINDS = new Set(["recall", "open-ended", "distancing"]);
const isReflectiveQuestion = (question) =>
  REFLECTIVE_KINDS.has(questionKind(question));

const isQuestionComplete = (question, response) => {
  const kind = questionKind(question);
  if (isReflectiveQuestion(question)) {
    return Number.isInteger(response?.prompt);
  }
  if (kind === "sequence") {
    return Array.isArray(response) && response.length === question.answer.length;
  }
  if (kind === "match") {
    return (
      response?.pairs &&
      question.leftItems.every((item) => Boolean(response.pairs[item.id]))
    );
  }
  return Number.isInteger(response);
};

const isQuestionCorrect = (question, response) => {
  const kind = questionKind(question);
  if (isReflectiveQuestion(question)) return true;
  if (kind === "sequence") {
    return (
      Array.isArray(response) &&
      response.length === question.answer.length &&
      response.every((item, index) => item === question.answer[index])
    );
  }
  if (kind === "match") {
    return question.leftItems.every(
      (item) => response?.pairs?.[item.id] === question.answer[item.id],
    );
  }
  return response === question.answer;
};

const answerLabel = (question) => {
  const kind = questionKind(question);
  if (isReflectiveQuestion(question)) {
    return question.exampleAnswer || "정답이 하나가 아닌 생각 문제예요.";
  }
  if (kind === "sequence") {
    return question.answer
      .map((id) => question.items.find((item) => item.id === id)?.label)
      .filter(Boolean)
      .join(" → ");
  }
  if (kind === "match") {
    return question.leftItems
      .map((left) => {
        const right = question.rightItems.find(
          (item) => item.id === question.answer[left.id],
        );
        return `${left.label} → ${right?.label || ""}`;
      })
      .join(" · ");
  }
  return question.options[question.answer];
};

const spokenPrompt = (question) => {
  const kind = questionKind(question);
  if (isReflectiveQuestion(question)) {
    return `${question.q}. 말하기 도움. ${question.prompts.join(". ")}`;
  }
  if (kind === "sequence") {
    return `${question.q}. 장면 카드. ${question.items.map((item) => item.label).join(". ")}`;
  }
  if (kind === "match") {
    return `${question.q}. 왼쪽 카드. ${question.leftItems.map((item) => item.label).join(". ")}. 오른쪽 카드. ${question.rightItems.map((item) => item.label).join(". ")}`;
  }
  return `${question.q}. ${question.options.map((option, index) => `${index + 1}번, ${option}`).join(". ")}`;
};

const quizStage = (index) => {
  if (index < 4) return "기억 깨우기";
  if (index < 7) return "생각 넓히기";
  return "나와 잇기";
};

const loadBooks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("mori-reviewed-books"));
    if (!Array.isArray(saved)) return DEFAULT_BOOKS;
    return DEFAULT_BOOKS.map((book) => {
      const reviewed = saved.find((item) => item.id === book.id);
      const validQuestions =
        Array.isArray(reviewed?.questions) &&
        reviewed.questions.length === book.questions.length &&
        reviewed.quizVersion === book.quizVersion;
      return validQuestions ? { ...book, questions: reviewed.questions } : book;
    });
  } catch {
    return DEFAULT_BOOKS;
  }
};

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("mori-progress"));
    const completed = Array.isArray(saved?.completed) ? saved.completed : [];
    const bestScores =
      saved?.bestScores && typeof saved.bestScores === "object"
        ? saved.bestScores
        : {};
    const bestTotals =
      saved?.bestTotals && typeof saved.bestTotals === "object"
        ? saved.bestTotals
        : Object.fromEntries(
            Object.keys(bestScores).map((bookId) => [bookId, 5]),
          );
    const bookStars =
      saved?.bookStars && typeof saved.bookStars === "object"
        ? saved.bookStars
        : Object.fromEntries(
            completed.map((bookId) => [
              bookId,
              starsForScore(bestScores[bookId] || 0, bestTotals[bookId] || 5),
            ]),
          );
    return {
      completed,
      stars: Number.isFinite(saved?.stars) ? saved.stars : 0,
      bestScores,
      bestTotals,
      bookStars,
    };
  } catch {
    return {
      completed: [],
      stars: 0,
      bestScores: {},
      bestTotals: {},
      bookStars: {},
    };
  }
};

function App() {
  const [books, setBooks] = useState(loadBooks);
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(DEFAULT_BOOKS[0].id);
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [draftPages, setDraftPages] = useState([]);
  const [scanState, setScanState] = useState("idle");
  const [registeredBook, setRegisteredBook] = useState(null);
  const [scanError, setScanError] = useState("");
  const [childPhoto, setChildPhoto] = useState("");
  const [reviewOrigin, setReviewOrigin] = useState("detail");
  const topRef = useRef(null);
  const bookPollTimerRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const selected = books.find((book) => book.id === selectedId) || books[0];

  useEffect(() => {
    localStorage.setItem("mori-progress", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem(
      "mori-reviewed-books",
      JSON.stringify(
        books.map(({ id, quizVersion, questions }) => ({
          id,
          quizVersion,
          questions,
        })),
      ),
    );
  }, [books]);
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [view]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(
    () => () => {
      clearTimeout(bookPollTimerRef.current);
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const releasePreview = (url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };
  const go = (next, book) => {
    if (book) setSelectedId(book.id);
    setView(next);
    setToast("");
  };
  const startQuiz = (book) => {
    setSelectedId(book.id);
    setQuizIndex(0);
    setChoice(null);
    setAnswers([]);
    go("quiz", book);
  };
  const openReview = (book, origin) => {
    setReviewOrigin(origin);
    go("review", book);
  };
  const answer = () => {
    const question = selected.questions[quizIndex];
    if (!isQuestionComplete(question, choice)) return;
    setAnswers((current) => [
      ...current,
      {
        correct: isQuestionCorrect(question, choice),
        reflective: isReflectiveQuestion(question),
      },
    ]);
    setView("feedback");
  };
  const next = () => {
    if (quizIndex < selected.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setChoice(null);
      setView("quiz");
    } else {
      const correct = answers.filter(
        (item) => item.correct && !item.reflective,
      ).length;
      const total = selected.questions.filter(
        (question) => !isReflectiveQuestion(question),
      ).length;
      const earned = starsForScore(correct, total);
      setProgress((p) => {
        const hasPreviousScore = Number.isFinite(p.bestScores?.[selected.id]);
        const previousBest = hasPreviousScore
          ? p.bestScores[selected.id]
          : 0;
        const previousTotal = p.bestTotals?.[selected.id] || 5;
        const previousRatio = hasPreviousScore
          ? previousBest / previousTotal
          : -1;
        const isNewBest = correct / total >= previousRatio;
        const previousStars = p.bookStars?.[selected.id] || 0;
        const bestStars = Math.max(previousStars, earned);
        return {
          completed: [...new Set([...p.completed, selected.id])],
          stars: p.stars + Math.max(0, bestStars - previousStars),
          bestScores: {
            ...p.bestScores,
            [selected.id]: isNewBest ? correct : previousBest,
          },
          bestTotals: {
            ...p.bestTotals,
            [selected.id]: isNewBest ? total : previousTotal,
          },
          bookStars: {
            ...p.bookStars,
            [selected.id]: bestStars,
          },
        };
      });
      setView("result");
    }
  };
  const upload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);
    releasePreview(childPhoto);
    setChildPhoto(url);
    event.target.value = "";
  };

  const addBookImages = (event) => {
    const selectedFiles = [...(event.target.files || [])].filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!selectedFiles.length) return;

    const available = Math.max(0, 40 - draftPages.length);
    const accepted = selectedFiles.slice(0, available).map((file) => {
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.add(url);
      return { file, url };
    });
    setDraftPages((current) => [...current, ...accepted]);
    setRegisteredBook(null);
    setScanError("");
    setScanState("idle");
    if (selectedFiles.length > available) {
      setToast("한 권당 사진은 최대 40장까지 등록할 수 있어요.");
    }
    event.target.value = "";
  };

  const removeBookImage = (index) => {
    setDraftPages((current) => {
      const target = current[index];
      releasePreview(target?.url);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setRegisteredBook(null);
    setScanError("");
    setScanState("idle");
  };

  const pollRegisteredBook = async (bookId) => {
    clearTimeout(bookPollTimerRef.current);
    try {
      const book = await getRegisteredBook(bookId);
      setRegisteredBook(book);
      setScanState(book.status);
      if (["queued", "processing"].includes(book.status)) {
        bookPollTimerRef.current = setTimeout(
          () => pollRegisteredBook(bookId),
          1600,
        );
      }
    } catch (error) {
      setScanError(error.message);
      setScanState("error");
    }
  };

  const submitBookRegistration = async () => {
    if (!draftPages.length || ["uploading", "queued", "processing"].includes(scanState)) {
      return;
    }
    setScanError("");
    setRegisteredBook(null);
    setScanState("uploading");
    try {
      const book = await registerBook(draftPages.map((page) => page.file));
      setRegisteredBook(book);
      setScanState(book.status);
      if (["queued", "processing"].includes(book.status)) {
        await pollRegisteredBook(book.id);
      }
    } catch (error) {
      setScanError(error.message);
      setScanState("error");
    }
  };

  const resetBookRegistration = () => {
    clearTimeout(bookPollTimerRef.current);
    draftPages.forEach((page) => releasePreview(page.url));
    setDraftPages([]);
    setRegisteredBook(null);
    setScanError("");
    setScanState("idle");
  };

  const publishDraft = (reviewedBook) => {
    setBooks((current) =>
      current.map((book) => (book.id === reviewedBook.id ? reviewedBook : book)),
    );
    setSelectedId(reviewedBook.id);
    go("home", reviewedBook);
    setToast(
      `보호자 확인 완료! 문제 ${reviewedBook.questions.length}개를 아이에게 공개했어요.`,
    );
  };

  return (
    <div className="app" ref={topRef}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="홈으로"
        >
          <span className="brand-mark">m</span>
          <span>모리의 책숲</span>
        </button>
        <div className="top-actions">
          <span className="star-pill">
            <Star size={16} fill="currentColor" /> {progress.stars}
          </span>
          <button
            className="avatar-mini"
            onClick={() => go("profile")}
            aria-label="내 캐릭터"
          >
            {childPhoto ? (
              <img src={childPhoto} alt="아이 사진 미리보기" />
            ) : (
              <UserRound size={20} />
            )}
          </button>
        </div>
      </header>
      <main>
        {view === "home" && (
          <HomeView
            books={books}
            progress={progress}
            go={go}
            startQuiz={startQuiz}
          />
        )}
        {view === "detail" && (
          <Detail
            book={selected}
            done={progress.completed.includes(selected.id)}
            back={() => go("home")}
            start={() => startQuiz(selected)}
            review={() => openReview(selected, "detail")}
          />
        )}
        {view === "quiz" && (
          <Quiz
            book={selected}
            index={quizIndex}
            choice={choice}
            setChoice={setChoice}
            submit={answer}
            close={() => go("detail")}
          />
        )}
        {view === "feedback" && (
          <Feedback
            q={selected.questions[quizIndex]}
            choice={choice}
            next={next}
            last={quizIndex === selected.questions.length - 1}
          />
        )}
        {view === "result" && (
          <Result
            book={selected}
            correct={
              answers.filter((item) => item.correct && !item.reflective).length
            }
            reflectionCount={answers.filter((item) => item.reflective).length}
            go={go}
          />
        )}
        {view === "library" && (
          <LibraryView books={books} progress={progress} go={go} />
        )}
        {view === "add" && (
          <AddBook
            draftPages={draftPages}
            scanState={scanState}
            registeredBook={registeredBook}
            scanError={scanError}
            addImages={addBookImages}
            removeImage={removeBookImage}
            submit={submitBookRegistration}
            reset={resetBookRegistration}
          />
        )}
        {view === "review" && (
          <ReviewDraft
            key={selected.id}
            book={selected}
            back={() => go(reviewOrigin)}
            publish={publishDraft}
          />
        )}
        {view === "profile" && (
          <Profile childPhoto={childPhoto} upload={upload} />
        )}
      </main>
      {["home", "library", "add", "profile"].includes(view) && (
        <nav className="bottom-nav">
          <NavButton
            active={view === "home"}
            icon={Home}
            label="오늘"
            onClick={() => go("home")}
          />
          <NavButton
            active={view === "library"}
            icon={Library}
            label="내 책장"
            onClick={() => go("library")}
          />
          <button
            className="add-nav"
            onClick={() => go("add")}
            aria-label="책 추가"
          >
            <Plus />
          </button>
          <NavButton
            active={view === "add"}
            icon={Camera}
            label="책 찍기"
            onClick={() => go("add")}
          />
          <NavButton
            active={view === "profile"}
            icon={UserRound}
            label="내 모리"
            onClick={() => go("profile")}
          />
        </nav>
      )}
      {toast && (
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <Icon size={21} />
      <span>{label}</span>
    </button>
  );
}
function HomeView({ books, progress, go, startQuiz }) {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">오늘의 책 모험</span>
          <h1>
            책 한 권이
            <br />
            <em>나만의 숲</em>이 돼요
          </h1>
          <p>
            읽고, 생각하고, 별을 모아
            <br />
            책장을 채워 보세요.
          </p>
          <button
            className="primary"
            onClick={() =>
              startQuiz(
                books.find((b) => !progress.completed.includes(b.id)) ||
                  books[0],
              )
            }
          >
            모험 시작하기 <ChevronRight size={18} />
          </button>
        </div>
        <img src={asset("assets/mori-mascot.png")} alt="책을 든 모리" />
      </section>
      <section className="daily">
        <div className="ring">
          <strong>{progress.completed.length}</strong>
          <span>/ {books.length}권</span>
        </div>
        <div>
          <span className="overline">나의 책숲</span>
          <h2>
            {progress.completed.length === books.length
              ? "작은 책숲이 완성됐어요!"
              : "한 권씩 숲을 키워 봐요"}
          </h2>
          <p>완독한 책은 내 책장에 영원히 남아요.</p>
        </div>
        <button onClick={() => go("library")} aria-label="책장 보기">
          <ChevronRight />
        </button>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <span className="overline">지금 읽을 수 있어요</span>
            <h2>오늘은 어떤 모험?</h2>
          </div>
          <span className="count">{books.length}권</span>
        </div>
        <div className="book-grid">
          {books.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              done={progress.completed.includes(b.id)}
              onClick={() => go("detail", b)}
            />
          ))}
        </div>
      </section>
      <section className="parent-note">
        <LockKeyhole size={20} />
        <div>
          <strong>보호자 안심 설계</strong>
          <p>
            사진은 이 기기에만 미리보기로 남고, 정답보다 생각한 과정을 칭찬해요.
          </p>
        </div>
      </section>
    </>
  );
}

function BookCover({ book, className = "" }) {
  return (
    <div
      className={`book-cover ${className}`.trim()}
      role="img"
      aria-label={`${book.title} 모리 책 모험 표지`}
    >
      <img src={book.cover} alt="" />
      <span className="book-cover-copy">
        <small>모리의 책 모험</small>
        <strong>{book.title}</strong>
      </span>
    </div>
  );
}

function BookCard({ book, done, onClick }) {
  return (
    <button className="book-card" onClick={onClick}>
      <div className="cover-wrap" style={{ background: book.light }}>
        <BookCover book={book} />
        {done && (
          <span className="done-badge">
            <Check size={15} /> 완독
          </span>
        )}
        <span className="time">{book.minutes}분</span>
      </div>
      <div className="book-meta">
        <span>{book.tag}</span>
        <h3>{book.title}</h3>
        <p>{book.desc}</p>
      </div>
    </button>
  );
}
function Back({ onClick, label = "돌아가기" }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      <ArrowLeft size={19} />
      {label}
    </button>
  );
}
function Detail({ book, done, back, start, review }) {
  return (
    <div className="page detail">
      <Back onClick={back} />
      <div
        className="detail-hero"
        style={{ "--accent": book.color, "--light": book.light }}
      >
        <BookCover book={book} className="detail-cover" />
        <div>
          <span className="eyebrow">{book.tag}</span>
          <h1>{book.title}</h1>
          <p>{book.desc}</p>
          <div className="chips">
            <span>{book.age}</span>
            <span>약 {book.minutes}분</span>
            <span>문제 {book.questions.length}개</span>
          </div>
        </div>
      </div>
      <div className="mission-card">
        <span className="mission-icon">
          <Sparkles />
        </span>
        <div>
          <span className="overline">이번 모험의 비밀</span>
          <h2>
            {book.id === "money"
              ? "돈은 왜 필요하고, 어떻게 모을까요?"
              : "내가 먹는 음식은 어디에서 올까요?"}
          </h2>
          <p>
            책에서 찾은 단서로 {book.questions.length}개의 문을 열어 보세요.
          </p>
        </div>
      </div>
      <div className="skill-row">
        <div>
          <strong>1</strong>
          <span>단서 찾기</span>
        </div>
        <i />
        <div>
          <strong>2</strong>
          <span>생각 탐험</span>
        </div>
        <i />
        <div>
          <strong>3</strong>
          <span>마지막 열쇠</span>
        </div>
      </div>
      <button className="primary wide" onClick={start}>
        {done ? "다시 도전하기" : "퀴즈 시작하기"} <ChevronRight />
      </button>
      <button className="secondary wide" onClick={review}>
        <LockKeyhole size={18} /> 보호자 문제 미리보기
      </button>
    </div>
  );
}
function Quiz({ book, index, choice, setChoice, submit, close }) {
  const q = book.questions[index];
  const complete = isQuestionComplete(q, choice);
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(spokenPrompt(q));
    message.lang = "ko-KR";
    message.rate = 0.88;
    window.speechSynthesis.speak(message);
  };
  return (
    <div className="quiz-page">
      <div className="quiz-top">
        <button onClick={close} aria-label="퀴즈 닫기">
          <X />
        </button>
        <div
          className="progress"
          aria-label={`문제 ${index + 1}/${book.questions.length}`}
        >
          <i
            style={{
              width: `${((index + 1) / book.questions.length) * 100}%`,
              background: book.color,
            }}
          />
        </div>
        <span>
          {index + 1}/{book.questions.length}
        </span>
      </div>
      <div className="quiz-body">
        <div className="question-label">
          <div className="question-tags">
            <span className="stage-tag">{quizStage(index)}</span>
            <span className="method-tag">{q.method}</span>
            <span style={{ background: book.light, color: book.color }}>
              {q.type}
            </span>
          </div>
          <button aria-label="문제와 선택지 읽어주기" onClick={speak}>
            <Volume2 size={22} />
            <span>읽어주기</span>
          </button>
        </div>
        <h1>{q.q}</h1>
        {q.visual && (
          <figure className="question-visual">
            <img src={q.visual} alt={q.visualAlt} draggable="false" />
            <figcaption>그림 속 단서를 천천히 살펴보세요.</figcaption>
          </figure>
        )}
        {(questionKind(q) === "choice" ||
          questionKind(q) === "image-choice") && (
          <ChoiceQuestion q={q} choice={choice} setChoice={setChoice} />
        )}
        {questionKind(q) === "completion" && (
          <CompletionQuestion q={q} choice={choice} setChoice={setChoice} />
        )}
        {isReflectiveQuestion(q) && (
          <ReflectionQuestion q={q} choice={choice} setChoice={setChoice} />
        )}
        {questionKind(q) === "sequence" && (
          <SequenceQuestion q={q} choice={choice} setChoice={setChoice} />
        )}
        {questionKind(q) === "match" && (
          <MatchQuestion q={q} choice={choice} setChoice={setChoice} />
        )}
      </div>
      <div className="quiz-bottom">
        <button
          className="primary wide"
          disabled={!complete}
          onClick={submit}
        >
          {isReflectiveQuestion(q) ? "내 생각 남기기" : "정답 확인하기"}
        </button>
      </div>
    </div>
  );
}

function CompletionQuestion({ q, choice, setChoice }) {
  const [beforeBlank, afterBlank = ""] = q.sentence.split("____");
  const selectedWord = Number.isInteger(choice) ? q.options[choice] : "?";
  return (
    <div className="completion-question">
      <div className="interaction-help">
        <span>1</span>
        낱말 카드를 골라 빈칸에 쏙 넣어 보세요.
      </div>
      <p className="completion-sentence">
        {beforeBlank}
        <strong className={Number.isInteger(choice) ? "filled" : ""}>
          {selectedWord}
        </strong>
        {afterBlank}
      </p>
      <ChoiceQuestion q={q} choice={choice} setChoice={setChoice} />
    </div>
  );
}

function ReflectionQuestion({ q, choice, setChoice }) {
  const kind = questionKind(q);
  const intro =
    kind === "recall"
      ? "책을 보지 않고 먼저 소리 내어 말해 봐요."
      : kind === "distancing"
        ? "책 속 이야기를 나의 경험과 이어 말해 봐요."
        : "떠오른 생각을 자유롭게 소리 내어 말해 봐요.";

  return (
    <div className="reflection-question">
      <div className="reflection-invitation">
        <Sparkles aria-hidden="true" />
        <div>
          <strong>{intro}</strong>
          <p>정답은 하나가 아니에요. 까닭을 붙이면 생각이 더 크게 자라요.</p>
        </div>
      </div>
      {q.hint && (
        <details className="memory-hint">
          <summary>힌트가 필요해요</summary>
          <p>{q.hint}</p>
        </details>
      )}
      <div className="reflection-prompts">
        <span>말한 뒤, 지금의 나와 가장 가까운 카드를 골라요.</span>
        {q.prompts.map((prompt, promptIndex) => (
          <button
            key={prompt}
            className={choice?.prompt === promptIndex ? "selected" : ""}
            aria-pressed={choice?.prompt === promptIndex}
            onClick={() => setChoice({ prompt: promptIndex })}
          >
            <Sparkles size={18} aria-hidden="true" />
            {prompt}
            {choice?.prompt === promptIndex && <Check size={20} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceQuestion({ q, choice, setChoice }) {
  return (
    <div className="options">
      {q.options.map((option, optionIndex) => (
        <button
          key={option}
          className={choice === optionIndex ? "selected" : ""}
          aria-pressed={choice === optionIndex}
          onClick={() => setChoice(optionIndex)}
        >
          <span>{String.fromCharCode(65 + optionIndex)}</span>
          {option}
          {choice === optionIndex && <Check size={20} />}
        </button>
      ))}
    </div>
  );
}

function SequenceQuestion({ q, choice, setChoice }) {
  const selectedItems = Array.isArray(choice) ? choice : [];
  const toggleItem = (itemId) => {
    setChoice((current) => {
      const currentItems = Array.isArray(current) ? current : [];
      return currentItems.includes(itemId)
        ? currentItems.filter((id) => id !== itemId)
        : [...currentItems, itemId];
    });
  };

  return (
    <div className="sequence-question">
      <div className="interaction-help">
        <span>1</span>
        먼저 일어난 장면부터 눌러 주세요. 다시 누르면 순서에서 빠져요.
      </div>
      <div className="sequence-grid">
        {q.items.map((item) => {
          const order = selectedItems.indexOf(item.id);
          return (
            <button
              key={item.id}
              className={order >= 0 ? "selected" : ""}
              aria-pressed={order >= 0}
              onClick={() => toggleItem(item.id)}
            >
              <span className="sequence-order">
                {order >= 0 ? order + 1 : "?"}
              </span>
              <span className="sequence-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <strong>{item.label}</strong>
            </button>
          );
        })}
      </div>
      {selectedItems.length > 0 && (
        <button className="reset-answer" onClick={() => setChoice([])}>
          <RotateCcw size={16} /> 순서 다시 고르기
        </button>
      )}
    </div>
  );
}

function MatchQuestion({ q, choice, setChoice }) {
  const response = choice?.pairs ? choice : { active: null, pairs: {} };
  const selectLeft = (leftId) => {
    setChoice((current) => ({
      active: leftId,
      pairs: current?.pairs || {},
    }));
  };
  const selectRight = (rightId) => {
    if (!response.active) return;
    setChoice((current) => {
      const pairs = { ...(current?.pairs || {}) };
      Object.keys(pairs).forEach((leftId) => {
        if (pairs[leftId] === rightId) delete pairs[leftId];
      });
      pairs[current.active] = rightId;
      return { active: null, pairs };
    });
  };
  const usedRightIds = Object.values(response.pairs);

  return (
    <div className="match-question">
      <div className="interaction-help">
        <span>1</span>
        왼쪽 카드를 누른 뒤 어울리는 오른쪽 카드를 눌러 주세요.
      </div>
      <div className="match-board">
        <div className="match-column" aria-label="연결할 이야기 카드">
          {q.leftItems.map((item) => {
            const paired = q.rightItems.find(
              (right) => right.id === response.pairs[item.id],
            );
            return (
              <button
                key={item.id}
                className={response.active === item.id ? "active" : ""}
                aria-pressed={response.active === item.id}
                onClick={() => selectLeft(item.id)}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.label}</strong>
                <small>{paired ? `→ ${paired.label}` : "짝을 골라요"}</small>
              </button>
            );
          })}
        </div>
        <div className="match-arrow" aria-hidden="true">→</div>
        <div className="match-column answers" aria-label="연결할 뜻 카드">
          {q.rightItems.map((item) => {
            const used = usedRightIds.includes(item.id);
            return (
              <button
                key={item.id}
                className={used ? "used" : ""}
                aria-pressed={used}
                onClick={() => selectRight(item.id)}
              >
                {item.label}
                {used && <Check size={17} />}
              </button>
            );
          })}
        </div>
      </div>
      {Object.keys(response.pairs).length > 0 && (
        <button className="reset-answer" onClick={() => setChoice(null)}>
          <RotateCcw size={16} /> 연결 다시 하기
        </button>
      )}
    </div>
  );
}

function Feedback({ q, choice, next, last }) {
  if (isReflectiveQuestion(q)) {
    return (
      <div className="feedback reflection">
        <div className="confetti">✦ · ✦</div>
        <div className="feedback-icon"><Sparkles /></div>
        <span className="eyebrow">{q.method} · 생각 표현</span>
        <h1>내 생각을 잘 꺼냈어요!</h1>
        <div className="explain">
          <strong>생각이 자라는 이유</strong>
          <p>{q.why}</p>
          {q.exampleAnswer && (
            <small className="answer-reveal">책 속 기억: {q.exampleAnswer}</small>
          )}
        </div>
        <button className="primary wide" onClick={next}>
          {last ? "모험 마치기" : "다음 문제"} <ChevronRight />
        </button>
      </div>
    );
  }
  const ok = isQuestionCorrect(q, choice);
  return (
    <div className={`feedback ${ok ? "correct" : "wrong"}`}>
      <div className="confetti">{ok ? "✦  ·  ✦" : "⌁"}</div>
      <div className="feedback-icon">{ok ? <Check /> : <RotateCcw />}</div>
      <span className="eyebrow">
        {ok ? "멋진 발견!" : "한 번 더 생각했구나!"}
      </span>
      <h1>{ok ? "정답이에요!" : "괜찮아요, 단서를 찾았어요."}</h1>
      <div className="explain">
        <strong>{ok ? "왜 그럴까요?" : "책 속 단서"}</strong>
        <p>{q.why}</p>
        {!ok && <small className="answer-reveal">정답: {answerLabel(q)}</small>}
      </div>
      <button className="primary wide" onClick={next}>
        {last ? "모험 마치기" : "다음 문제"} <ChevronRight />
      </button>
    </div>
  );
}
function Result({ book, correct, reflectionCount, go }) {
  const score = correct;
  const scoredTotal = book.questions.filter(
    (question) => !isReflectiveQuestion(question),
  ).length;
  const reflectionTotal = book.questions.length - scoredTotal;
  return (
    <div className="result">
      <div className="rays" />
      <img src={asset("assets/mori-mascot.png")} alt="축하하는 모리" />
      <span className="eyebrow">책 모험 완료</span>
      <h1>
        새 책이 책장에
        <br />
        도착했어요!
      </h1>
      <p>
        <strong>{book.title}</strong>의 단서를 끝까지 찾았어요.
      </p>
      <div className="result-card">
        <div className="result-book" style={{ background: book.light }}>
          <BookCover book={book} />
        </div>
        <div>
          <span>책 속 단서</span>
          <strong>
            {score} / {scoredTotal}
          </strong>
          <small className="reflection-record">
            생각 말하기 {reflectionCount} / {reflectionTotal}
          </small>
          <div className="stars">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                fill="currentColor"
                className={i < starsForScore(score, scoredTotal) ? "on" : ""}
              />
            ))}
          </div>
        </div>
      </div>
      <button className="primary wide" onClick={() => go("library")}>
        내 책장에 꽂기 <Library />
      </button>
      <button className="text-btn" onClick={() => go("home")}>
        오늘 화면으로
      </button>
    </div>
  );
}
function LibraryView({ books, progress, go }) {
  return (
    <div className="page library-page">
      <span className="eyebrow">나의 책숲</span>
      <div className="title-line">
        <h1>
          한 권씩 자라는
          <br />
          나만의 책장
        </h1>
        <div>
          <strong>{progress.completed.length}</strong>
          <span>완독</span>
        </div>
      </div>
      <div className="shelf-scene">
        <div className="shelf-books">
          {books.map((b) =>
            progress.completed.includes(b.id) ? (
              <button
                key={b.id}
                className="shelf-book"
                onClick={() => go("detail", b)}
                style={{ "--book": b.color }}
              >
                <BookCover book={b} className="shelf-cover" />
                <span>{b.title}</span>
              </button>
            ) : (
              <div key={b.id} className="empty-book">
                <BookOpen />
                <span>다음 책</span>
              </div>
            ),
          )}
        </div>
        <div className="wood" />
      </div>
      <section className="collection">
        <div className="section-title">
          <div>
            <span className="overline">이야기 도감</span>
            <h2>책에서 만난 친구들</h2>
          </div>
          <span className="count">
            {progress.completed.length}/{books.length}
          </span>
        </div>
        <div className="creatures">
          {books.map((b) => {
            const unlocked = progress.completed.includes(b.id);
            return (
              <button
                key={b.id}
                className={!unlocked ? "locked" : ""}
                onClick={() => unlocked && go("detail", b)}
              >
                <span>{unlocked ? b.creature.emoji : <LockKeyhole />}</span>
                <strong>{unlocked ? b.creature.name : "아직 비밀"}</strong>
                <p>
                  {unlocked
                    ? b.creature.fact
                    : "책 모험을 마치면 만날 수 있어요."}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
const scanCopy = {
  uploading: "사진을 서버에 안전하게 올리는 중…",
  queued: "책 분석 순서를 기다리는 중…",
  processing: "제목·출판 정보와 본문을 읽는 중…",
};

function AddBook({
  draftPages,
  scanState,
  registeredBook,
  scanError,
  addImages,
  removeImage,
  submit,
  reset,
}) {
  const isWorking = ["uploading", "queued", "processing"].includes(scanState);
  const textLength = registeredBook?.fullText?.length || 0;

  return (
    <div className="page add-page" data-allow-native-editing="true">
      <span className="eyebrow">보호자 책 등록</span>
      <h1>
        책을 찍으면 글과
        <br />
        출판 정보를 저장해요
      </h1>
      <p>
        표지를 먼저, 이야기 페이지를 읽는 순서대로 올려 주세요.
        <br />
        제목·저자·출판사·ISBN과 페이지별 본문을 서버 DB에 보관합니다.
      </p>

      {!draftPages.length && (
        <label className="scan-box">
          <span>
            <Camera />
          </span>
          <strong>표지와 책 페이지 고르기</strong>
          <small>첫 번째 사진은 표지 · 최대 40장</small>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
          />
        </label>
      )}

      {draftPages.length > 0 && (
        <section className="book-upload-draft" aria-label="등록할 책 사진">
          <div className="upload-draft-heading">
            <div>
              <strong>사진 {draftPages.length}장</strong>
              <span>왼쪽부터 읽는 순서예요.</span>
            </div>
            <label className={`mini-action ${draftPages.length >= 40 ? "disabled" : ""}`}>
              <Plus size={16} /> 사진 추가
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isWorking || draftPages.length >= 40}
                onChange={addImages}
              />
            </label>
          </div>
          <div className="page-preview-strip">
            {draftPages.map((page, index) => (
              <div className="page-preview" key={`${page.file.name}-${index}`}>
                <img src={page.url} alt={`${index + 1}번째 책 사진`} />
                <span>{index === 0 ? "표지" : index + 1}</span>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => removeImage(index)}
                  aria-label={`${index + 1}번째 사진 삭제`}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          {!registeredBook && scanState !== "error" && (
            <button
              type="button"
              className="primary wide register-book-button"
              disabled={isWorking}
              onClick={submit}
            >
              {isWorking ? scanCopy[scanState] : "이 책 등록하고 분석하기"}
              {!isWorking && <ChevronRight size={18} />}
            </button>
          )}
        </section>
      )}

      {isWorking && (
        <div className="registration-progress" role="status" aria-live="polite">
          <i />
          <div>
            <strong>{scanCopy[scanState]}</strong>
            <span>창을 닫지 않아도 서버에서 페이지별로 정리해요.</span>
          </div>
        </div>
      )}

      {scanState === "complete" && registeredBook && (
        <div className="scan-result registration-result">
          <div>
            <Check />
            <span>
              <strong>{registeredBook.title || "책"}을 DB에 저장했어요</strong>
              <small>
                {registeredBook.publisher || "출판사 확인 필요"} · 사진 {registeredBook.pageCount}장
              </small>
            </span>
          </div>
          <dl>
            <div>
              <dt>글</dt>
              <dd>{registeredBook.authors || "확인 필요"}</dd>
            </div>
            <div>
              <dt>그림</dt>
              <dd>{registeredBook.illustrators || "확인 필요"}</dd>
            </div>
            <div>
              <dt>출판사</dt>
              <dd>{registeredBook.publisher || "확인 필요"}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{registeredBook.isbn || "사진에서 찾지 못함"}</dd>
            </div>
            <div>
              <dt>본문</dt>
              <dd>{textLength.toLocaleString()}자 저장</dd>
            </div>
          </dl>
          <button type="button" className="secondary wide" onClick={reset}>
            <RotateCcw size={18} /> 다른 책 등록하기
          </button>
        </div>
      )}

      {scanState === "needs_configuration" && registeredBook && (
        <div className="scan-result registration-waiting">
          <div>
            <LockKeyhole />
            <span>
              <strong>사진은 저장했고 분석 설정을 기다리고 있어요</strong>
              <small>{registeredBook.errorMessage}</small>
            </span>
          </div>
          <p>
            서버에 <code>OPENAI_API_KEY</code>를 설정한 뒤 이 책의 재분석 API를 호출하면
            이어서 처리할 수 있어요.
          </p>
          <button type="button" className="secondary wide" onClick={reset}>
            다른 책 등록하기
          </button>
        </div>
      )}

      {scanState === "error" && (
        <div className="scan-result registration-error" role="alert">
          <div>
            <X />
            <span>
              <strong>책을 등록하지 못했어요</strong>
              <small>{scanError}</small>
            </span>
          </div>
          <button type="button" className="primary wide" onClick={submit}>
            다시 시도하기
          </button>
        </div>
      )}

      <label className="scan-box compact-scan-box">
        <Camera />
        <span>
          <strong>사진 촬영으로 한 장 더 추가</strong>
          <small>여러 번 촬영해도 기존 사진 뒤에 이어져요.</small>
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={isWorking || draftPages.length >= 40}
          onChange={addImages}
        />
      </label>

      <div className="safety">
        <LockKeyhole />
        <p>
          <strong>등록한 책은 바로 아이에게 공개되지 않아요.</strong>
          <br />
          본문과 책 정보를 저장한 뒤 보호자 검수와 퀴즈 생성 단계를 거칩니다.
        </p>
      </div>
    </div>
  );
}

const cloneQuestionForReview = (question) => ({
  ...question,
  options: question.options ? [...question.options] : undefined,
  prompts: question.prompts ? [...question.prompts] : undefined,
  items: question.items?.map((item) => ({ ...item })),
  leftItems: question.leftItems?.map((item) => ({ ...item })),
  rightItems: question.rightItems?.map((item) => ({ ...item })),
  answer: Array.isArray(question.answer)
    ? [...question.answer]
    : question.answer && typeof question.answer === "object"
      ? { ...question.answer }
      : question.answer,
});

const isReviewQuestionValid = (question) => {
  const hasCopy = question.q.trim().length > 0 && question.why.trim().length > 0;
  const kind = questionKind(question);
  if (kind === "completion") {
    return (
      hasCopy &&
      question.sentence.trim().includes("____") &&
      question.options.every((option) => option.trim().length > 0) &&
      question.answer >= 0 &&
      question.answer < question.options.length
    );
  }
  if (isReflectiveQuestion(question)) {
    const hasPrompts =
      Array.isArray(question.prompts) &&
      question.prompts.length > 0 &&
      question.prompts.every((prompt) => prompt.trim().length > 0);
    const hasRecallSupport =
      kind !== "recall" ||
      (question.hint?.trim().length > 0 &&
        question.exampleAnswer?.trim().length > 0);
    return hasCopy && hasPrompts && hasRecallSupport;
  }
  if (kind === "sequence") {
    const itemIds = question.items.map((item) => item.id);
    return (
      hasCopy &&
      question.items.every((item) => item.label.trim().length > 0) &&
      question.answer.length === itemIds.length &&
      new Set(question.answer).size === itemIds.length &&
      question.answer.every((id) => itemIds.includes(id))
    );
  }
  if (kind === "match") {
    const rightIds = question.rightItems.map((item) => item.id);
    return (
      hasCopy &&
      question.leftItems.every(
        (item) =>
          item.label.trim().length > 0 && rightIds.includes(question.answer[item.id]),
      ) &&
      question.rightItems.every((item) => item.label.trim().length > 0) &&
      new Set(Object.values(question.answer)).size === question.leftItems.length
    );
  }
  return (
    hasCopy &&
    question.options.every((option) => option.trim().length > 0) &&
    question.answer >= 0 &&
    question.answer < question.options.length
  );
};

function ReviewDraft({ book, back, publish }) {
  const [draft, setDraft] = useState(() => ({
    ...book,
    questions: book.questions.map(cloneQuestionForReview),
  }));
  const [approved, setApproved] = useState(() =>
    Array(book.questions.length).fill(false),
  );

  const validQuestions = useMemo(
    () => draft.questions.map(isReviewQuestionValid),
    [draft.questions],
  );
  const approvedCount = approved.filter(Boolean).length;
  const canPublish =
    approvedCount === draft.questions.length && validQuestions.every(Boolean);

  const updateQuestion = (index, changes) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...changes } : question,
      ),
    }));
    setApproved((current) =>
      current.map((isApproved, questionIndex) =>
        questionIndex === index ? false : isApproved,
      ),
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const options = [...draft.questions[questionIndex].options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  const updatePrompt = (questionIndex, promptIndex, value) => {
    const prompts = [...draft.questions[questionIndex].prompts];
    prompts[promptIndex] = value;
    updateQuestion(questionIndex, { prompts });
  };

  const updateSequenceAnswer = (questionIndex, orderIndex, itemId) => {
    const answer = [...draft.questions[questionIndex].answer];
    answer[orderIndex] = itemId;
    updateQuestion(questionIndex, { answer });
  };

  const updateMatchAnswer = (questionIndex, leftId, rightId) => {
    updateQuestion(questionIndex, {
      answer: {
        ...draft.questions[questionIndex].answer,
        [leftId]: rightId,
      },
    });
  };

  const approveAll = () => setApproved(validQuestions.map(Boolean));

  return (
    <form
      className="page review-page"
      data-allow-native-editing="true"
      onSubmit={(event) => {
        event.preventDefault();
        if (canPublish) publish(draft);
      }}
    >
      <Back onClick={back} label="검수 나가기" />
      <div className="review-heading">
        <div>
          <span className="eyebrow">보호자 확인함 · 생성 초안</span>
          <h1>
            아이에게 보여 주기 전
            <br />한 번만 확인해 주세요
          </h1>
        </div>
        <div className="review-score" aria-label={`${approvedCount}개 확인 완료`}>
          <strong>{approvedCount}</strong>
          <span>/ {draft.questions.length}</span>
        </div>
      </div>

      <div className="review-book">
        <BookCover book={book} className="review-cover" />
        <div>
          <span>분석된 책</span>
          <strong>{book.title}</strong>
          <p>
            지금은 샘플 책으로 검수 동작을 시험합니다. 실제 자동 생성 버전에서는
            촬영한 페이지의 근거가 함께 표시됩니다.
          </p>
        </div>
      </div>

      <div className="review-toolbar">
        <div>
          <strong>문제 {draft.questions.length}개</strong>
          <span>문장·정답·설명을 확인하세요.</span>
        </div>
        <button type="button" className="mini-action" onClick={approveAll}>
          <Check size={16} /> 모두 확인
        </button>
      </div>

      <div className="review-list">
        {draft.questions.map((question, questionIndex) => (
          <details
            className={`review-question ${approved[questionIndex] ? "approved" : ""}`}
            key={questionIndex}
          >
            <summary>
              <span>{questionIndex + 1}</span>
              <div>
                <small>{question.method} · {question.type}</small>
                <strong>{question.q || "질문을 입력해 주세요."}</strong>
              </div>
              <i>{approved[questionIndex] ? "확인됨" : "확인 필요"}</i>
            </summary>
            <div className="review-fields">
              <label>
                <span>질문</span>
                <textarea
                  rows="2"
                  value={question.q}
                  onChange={(event) =>
                    updateQuestion(questionIndex, { q: event.target.value })
                  }
                />
              </label>
              {(questionKind(question) === "choice" ||
                questionKind(question) === "image-choice" ||
                questionKind(question) === "completion") && (
                <fieldset>
                  <legend>선택지와 정답</legend>
                  <p>정답으로 공개할 선택지의 동그라미를 골라 주세요.</p>
                  {question.options.map((option, optionIndex) => (
                    <label className="review-option" key={optionIndex}>
                      <input
                        type="radio"
                        name={`answer-${questionIndex}`}
                        checked={question.answer === optionIndex}
                        onChange={() =>
                          updateQuestion(questionIndex, { answer: optionIndex })
                        }
                      />
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      <input
                        type="text"
                        value={option}
                        aria-label={`${questionIndex + 1}번 문제 ${optionIndex + 1}번 선택지`}
                        onChange={(event) =>
                          updateOption(questionIndex, optionIndex, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </fieldset>
              )}
              {questionKind(question) === "completion" && (
                <label>
                  <span>빈칸 문장</span>
                  <textarea
                    rows="2"
                    value={question.sentence}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        sentence: event.target.value,
                      })
                    }
                  />
                  <small>빈칸 자리에 밑줄 네 개(____)를 남겨 주세요.</small>
                </label>
              )}
              {isReflectiveQuestion(question) && (
                <fieldset className="review-structured">
                  <legend>말하기 도움 카드</legend>
                  <p>아이의 말문을 열어 줄 문장이나 활동 확인 문구예요.</p>
                  {question.prompts.map((prompt, promptIndex) => (
                    <label key={promptIndex}>
                      <span>{promptIndex + 1}</span>
                      <input
                        type="text"
                        value={prompt}
                        aria-label={`${questionIndex + 1}번 문제 ${promptIndex + 1}번 말하기 도움`}
                        onChange={(event) =>
                          updatePrompt(
                            questionIndex,
                            promptIndex,
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  ))}
                </fieldset>
              )}
              {question.hint !== undefined && (
                <label>
                  <span>기억이 막힐 때 보여 줄 힌트</span>
                  <textarea
                    rows="2"
                    value={question.hint}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { hint: event.target.value })
                    }
                  />
                </label>
              )}
              {question.exampleAnswer !== undefined && (
                <label>
                  <span>활동 뒤 보여 줄 책 속 기억 예시</span>
                  <textarea
                    rows="2"
                    value={question.exampleAnswer}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        exampleAnswer: event.target.value,
                      })
                    }
                  />
                </label>
              )}
              {questionKind(question) === "sequence" && (
                <fieldset className="review-structured">
                  <legend>정답 순서</legend>
                  <p>각 자리에서 먼저 일어날 장면부터 차례대로 골라 주세요.</p>
                  {question.answer.map((itemId, orderIndex) => (
                    <label key={orderIndex}>
                      <span>{orderIndex + 1}</span>
                      <select
                        value={itemId}
                        aria-label={`${orderIndex + 1}번째 장면`}
                        onChange={(event) =>
                          updateSequenceAnswer(
                            questionIndex,
                            orderIndex,
                            event.target.value,
                          )
                        }
                      >
                        {question.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </fieldset>
              )}
              {questionKind(question) === "match" && (
                <fieldset className="review-structured">
                  <legend>짝 연결 정답</legend>
                  <p>왼쪽 카드마다 알맞은 오른쪽 카드를 골라 주세요.</p>
                  {question.leftItems.map((left) => (
                    <label className="match-review-row" key={left.id}>
                      <strong>{left.label}</strong>
                      <select
                        value={question.answer[left.id]}
                        aria-label={`${left.label}의 연결 정답`}
                        onChange={(event) =>
                          updateMatchAnswer(
                            questionIndex,
                            left.id,
                            event.target.value,
                          )
                        }
                      >
                        {question.rightItems.map((right) => (
                          <option key={right.id} value={right.id}>
                            {right.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </fieldset>
              )}
              <label>
                <span>아이에게 보여 줄 책 속 단서</span>
                <textarea
                  rows="2"
                  value={question.why}
                  onChange={(event) =>
                    updateQuestion(questionIndex, { why: event.target.value })
                  }
                />
              </label>
              <label className="approve-check">
                <input
                  type="checkbox"
                  checked={approved[questionIndex]}
                  disabled={!validQuestions[questionIndex]}
                  onChange={(event) =>
                    setApproved((current) =>
                      current.map((value, index) =>
                        index === questionIndex ? event.target.checked : value,
                      ),
                    )
                  }
                />
                <span>
                  <strong>이 문제를 확인했어요</strong>
                  <small>수정하면 다시 확인해야 해요.</small>
                </span>
              </label>
            </div>
          </details>
        ))}
      </div>

      <div className="publish-bar">
        <div>
          <LockKeyhole size={18} />
          <span>
            <strong>{approvedCount}개 확인 완료</strong>
            <small>모든 문제를 확인해야 공개할 수 있어요.</small>
          </span>
        </div>
        <button className="primary" type="submit" disabled={!canPublish}>
          아이에게 공개하기 <ChevronRight size={18} />
        </button>
      </div>
    </form>
  );
}

function Profile({ childPhoto, upload }) {
  return (
    <div className="page profile">
      <span className="eyebrow">내가 이야기 속으로</span>
      <h1>
        나만의 모리를
        <br />
        만들어 봐요
      </h1>
      <p>
        사진은 캐릭터를 꾸미는 데만 사용하고 이 기기 밖으로 보내지 않는 MVP
        미리보기예요.
      </p>
      <div className="story-preview">
        <div className="cloud one" />
        <div className="cloud two" />
        <div className="photo-character">
          {childPhoto ? (
            <img src={childPhoto} alt="아이 사진 미리보기" />
          ) : (
            <UserRound />
          )}
          <span>탐험가</span>
        </div>
        <img
          className="mori-small"
          src={asset("assets/mori-mascot.png")}
          alt="모리"
        />
        <div className="speech">
          우리 같이 책 속<br />
          단서를 찾자!
        </div>
      </div>
      <label className="upload-btn">
        <Camera /> {childPhoto ? "다른 사진 고르기" : "아이 사진으로 시작하기"}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => upload(e, "child")}
        />
      </label>
      <div className="coming">
        <Sparkles />
        <div>
          <strong>다음 버전에서</strong>
          <p>
            아이 얼굴 특징을 바탕으로 안전한 일러스트 캐릭터를 만들고, 책의 핵심
            장면을 새롭게 구성한 참여형 이야기로 확장해요.
          </p>
        </div>
      </div>
    </div>
  );
}

enableKidSafeInteractions();

createRoot(document.getElementById("root")).render(<App />);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`),
  );
}
