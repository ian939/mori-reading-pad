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
    questions: [
      {
        kind: "choice",
        skill: "retrieve",
        type: "내용 찾기",
        q: "오영이의 방에 불쑥 들어온 친구는 누구였나요?",
        options: [
          "말하는 저금통 또보",
          "노래하는 라디오",
          "커다란 공룡",
          "사탕 가게 주인",
        ],
        answer: 0,
        why: "이야기의 시작에서 저금통 또보가 오영이 방에 찾아왔어요.",
      },
      {
        kind: "choice",
        skill: "retrieve",
        type: "내용 찾기",
        q: "또보가 보여 준 동전과 지폐의 모습으로 알맞은 것은?",
        options: [
          "동전은 둥글고 단단하며, 지폐는 네모난 종이 모양이에요.",
          "동전과 지폐는 모두 똑같은 크기의 세모 모양이에요.",
          "동전은 종이이고, 지폐는 금속으로 만들어요.",
          "동전과 지폐에는 아무 숫자도 없어요.",
        ],
        answer: 0,
        why: "또보는 둥글고 단단한 동전과 네모난 지폐를 보여 주었어요.",
      },
      {
        kind: "choice",
        skill: "vocabulary",
        type: "낱말 이해",
        q: "물건에 붙은 “가격”은 무엇을 알려 줄까요?",
        options: [
          "물건의 무게",
          "물건을 살 때 필요한 돈",
          "만든 사람의 나이",
          "가게 문 닫는 시간",
        ],
        answer: 1,
        why: "가격은 그 물건을 사려면 돈이 얼마나 필요한지 알려 줘요.",
      },
      {
        kind: "match",
        skill: "connect",
        type: "생각 잇기",
        q: "이야기 속 행동과 돈의 쓰임을 알맞게 연결해 보세요.",
        leftItems: [
          { id: "candy", emoji: "🍬", label: "사탕을 산다" },
          { id: "ride", emoji: "🎡", label: "놀이기구를 탄다" },
          { id: "chores", emoji: "🧹", label: "집안일을 돕고 용돈을 받는다" },
        ],
        rightItems: [
          { id: "earn", label: "일을 하고 돈을 벌어요" },
          { id: "goods", label: "물건을 사요" },
          { id: "service", label: "서비스를 이용해요" },
        ],
        answer: {
          candy: "goods",
          ride: "service",
          chores: "earn",
        },
        why: "돈으로 물건을 사거나 서비스를 이용할 수 있고, 일을 한 대가로 돈을 벌기도 해요.",
      },
      {
        kind: "choice",
        skill: "infer",
        type: "까닭 추론",
        q: "또보가 친구들이 그린 돈을 쓸 수 없다고 말한 까닭은?",
        options: [
          "색연필이 너무 짧아서",
          "진짜 돈은 일을 해서 벌어야 하고, 그린 돈은 가짜라서",
          "종이가 너무 커서",
          "친구들이 숫자를 몰라서",
        ],
        answer: 1,
        why: "친구들이 마음대로 그린 가짜 돈은 사용할 수 없고, 진짜 돈은 일을 한 대가로 얻어요.",
      },
      {
        kind: "sequence",
        skill: "sequence",
        type: "순서 이해",
        q: "이야기의 흐름에 맞게 장면을 차례대로 눌러 보세요.",
        items: [
          { id: "work", emoji: "💼", label: "또보가 돈은 일을 해서 번다고 알려 줘요." },
          { id: "enter", emoji: "🐷", label: "또보가 오영이의 방에 들어와요." },
          { id: "save", emoji: "🪙", label: "오영이가 또보에게 동전을 넣어요." },
          { id: "show", emoji: "💵", label: "또보가 동전과 지폐를 보여 줘요." },
        ],
        answer: ["enter", "show", "work", "save"],
        why: "또보가 방에 찾아와 돈을 보여 주고, 돈을 버는 방법을 설명한 뒤 오영이가 동전을 넣어요.",
      },
      {
        kind: "image-choice",
        skill: "visual-infer",
        type: "그림 추론",
        q: "그림 속 아이가 사탕을 사기 전에 가장 먼저 확인해야 할 것은?",
        visual: asset("assets/money-situation-v1.png"),
        visualAlt: "동전을 들고 사탕 기계 앞에서 생각하는 아이",
        options: [
          "사탕의 가격과 내가 가진 돈",
          "강아지의 꼬리 길이",
          "가게 지붕의 색깔",
          "구름이 움직이는 방향",
        ],
        answer: 0,
        why: "물건을 사기 전에는 가격을 보고 내가 가진 돈으로 살 수 있는지 확인해야 해요.",
      },
      {
        kind: "choice",
        skill: "numeracy",
        type: "수리 문해",
        q: "사탕 1개가 100원이라면 1,000원으로 몇 개를 살 수 있을까요?",
        options: ["1개", "5개", "10개", "100개"],
        answer: 2,
        why: "100원이 10번 모이면 1,000원이므로 사탕 10개를 살 수 있어요.",
      },
      {
        kind: "choice",
        skill: "apply",
        type: "생활 적용",
        q: "사고 싶은 장난감이 있지만 돈이 부족할 때 가장 알맞은 행동은?",
        options: [
          "몰래 가져온다",
          "필요한 만큼 차근차근 모은다",
          "아무 물건이나 산다",
          "가격표를 떼어 낸다",
        ],
        answer: 1,
        why: "이야기처럼 목표를 정하고 저축하면 기다림과 선택을 배울 수 있어요.",
      },
      {
        kind: "choice",
        skill: "summarize",
        type: "중심 생각",
        q: "이 책의 내용을 가장 잘 정리한 문장은 무엇일까요?",
        options: [
          "돈은 그림으로 만들어 마음대로 쓸 수 있어요.",
          "돈은 일을 통해 벌고, 물건이나 서비스에 쓰거나 저축할 수 있어요.",
          "돈은 장난감 친구들에게만 필요해요.",
          "돈은 크기가 클수록 언제나 더 값져요.",
        ],
        answer: 1,
        why: "이 책은 돈을 버는 방법과 돈의 쓰임, 그리고 저축을 함께 알려 줘요.",
      },
    ],
  },
  {
    id: "origin",
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
        kind: "choice",
        skill: "retrieve",
        type: "내용 찾기",
        q: "우주 친구들이 지구에서 가장 먼저 궁금해한 것은?",
        options: [
          "음식이 어디서 왔는지",
          "자동차가 빠른 이유",
          "별이 빛나는 이유",
          "집을 짓는 방법",
        ],
        answer: 0,
        why: "친구들은 마트의 맛있는 음식이 어디에서 왔는지 궁금해했어요.",
      },
      {
        kind: "choice",
        skill: "retrieve",
        type: "내용 찾기",
        q: "배추의 여행이 가장 먼저 시작된 곳은 어디인가요?",
        options: [
          "흙에 심은 작은 씨앗",
          "마트의 계산대",
          "식탁 위 접시",
          "냉장고 안",
        ],
        answer: 0,
        why: "배추는 밭의 흙에 심은 작은 씨앗에서 여행을 시작해요.",
      },
      {
        kind: "choice",
        skill: "vocabulary",
        type: "낱말 이해",
        q: "“재료”와 뜻이 가장 가까운 것은?",
        options: [
          "음식을 만드는 데 쓰는 것",
          "음식을 파는 사람",
          "음식을 담는 방",
          "음식을 먹는 시간",
        ],
        answer: 0,
        why: "재료는 다른 물건이나 음식을 만들 때 바탕으로 쓰는 것이에요.",
      },
      {
        kind: "match",
        skill: "connect",
        type: "생각 잇기",
        q: "음식과 여행이 시작된 곳을 알맞게 연결해 보세요.",
        leftItems: [
          { id: "cabbage", emoji: "🥬", label: "배추" },
          { id: "egg", emoji: "🥚", label: "달걀" },
          { id: "milk", emoji: "🥛", label: "우유" },
        ],
        rightItems: [
          { id: "cow", label: "젖소 농장" },
          { id: "field", label: "배추밭" },
          { id: "chicken", label: "닭이 있는 양계장" },
        ],
        answer: {
          cabbage: "field",
          egg: "chicken",
          milk: "cow",
        },
        why: "배추는 밭에서, 달걀은 닭을 기르는 양계장에서, 우유는 젖소 농장에서 출발해요.",
      },
      {
        kind: "choice",
        skill: "infer",
        type: "까닭 추론",
        q: "농장에서 모은 우유를 치즈 공장으로 보내는 까닭은 무엇일까요?",
        options: [
          "우유로 치즈를 만들기 위해서",
          "트럭의 색을 바꾸기 위해서",
          "젖소에게 우유를 돌려주기 위해서",
          "밭에 우유를 뿌리기 위해서",
        ],
        answer: 0,
        why: "젖소에게서 얻은 우유는 공장에서 치즈를 만드는 중요한 재료가 돼요.",
      },
      {
        kind: "sequence",
        skill: "sequence",
        type: "순서 이해",
        q: "토마토가 케첩이 되어 우리에게 오는 순서대로 눌러 보세요.",
        items: [
          { id: "market", emoji: "🛒", label: "케첩이 마트에 도착해요." },
          { id: "grow", emoji: "🍅", label: "토마토가 농장에서 자라요." },
          { id: "factory", emoji: "🏭", label: "공장에서 토마토를 케첩으로 만들어요." },
          { id: "truck", emoji: "🚚", label: "잘 익은 토마토를 트럭에 실어요." },
        ],
        answer: ["grow", "truck", "factory", "market"],
        why: "농장에서 자란 토마토를 트럭으로 옮겨 공장에서 케첩으로 만든 뒤 마트로 보내요.",
      },
      {
        kind: "image-choice",
        skill: "visual-infer",
        type: "그림 추론",
        q: "그림 속 장면 다음에 일어날 일로 가장 알맞은 것은?",
        visual: asset("assets/origin-situation-v1.png"),
        visualAlt: "농부가 젖소 농장에서 우유통을 냉장 트럭에 싣는 장면",
        options: [
          "냉장 트럭이 우유를 치즈 공장으로 옮겨요.",
          "농부가 우유통을 다시 비워 버려요.",
          "젖소가 트럭을 타고 마트에 가요.",
          "우유통으로 배추를 심어요.",
        ],
        answer: 0,
        why: "농장에서 모은 우유는 상하지 않도록 차갑게 운반되어 치즈 같은 음식의 재료가 돼요.",
      },
      {
        kind: "choice",
        skill: "infer",
        type: "생각 추론",
        q: "치즈, 빵, 배추, 토마토가 한곳에 모인 까닭은 무엇일까요?",
        options: [
          "함께 샌드위치의 재료가 되기 위해서",
          "각자 다시 농장으로 돌아가기 위해서",
          "누가 더 무거운지 겨루기 위해서",
          "마트 문을 닫기 위해서",
        ],
        answer: 0,
        why: "서로 다른 곳에서 온 재료들이 모여 하나의 샌드위치가 돼요.",
      },
      {
        kind: "choice",
        skill: "apply",
        type: "생활 적용",
        q: "사과 주스가 어디서 왔는지 알고 싶을 때 가장 좋은 질문은?",
        options: [
          "사과는 어디에서 자랐나요?",
          "병은 무슨 색인가요?",
          "누가 먼저 마실까요?",
          "냉장고는 얼마나 큰가요?",
        ],
        answer: 0,
        why: "재료의 출발점을 물으면 음식이 우리에게 오는 과정을 추적할 수 있어요.",
      },
      {
        kind: "choice",
        skill: "summarize",
        type: "중심 생각",
        q: "이 책의 중심 생각을 가장 잘 나타낸 문장은 무엇일까요?",
        options: [
          "모든 음식은 처음부터 마트에서 생겨나요.",
          "음식은 농장과 공장, 운반 과정을 거쳐 우리 식탁에 와요.",
          "음식은 색깔이 같으면 모두 같은 곳에서 와요.",
          "트럭은 음식보다 먼저 밭에서 자라요.",
        ],
        answer: 1,
        why: "책은 여러 음식이 어디서 시작해 어떤 과정을 거쳐 식탁에 오는지 보여 줘요.",
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

const isQuestionComplete = (question, response) => {
  const kind = questionKind(question);
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
  if (kind === "sequence") {
    return `${question.q}. 장면 카드. ${question.items.map((item) => item.label).join(". ")}`;
  }
  if (kind === "match") {
    return `${question.q}. 왼쪽 카드. ${question.leftItems.map((item) => item.label).join(". ")}. 오른쪽 카드. ${question.rightItems.map((item) => item.label).join(". ")}`;
  }
  return `${question.q}. ${question.options.map((option, index) => `${index + 1}번, ${option}`).join(". ")}`;
};

const quizStage = (index) => {
  if (index < 3) return "단서 찾기";
  if (index < 7) return "생각 탐험";
  return "마지막 열쇠";
};

const loadBooks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("mori-reviewed-books"));
    if (!Array.isArray(saved)) return DEFAULT_BOOKS;
    return DEFAULT_BOOKS.map((book) => {
      const reviewed = saved.find((item) => item.id === book.id);
      const validQuestions =
        Array.isArray(reviewed?.questions) &&
        reviewed.questions.length === book.questions.length;
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
  const [draftImage, setDraftImage] = useState("");
  const [scanState, setScanState] = useState("idle");
  const [childPhoto, setChildPhoto] = useState("");
  const [reviewOrigin, setReviewOrigin] = useState("detail");
  const topRef = useRef(null);
  const scanTimerRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const selected = books.find((book) => book.id === selectedId) || books[0];

  useEffect(() => {
    localStorage.setItem("mori-progress", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem(
      "mori-reviewed-books",
      JSON.stringify(books.map(({ id, questions }) => ({ id, questions }))),
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
      clearTimeout(scanTimerRef.current);
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
      isQuestionCorrect(question, choice),
    ]);
    setView("feedback");
  };
  const next = () => {
    if (quizIndex < selected.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setChoice(null);
      setView("quiz");
    } else {
      const correct = answers.filter(Boolean).length;
      const total = selected.questions.length;
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
  const upload = (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);
    if (kind === "book") {
      releasePreview(draftImage);
      setDraftImage(url);
      setScanState("scanning");
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(() => setScanState("done"), 1500);
    } else {
      releasePreview(childPhoto);
      setChildPhoto(url);
    }
    event.target.value = "";
  };

  const publishDraft = (reviewedBook) => {
    setBooks((current) =>
      current.map((book) => (book.id === reviewedBook.id ? reviewedBook : book)),
    );
    setSelectedId(reviewedBook.id);
    releasePreview(draftImage);
    setDraftImage("");
    setScanState("idle");
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
            correct={answers.filter(Boolean).length}
            go={go}
          />
        )}
        {view === "library" && (
          <LibraryView books={books} progress={progress} go={go} />
        )}
        {view === "add" && (
          <AddBook
            draftImage={draftImage}
            scanState={scanState}
            book={selected}
            upload={upload}
            review={() => openReview(selected, "add")}
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
          정답 확인하기
        </button>
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
function Result({ book, correct, go }) {
  const score = correct;
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
          <span>나의 기록</span>
          <strong>
            {score} / {book.questions.length}
          </strong>
          <div className="stars">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                fill="currentColor"
                className={i < starsForScore(score, book.questions.length) ? "on" : ""}
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
function AddBook({ draftImage, scanState, book, upload, review }) {
  return (
    <div className="page add-page">
      <span className="eyebrow">새 모험 만들기</span>
      <h1>
        책을 찍으면
        <br />
        퀴즈가 태어나요
      </h1>
      <p>
        표지와 이야기 페이지를 순서대로 찍어 주세요.
        <br />
        지금은 현재 선택한 샘플 책으로 연결되는 MVP 체험 모드예요.
      </p>
      <label className={`scan-box ${draftImage ? "has-image" : ""}`}>
        {draftImage ? (
          <img src={draftImage} alt="촬영한 책 미리보기" />
        ) : (
          <>
            <span>
              <Camera />
            </span>
            <strong>책 표지 찍기</strong>
            <small>밝은 곳에서 책 전체가 보이게</small>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => upload(e, "book")}
        />
        {scanState === "scanning" && (
          <div className="scanning">
            <i />
            <strong>책 제목과 내용을 살펴보는 중…</strong>
          </div>
        )}
      </label>
      {scanState === "done" && (
        <div className="scan-result">
          <div>
            <Check />
            <span>
              <strong>{book.title} 문제 초안을 만들었어요</strong>
              <small>체험용 분석 결과 · 예상 단계 초등 1–2학년</small>
            </span>
          </div>
          <ul>
            <li>단서 찾기 3개</li>
            <li>생각 탐험 4개</li>
            <li>마지막 열쇠 3개</li>
          </ul>
          <button className="primary wide" onClick={review}>
            문제 초안 확인하기 <ChevronRight size={18} />
          </button>
        </div>
      )}
      <div className="safety">
        <LockKeyhole />
        <p>
          <strong>아이용 퀴즈는 바로 공개되지 않아요.</strong>
          <br />
          자동 생성 후 보호자가 정답과 표현을 확인해야 합니다.
        </p>
      </div>
    </div>
  );
}

const cloneQuestionForReview = (question) => ({
  ...question,
  options: question.options ? [...question.options] : undefined,
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
                <small>{question.type}</small>
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
                questionKind(question) === "image-choice") && (
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
