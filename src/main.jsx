import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Headphones,
  Home,
  Library,
  LockKeyhole,
  Mic,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Trash2,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import {
  loadRecordings,
  removeRecording,
  saveRecording,
} from "./audioStore";
import { getRegisteredBook, registerBook } from "./bookApi";
import { generateCharacterVariations } from "./characterApi";
import { enableKidSafeInteractions } from "./kidSafeInteractions";
import {
  clearCharacterVariants,
  loadCharacterVariants,
  loadProfilePhoto,
  saveCharacterVariants,
  saveProfilePhoto,
} from "./profileMediaStore";
import {
  getCurrentUser,
  loadChildProfile,
  readUserJson,
  readUserText,
  saveChildProfile,
  writeUserJson,
  writeUserText,
} from "./userDataStore";
import "./styles.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const CURRENT_USER = getCurrentUser();
const childShelfTitle = (name) => {
  const cleanName = name?.trim();
  if (!cleanName) return "모리의 책숲";
  const lastCode = cleanName.charCodeAt(cleanName.length - 1);
  const hasBatchim =
    lastCode >= 0xac00 && lastCode <= 0xd7a3 && (lastCode - 0xac00) % 28 !== 0;
  return `${cleanName}${hasBatchim ? "이" : ""}의 책장`;
};

const QUIZ_LEVELS = {
  lv1: {
    id: "lv1",
    label: "Lv.1",
    name: "차근차근 단서 찾기",
    summary: "책 속에서 답을 찾으며 이야기의 기본 흐름을 익혀요.",
    detail: "선택·연결·순서·그림 단서 중심 · 10문항 모두 바로 확인",
    stages: ["내용 찾기", "생각 잇기", "생활 적용"],
  },
  lv2: {
    id: "lv2",
    label: "Lv.2",
    name: "깊이 생각하고 말하기",
    summary: "기억을 꺼내 설명하고 책을 나의 경험과 연결해요.",
    detail: "빈칸·회상·Wh·개방형·경험 연결 · 단서 4 + 말하기 6",
    stages: ["기억 깨우기", "생각 넓히기", "나와 잇기"],
  },
};

const LEVEL_1_QUESTIONS = {
  money: [
    {
      kind: "choice",
      skill: "retrieve",
      type: "내용 찾기",
      q: "오영이의 방에 불쑥 들어온 친구는 누구였나요?",
      options: ["말하는 저금통 또보", "노래하는 라디오", "커다란 공룡", "사탕 가게 주인"],
      answer: 0,
      why: "이야기의 시작에서 저금통 또보가 오영이 방에 찾아왔어요.",
      wrongWhy: {
        1: "노래하는 라디오는 이야기 속에 등장하지 않았어요. 방에 들어온 친구의 생김새와 말을 떠올려 봐요.",
        2: "커다란 공룡은 오영이의 방에 찾아오지 않았어요. 돈을 모을 수 있는 물건처럼 생긴 친구였어요.",
        3: "사탕 가게 주인은 오영이의 방에 들어오지 않았어요. 오영이에게 돈 이야기를 들려준 친구를 떠올려 봐요.",
      },
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
      wrongWhy: {
        1: "동전과 지폐는 똑같은 세모 모양이 아니에요. 두 돈의 서로 다른 모양을 떠올려 봐요.",
        2: "동전과 지폐의 재료를 서로 바꾸어 말했어요. 손으로 만졌을 때 단단한 돈이 무엇인지 생각해 봐요.",
        3: "동전과 지폐에는 돈의 가치를 알려 주는 숫자가 적혀 있어요.",
      },
    },
    {
      kind: "choice",
      skill: "vocabulary",
      type: "낱말 이해",
      q: "물건에 붙은 ‘가격’은 무엇을 알려 줄까요?",
      options: ["물건의 무게", "물건을 살 때 필요한 돈", "만든 사람의 나이", "가게 문 닫는 시간"],
      answer: 1,
      why: "가격은 그 물건을 사려면 돈이 얼마나 필요한지 알려 줘요.",
      wrongWhy: {
        0: "무게는 물건이 얼마나 무거운지를 알려 주지만, 살 때 필요한 돈을 알려 주지는 않아요.",
        2: "만든 사람의 나이는 물건을 사는 데 필요한 돈의 양과 관계가 없어요.",
        3: "가게 문 닫는 시간은 영업시간이고, 물건에 붙은 가격의 뜻은 아니에요.",
      },
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
      answer: { candy: "goods", ride: "service", chores: "earn" },
      why: "돈으로 물건을 사거나 서비스를 이용할 수 있고, 일을 한 대가로 돈을 벌기도 해요.",
      matchWhy: {
        candy: "사탕은 손에 들고 먹을 수 있는 물건이에요.",
        ride: "놀이기구를 타는 것은 시설이 주는 서비스를 이용하는 일이에요.",
        chores: "집안일을 돕고 용돈을 받는 것은 일을 한 대가로 돈을 버는 일이에요.",
      },
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
      wrongWhy: {
        0: "색연필의 길이는 그린 돈을 사용할 수 없는 까닭과 관계가 없어요.",
        2: "종이의 크기가 커도 마음대로 그린 돈은 진짜 돈이 되지 않아요.",
        3: "친구들이 숫자를 아는지는 그린 돈이 가짜라는 사실과 관계가 없어요.",
      },
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
      options: ["사탕의 가격과 내가 가진 돈", "강아지의 꼬리 길이", "가게 지붕의 색깔", "구름이 움직이는 방향"],
      answer: 0,
      why: "물건을 사기 전에는 가격을 보고 내가 가진 돈으로 살 수 있는지 확인해야 해요.",
      wrongWhy: {
        1: "강아지의 꼬리 길이는 사탕을 살 수 있는지 판단하는 데 필요한 정보가 아니에요.",
        2: "가게 지붕의 색깔을 알아도 사탕을 살 돈이 충분한지는 알 수 없어요.",
        3: "구름의 움직임은 사탕의 값이나 아이가 가진 돈과 관계가 없어요.",
      },
    },
    {
      kind: "choice",
      skill: "numeracy",
      type: "수리 문해",
      q: "사탕 1개가 100원이라면 1,000원으로 몇 개를 살 수 있을까요?",
      options: ["1개", "5개", "10개", "100개"],
      answer: 2,
      why: "100원이 10번 모이면 1,000원이므로 사탕 10개를 살 수 있어요.",
      wrongWhy: {
        0: "사탕 1개에는 100원만 필요해서 1,000원 중 많은 돈이 남아요.",
        1: "사탕 5개는 500원이에요. 1,000원으로는 그보다 더 살 수 있어요.",
        3: "사탕 100개에는 10,000원이 필요해서 1,000원으로는 살 수 없어요.",
      },
    },
    {
      kind: "choice",
      skill: "apply",
      type: "생활 적용",
      q: "사고 싶은 장난감이 있지만 돈이 부족할 때 가장 알맞은 행동은?",
      options: ["몰래 가져온다", "필요한 만큼 차근차근 모은다", "아무 물건이나 산다", "가격표를 떼어 낸다"],
      answer: 1,
      why: "이야기처럼 목표를 정하고 저축하면 기다림과 선택을 배울 수 있어요.",
      wrongWhy: {
        0: "돈을 내지 않고 몰래 가져오는 것은 다른 사람의 물건을 훔치는 행동이에요.",
        2: "아무 물건이나 사면 원하는 장난감을 살 돈을 모으기 더 어려워져요.",
        3: "가격표를 떼어도 장난감의 가격이나 필요한 돈은 달라지지 않아요.",
      },
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
      wrongWhy: {
        0: "책에서는 마음대로 그린 돈은 가짜라서 사용할 수 없다고 했어요.",
        2: "돈은 장난감 친구뿐 아니라 물건과 서비스를 이용하는 사람 모두에게 필요해요.",
        3: "돈의 가치는 크기가 아니라 돈에 적힌 금액으로 정해져요.",
      },
    },
  ],
  origin: [
    {
      kind: "choice",
      skill: "retrieve",
      type: "내용 찾기",
      q: "우주 친구들이 지구에서 가장 먼저 궁금해한 것은?",
      options: ["음식이 어디서 왔는지", "자동차가 빠른 이유", "별이 빛나는 이유", "집을 짓는 방법"],
      answer: 0,
      why: "친구들은 마트의 맛있는 음식이 어디에서 왔는지 궁금해했어요.",
      wrongWhy: {
        1: "친구들이 처음 궁금해한 것은 자동차의 속도가 아니었어요. 마트에서 본 것들을 떠올려 봐요.",
        2: "별은 우주 친구들에게 익숙하지만, 지구에서 처음 궁금해한 대상은 아니었어요.",
        3: "친구들은 집을 짓는 방법보다 마트에 놓인 것들의 출발점을 궁금해했어요.",
      },
    },
    {
      kind: "choice",
      skill: "retrieve",
      type: "내용 찾기",
      q: "배추의 여행이 가장 먼저 시작된 곳은 어디인가요?",
      options: ["흙에 심은 작은 씨앗", "마트의 계산대", "식탁 위 접시", "냉장고 안"],
      answer: 0,
      why: "배추는 밭의 흙에 심은 작은 씨앗에서 여행을 시작해요.",
      wrongWhy: {
        1: "마트 계산대는 배추 여행의 마지막에 가까운 곳이지 시작점이 아니에요.",
        2: "식탁 위 접시는 배추가 여러 과정을 거친 뒤 도착하는 곳이에요.",
        3: "냉장고는 다 자란 배추를 보관하는 곳이라 여행이 시작되는 곳이 아니에요.",
      },
    },
    {
      kind: "choice",
      skill: "vocabulary",
      type: "낱말 이해",
      q: "‘재료’와 뜻이 가장 가까운 것은?",
      options: ["음식을 만드는 데 쓰는 것", "음식을 파는 사람", "음식을 담는 방", "음식을 먹는 시간"],
      answer: 0,
      why: "재료는 다른 물건이나 음식을 만들 때 바탕으로 쓰는 것이에요.",
      wrongWhy: {
        1: "음식을 파는 사람은 사람을 가리키고, ‘재료’는 음식을 만드는 데 들어가는 것을 가리켜요.",
        2: "음식을 담는 방은 장소이고, ‘재료’는 만들 때 사용하는 것을 뜻해요.",
        3: "음식을 먹는 시간은 때를 나타내므로 ‘재료’의 뜻과 달라요.",
      },
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
      answer: { cabbage: "field", egg: "chicken", milk: "cow" },
      why: "배추는 밭에서, 달걀은 닭을 기르는 양계장에서, 우유는 젖소 농장에서 출발해요.",
      matchWhy: {
        cabbage: "배추는 흙에 심은 씨앗에서 자라는 채소예요.",
        egg: "달걀은 닭이 낳기 때문에 닭을 기르는 곳에서 출발해요.",
        milk: "우유는 젖소에게서 얻어요.",
      },
    },
    {
      kind: "choice",
      skill: "infer",
      type: "까닭 추론",
      q: "농장에서 모은 우유를 치즈 공장으로 보내는 까닭은 무엇일까요?",
      options: ["우유로 치즈를 만들기 위해서", "트럭의 색을 바꾸기 위해서", "젖소에게 우유를 돌려주기 위해서", "밭에 우유를 뿌리기 위해서"],
      answer: 0,
      why: "젖소에게서 얻은 우유는 공장에서 치즈를 만드는 중요한 재료가 돼요.",
      wrongWhy: {
        1: "우유를 공장으로 보내는 목적은 트럭의 색을 바꾸는 일이 아니에요.",
        2: "젖소에게 돌려주려는 것이 아니라, 모은 우유로 새로운 음식을 만들려고 옮겨요.",
        3: "우유는 밭에 뿌리는 물이 아니라 치즈를 만드는 재료로 사용돼요.",
      },
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
      wrongWhy: {
        1: "농부는 모은 우유를 버리지 않고 음식의 재료로 쓰기 위해 옮겨요.",
        2: "젖소가 아니라 젖소에게서 얻은 우유가 냉장 트럭에 실려 이동해요.",
        3: "우유통은 배추를 심는 도구가 아니며, 그림에서는 트럭에 실리고 있어요.",
      },
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
      wrongWhy: {
        1: "재료들은 농장으로 돌아가려는 것이 아니라 한곳에 모여 음식이 돼요.",
        2: "재료들이 모인 까닭은 무게를 겨루기 위해서가 아니에요.",
        3: "마트 문을 닫는 일은 여러 재료가 한곳에 모인 까닭과 관계가 없어요.",
      },
    },
    {
      kind: "choice",
      skill: "apply",
      type: "생활 적용",
      q: "사과 주스가 어디서 왔는지 알고 싶을 때 가장 좋은 질문은?",
      options: ["사과는 어디에서 자랐나요?", "병은 무슨 색인가요?", "누가 먼저 마실까요?", "냉장고는 얼마나 큰가요?"],
      answer: 0,
      why: "재료의 출발점을 물으면 음식이 우리에게 오는 과정을 추적할 수 있어요.",
      wrongWhy: {
        1: "병의 색깔을 알아도 주스의 재료인 사과가 어디서 왔는지는 알 수 없어요.",
        2: "마시는 순서는 정할 수 있지만 사과 주스의 출발점을 찾는 질문은 아니에요.",
        3: "냉장고의 크기는 주스를 보관하는 곳에 대한 정보이지 사과의 고향에 대한 정보가 아니에요.",
      },
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
      wrongWhy: {
        0: "책에서는 음식이 마트에서 생기는 것이 아니라 농장과 공장에서 온다고 알려 줘요.",
        2: "색깔이 같은 음식도 재료와 출발점은 서로 다를 수 있어요.",
        3: "트럭은 밭에서 자라는 것이 아니라 다 자란 재료와 완성된 음식을 옮겨요.",
      },
    },
  ],
};

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
    publisher: "그레이트북스",
    series: "내 친구 사회공룡",
    topics: ["생활 경제", "돈", "저축"],
    storyComic: asset("assets/money-story-comic-v1.webp"),
    storySentences: [
      "오영이의 방에 말하는 저금통 또보가 찾아왔어요.",
      "또보는 둥근 동전과 네모난 지폐를 보여 주었어요.",
      "오영이는 가격과 가진 돈을 비교해야 한다는 것을 알았어요.",
      "마음대로 그린 돈은 가게에서 쓸 수 없었어요.",
      "돈은 일을 한 대가로 벌 수 있어요.",
      "진짜 돈으로 필요한 물건과 서비스를 이용할 수 있어요.",
      "오영이는 쓰지 않은 동전을 또보에게 차곡차곡 모았어요.",
      "돈을 계획해서 쓰고 모으면 원하는 일을 준비할 수 있어요.",
    ],
    creature: {
      emoji: "🐷",
      name: "저금통 또보",
      fact: "동전을 차곡차곡 모으는 든든한 저금통 친구",
    },
    quizVersion: 4,
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
    quizVersion: 4,
    title: "우리가 어디서 왔게?",
    tag: "자연 · 음식",
    cover: asset("assets/origin-cover-v2.png"),
    color: "#67a85b",
    light: "#edf7df",
    age: "6–8세",
    minutes: 13,
    desc: "우주 친구들과 마트 음식의 고향을 찾아 농장과 공장으로 출발해요.",
    publisher: "그레이트북스",
    series: "내 친구 사회공룡",
    topics: ["생산과 유통", "음식", "농장"],
    storyComic: asset("assets/origin-story-comic-v1.webp"),
    storySentences: [
      "우주 친구들은 마트의 음식이 어디에서 왔는지 궁금했어요.",
      "배추는 밭의 작은 씨앗에서 자라기 시작해요.",
      "달걀은 닭을 기르는 양계장에서 와요.",
      "우유는 젖소를 기르는 농장에서 얻어요.",
      "우유는 차갑게 지켜 공장으로 옮기고 치즈로 만들어요.",
      "토마토는 농장에서 자라 트럭을 타고 공장으로 가요.",
      "빵과 치즈, 배추와 토마토가 한곳에 모였어요.",
      "여러 사람의 손을 거친 재료는 맛있는 샌드위치가 되었어요.",
    ],
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
const questionsForLevel = (book, level) =>
  level === "lv1"
    ? book.level1Questions || LEVEL_1_QUESTIONS[book.id] || book.questions
    : book.questions;
const bookProgressKey = (bookId, level) => `${bookId}:${level}`;
const loadQuizLevel = () => {
  const saved = readUserText(
    CURRENT_USER.id,
    "quiz-level",
    "mori-quiz-level",
  );
  return QUIZ_LEVELS[saved] ? saved : "lv1";
};

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

const wrongAnswerDetails = (question, response) => {
  const kind = questionKind(question);

  if (kind === "sequence") {
    const wrongIndex = question.answer.findIndex(
      (itemId, index) => response?.[index] !== itemId,
    );
    const selectedItem = question.items.find(
      (item) => item.id === response?.[wrongIndex],
    );
    const expectedItem = question.items.find(
      (item) => item.id === question.answer[wrongIndex],
    );
    return {
      selected: `${wrongIndex + 1}번째: ${selectedItem?.label || "고른 장면"}`,
      reason: `이 장면은 ${wrongIndex + 1}번째보다 뒤에 일어나요. ${expectedItem?.label || "그보다 먼저 일어난 장면"}을 먼저 찾아볼까요?`,
    };
  }

  if (kind === "match") {
    const wrongLeft = question.leftItems.find(
      (item) => response?.pairs?.[item.id] !== question.answer[item.id],
    );
    const selectedRight = question.rightItems.find(
      (item) => item.id === response?.pairs?.[wrongLeft?.id],
    );
    const expectedRight = question.rightItems.find(
      (item) => item.id === question.answer[wrongLeft?.id],
    );
    return {
      selected: `${wrongLeft?.label || "고른 카드"} → ${selectedRight?.label || "고른 짝"}`,
      reason: `${question.matchWhy?.[wrongLeft?.id] || "두 카드가 나타내는 뜻이 서로 달라요."} 그래서 “${expectedRight?.label || "다른 뜻 카드"}”와 이어져요.`,
    };
  }

  const selected = question.options?.[response] || "고른 답";
  return {
    selected,
    reason:
      question.wrongWhy?.[response] ||
      `“${selected}”은 문제에서 묻는 내용과 맞지 않아요. 문제의 핵심 낱말과 책 속 장면을 다시 비교해 봐요.`,
  };
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

const speakKorean = (text) => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const message = new SpeechSynthesisUtterance(text);
  message.lang = "ko-KR";
  message.rate = 0.86;
  window.speechSynthesis.speak(message);
};

const formatReadDate = (value) => {
  if (!value) return "날짜 기록 전";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const quizStage = (index, level) => {
  const stageIndex = index < (level === "lv1" ? 3 : 4) ? 0 : index < 7 ? 1 : 2;
  return QUIZ_LEVELS[level].stages[stageIndex];
};

const loadBooks = () => {
  try {
    const saved = readUserJson(
      CURRENT_USER.id,
      "reviewed-books",
      null,
      "mori-reviewed-books",
    );
    if (!Array.isArray(saved)) return DEFAULT_BOOKS;
    return DEFAULT_BOOKS.map((book) => {
      const reviewed = saved.find((item) => item.id === book.id);
      const validLevel2 =
        Array.isArray(reviewed?.questions) &&
        reviewed.questions.length === book.questions.length &&
        [2, 3, 4].includes(reviewed.quizVersion);
      const defaultLevel1 = LEVEL_1_QUESTIONS[book.id];
      const validLevel1 =
        Array.isArray(reviewed?.level1Questions) &&
        reviewed.level1Questions.length === defaultLevel1.length &&
        reviewed.quizVersion === book.quizVersion;
      return {
        ...book,
        questions: validLevel2 ? reviewed.questions : book.questions,
        level1Questions: validLevel1
          ? reviewed.level1Questions
          : defaultLevel1,
      };
    });
  } catch {
    return DEFAULT_BOOKS;
  }
};

const loadProgress = () => {
  try {
    const saved = readUserJson(
      CURRENT_USER.id,
      "progress",
      null,
      "mori-progress",
    );
    const migrateKey = (key) =>
      key.includes(":") ? key : bookProgressKey(key, "lv2");
    const migrateRecord = (record) =>
      Object.fromEntries(
        Object.entries(record || {}).map(([key, value]) => [migrateKey(key), value]),
      );
    const completed = Array.isArray(saved?.completed)
      ? saved.completed.map(migrateKey)
      : [];
    const bestScores = migrateRecord(
      saved?.bestScores && typeof saved.bestScores === "object"
        ? saved.bestScores
        : {},
    );
    const bestTotals = migrateRecord(
      saved?.bestTotals && typeof saved.bestTotals === "object"
        ? saved.bestTotals
        : Object.fromEntries(
            Object.keys(bestScores).map((bookId) => [bookId, 5]),
          ),
    );
    const bookStars = migrateRecord(
      saved?.bookStars && typeof saved.bookStars === "object"
        ? saved.bookStars
        : Object.fromEntries(
            completed.map((bookId) => [
              bookId,
              starsForScore(bestScores[bookId] || 0, bestTotals[bookId] || 5),
            ]),
      ),
    );
    const readDates = migrateRecord(
      saved?.readDates && typeof saved.readDates === "object"
        ? saved.readDates
        : {},
    );
    return {
      completed,
      stars: Number.isFinite(saved?.stars) ? saved.stars : 0,
      bestScores,
      bestTotals,
      bookStars,
      readDates,
    };
  } catch {
    return {
      completed: [],
      stars: 0,
      bestScores: {},
      bestTotals: {},
      bookStars: {},
      readDates: {},
    };
  }
};

function App() {
  const [books, setBooks] = useState(loadBooks);
  const [quizLevel, setQuizLevel] = useState(loadQuizLevel);
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(DEFAULT_BOOKS[0].id);
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questionAttempts, setQuestionAttempts] = useState({});
  const [eliminatedOptions, setEliminatedOptions] = useState({});
  const [feedbackMode, setFeedbackMode] = useState("final");
  const [draftPages, setDraftPages] = useState([]);
  const [scanState, setScanState] = useState("idle");
  const [registeredBook, setRegisteredBook] = useState(null);
  const [scanError, setScanError] = useState("");
  const [childProfile, setChildProfile] = useState(() =>
    loadChildProfile(CURRENT_USER.id),
  );
  const [profileMedia, setProfileMedia] = useState({
    photoUrl: "",
    variants: [],
  });
  const [characterState, setCharacterState] = useState("idle");
  const [characterError, setCharacterError] = useState("");
  const [recordings, setRecordings] = useState({});
  const [reviewOrigin, setReviewOrigin] = useState("detail");
  const topRef = useRef(null);
  const bookPollTimerRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const recordingUrlsRef = useRef(new Set());
  const profileUrlsRef = useRef(new Set());
  const activeBooks = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        quizLevel,
        questions: questionsForLevel(book, quizLevel),
      })),
    [books, quizLevel],
  );
  const selected =
    activeBooks.find((book) => book.id === selectedId) || activeBooks[0];
  const selectedCharacter = profileMedia.variants.find(
    (variant) => variant.id === childProfile.selectedVariantId,
  );

  useEffect(() => {
    writeUserJson(CURRENT_USER.id, "progress", progress);
  }, [progress]);
  useEffect(() => {
    writeUserText(CURRENT_USER.id, "quiz-level", quizLevel);
  }, [quizLevel]);
  useEffect(() => {
    writeUserJson(
      CURRENT_USER.id,
      "reviewed-books",
      books.map((book) => ({
        id: book.id,
        quizVersion: book.quizVersion,
        questions: book.questions,
        level1Questions: questionsForLevel(book, "lv1"),
      })),
    );
  }, [books]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadProfilePhoto(CURRENT_USER.id),
      loadCharacterVariants(CURRENT_USER.id, childProfile.variantOptions),
    ])
      .then(([photo, variants]) => {
        if (cancelled) return;
        const photoUrl = photo?.blob ? URL.createObjectURL(photo.blob) : "";
        const withUrls = variants.map((variant) => ({
          ...variant,
          url: URL.createObjectURL(variant.blob),
        }));
        if (photoUrl) profileUrlsRef.current.add(photoUrl);
        withUrls.forEach((variant) => profileUrlsRef.current.add(variant.url));
        setProfileMedia({ photoUrl, variants: withUrls });
        if (withUrls.length === 8) setCharacterState("ready");
      })
      .catch(() => setCharacterError("저장된 캐릭터를 불러오지 못했어요."));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    loadRecordings(CURRENT_USER.id)
      .then((stored) => {
        if (cancelled) return;
        const withUrls = Object.fromEntries(
          Object.entries(stored).map(([id, record]) => {
            const url = URL.createObjectURL(record.blob);
            recordingUrlsRef.current.add(url);
            return [id, { ...record, url }];
          }),
        );
        setRecordings(withUrls);
      })
      .catch(() => setToast("저장된 녹음을 불러오지 못했어요."));
    return () => {
      cancelled = true;
    };
  }, []);
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
      recordingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      profileUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const releasePreview = (url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };
  const releaseProfileUrl = (url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    profileUrlsRef.current.delete(url);
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
    setQuestionAttempts({});
    setEliminatedOptions({});
    setFeedbackMode("final");
    go("story-intro", book);
  };
  const beginQuestions = () => setView("quiz");
  const selectQuizLevel = (level) => {
    if (!QUIZ_LEVELS[level] || level === quizLevel) return;
    setQuizLevel(level);
    setToast(`${QUIZ_LEVELS[level].label} · ${QUIZ_LEVELS[level].name}로 바꿨어요.`);
  };
  const openReview = (book, origin) => {
    setReviewOrigin(origin);
    go("review", book);
  };
  const answer = () => {
    const question = selected.questions[quizIndex];
    if (!isQuestionComplete(question, choice)) return;
    const correct = isQuestionCorrect(question, choice);
    const attempts = questionAttempts[quizIndex] || 0;

    if (quizLevel === "lv1" && !correct && attempts === 0) {
      setQuestionAttempts((current) => ({
        ...current,
        [quizIndex]: 1,
      }));
      if (Number.isInteger(choice)) {
        setEliminatedOptions((current) => ({
          ...current,
          [quizIndex]: [...new Set([...(current[quizIndex] || []), choice])],
        }));
      }
      setFeedbackMode("retry");
      setView("feedback");
      return;
    }

    setQuestionAttempts((current) => ({
      ...current,
      [quizIndex]: attempts + 1,
    }));
    setFeedbackMode("final");
    setAnswers((current) => [
      ...current,
      {
        correct,
        reflective: isReflectiveQuestion(question),
      },
    ]);
    setView("feedback");
  };
  const retryQuestion = () => {
    setChoice(null);
    setView("quiz");
  };
  const next = () => {
    if (quizIndex < selected.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setChoice(null);
      setFeedbackMode("final");
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
        const progressKey = bookProgressKey(selected.id, quizLevel);
        const hasPreviousScore = Number.isFinite(p.bestScores?.[progressKey]);
        const previousBest = hasPreviousScore
          ? p.bestScores[progressKey]
          : 0;
        const previousTotal = p.bestTotals?.[progressKey] || 5;
        const previousRatio = hasPreviousScore
          ? previousBest / previousTotal
          : -1;
        const isNewBest = correct / total >= previousRatio;
        const previousStars = p.bookStars?.[progressKey] || 0;
        const bestStars = Math.max(previousStars, earned);
        return {
          completed: [...new Set([...p.completed, progressKey])],
          stars: p.stars + Math.max(0, bestStars - previousStars),
          bestScores: {
            ...p.bestScores,
            [progressKey]: isNewBest ? correct : previousBest,
          },
          bestTotals: {
            ...p.bestTotals,
            [progressKey]: isNewBest ? total : previousTotal,
          },
          bookStars: {
            ...p.bookStars,
            [progressKey]: bestStars,
          },
          readDates: {
            ...p.readDates,
            [progressKey]: new Date().toISOString(),
          },
        };
      });
      setView("result");
    }
  };
  const uploadChildPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!file.type.startsWith("image/")) {
      setCharacterError("사진 파일을 골라 주세요.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setCharacterError("아이 사진은 12MB 이하로 골라 주세요.");
      return;
    }

    try {
      await saveProfilePhoto(CURRENT_USER.id, file);
      await clearCharacterVariants(
        CURRENT_USER.id,
        childProfile.variantOptions,
      );
      releaseProfileUrl(profileMedia.photoUrl);
      profileMedia.variants.forEach((variant) => releaseProfileUrl(variant.url));
      const photoUrl = URL.createObjectURL(file);
      profileUrlsRef.current.add(photoUrl);
      setProfileMedia({ photoUrl, variants: [] });
      setChildProfile((current) => {
        const next = saveChildProfile({
          ...current,
          selectedVariantId: null,
          variantOptions: [],
          completed: false,
        });
        return next;
      });
      setCharacterState("photo-ready");
      setCharacterError("");
    } catch {
      setCharacterError("사진을 이 기기에 저장하지 못했어요.");
    }
  };

  const generateChildCharacters = async () => {
    setCharacterState("generating");
    setCharacterError("");
    try {
      const photo = await loadProfilePhoto(CURRENT_USER.id);
      if (!photo?.blob) throw new Error("먼저 아이 사진을 등록해 주세요.");
      const generated = await generateCharacterVariations(photo.blob, {
        userId: CURRENT_USER.id,
      });
      if (generated.length !== 8) {
        throw new Error("캐릭터 8개를 모두 만들지 못했어요. 다시 시도해 주세요.");
      }
      await clearCharacterVariants(
        CURRENT_USER.id,
        childProfile.variantOptions,
      );
      await saveCharacterVariants(CURRENT_USER.id, generated);
      profileMedia.variants.forEach((variant) => releaseProfileUrl(variant.url));
      const withUrls = generated.map((variant) => {
        const url = URL.createObjectURL(variant.blob);
        profileUrlsRef.current.add(url);
        return { ...variant, url };
      });
      const variantOptions = generated.map(
        ({ id, label, description, mimeType }) => ({
          id,
          label,
          description,
          mimeType,
        }),
      );
      setProfileMedia((current) => ({ ...current, variants: withUrls }));
      setChildProfile((current) =>
        saveChildProfile({
          ...current,
          selectedVariantId: null,
          variantOptions,
          completed: false,
        }),
      );
      setCharacterState("ready");
    } catch (error) {
      setCharacterState("error");
      setCharacterError(error.message || "캐릭터를 만들지 못했어요.");
    }
  };

  const registerChildCharacter = ({ name, variantId }) => {
    const cleanName = name.trim().slice(0, 12);
    if (!cleanName || !profileMedia.variants.some((item) => item.id === variantId)) {
      setCharacterError("이름과 사용할 캐릭터를 골라 주세요.");
      return;
    }
    const next = saveChildProfile({
      ...childProfile,
      name: cleanName,
      selectedVariantId: variantId,
      completed: true,
    });
    setChildProfile(next);
    setCharacterError("");
    setView("home");
    setToast(`${childShelfTitle(cleanName)}이 준비됐어요!`);
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

  const storeBookRecording = async (blob) => {
    const recordingKey = bookProgressKey(selected.id, quizLevel);
    const record = await saveRecording(CURRENT_USER.id, recordingKey, blob);
    const url = URL.createObjectURL(blob);
    recordingUrlsRef.current.add(url);
    setRecordings((current) => {
      const previousUrl = current[recordingKey]?.url;
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
        recordingUrlsRef.current.delete(previousUrl);
      }
      return { ...current, [recordingKey]: { ...record, url } };
    });
  };

  const deleteBookRecording = async (book) => {
    const recordingKey = bookProgressKey(book.id, book.quizLevel);
    await removeRecording(CURRENT_USER.id, recordingKey);
    setRecordings((current) => {
      const previousUrl = current[recordingKey]?.url;
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
        recordingUrlsRef.current.delete(previousUrl);
      }
      const nextRecordings = { ...current };
      delete nextRecordings[recordingKey];
      return nextRecordings;
    });
    setToast("이 기기에 저장된 녹음을 지웠어요.");
  };

  const publishDraft = (reviewedBook) => {
    setBooks((current) =>
      current.map((book) => {
        if (book.id !== reviewedBook.id) return book;
        return reviewedBook.quizLevel === "lv1"
          ? { ...book, level1Questions: reviewedBook.questions }
          : { ...book, questions: reviewedBook.questions };
      }),
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
          <span>
            {childProfile.completed
              ? childShelfTitle(childProfile.name)
              : "모리의 책숲"}
          </span>
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
            {selectedCharacter?.url ? (
              <img
                src={selectedCharacter.url}
                alt={`${childProfile.name} 캐릭터`}
              />
            ) : (
              <UserRound size={20} />
            )}
          </button>
        </div>
      </header>
      <main>
        {view === "home" && (
          <HomeView
            books={activeBooks}
            progress={progress}
            quizLevel={quizLevel}
            go={go}
            startQuiz={startQuiz}
            childProfile={childProfile}
            character={selectedCharacter}
          />
        )}
        {view === "detail" && (
          <Detail
            book={selected}
            done={progress.completed.includes(
              bookProgressKey(selected.id, quizLevel),
            )}
            back={() => go("home")}
            start={() => startQuiz(selected)}
            review={() => openReview(selected, "detail")}
          />
        )}
        {view === "story-intro" && (
          <StoryIntro
            book={selected}
            back={() => go("detail")}
            begin={beginQuestions}
          />
        )}
        {view === "quiz" && (
          <Quiz
            book={selected}
            index={quizIndex}
            choice={choice}
            setChoice={setChoice}
            eliminatedOptions={eliminatedOptions[quizIndex] || []}
            submit={answer}
            close={() => go("detail")}
          />
        )}
        {view === "feedback" && (
          <Feedback
            q={selected.questions[quizIndex]}
            choice={choice}
            level={quizLevel}
            mode={feedbackMode}
            retry={retryQuestion}
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
            record={() => go("recording")}
          />
        )}
        {view === "recording" && (
          <StoryRecording
            book={selected}
            existing={
              recordings[bookProgressKey(selected.id, quizLevel)] || null
            }
            save={storeBookRecording}
            finish={() => go("library")}
          />
        )}
        {view === "archive" && (
          <StoryArchive
            book={selected}
            recording={
              recordings[bookProgressKey(selected.id, quizLevel)] || null
            }
            back={() => go("library")}
            record={() => go("recording")}
            remove={() => deleteBookRecording(selected)}
          />
        )}
        {view === "library" && (
          <LibraryView
            books={activeBooks}
            progress={progress}
            quizLevel={quizLevel}
            recordings={recordings}
            go={go}
          />
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
            key={`${selected.id}-${quizLevel}`}
            book={selected}
            back={() => go(reviewOrigin)}
            publish={publishDraft}
          />
        )}
        {view === "profile" && (
          <Profile
            profile={childProfile}
            photoUrl={profileMedia.photoUrl}
            variants={profileMedia.variants}
            characterState={characterState}
            characterError={characterError}
            uploadPhoto={uploadChildPhoto}
            generateCharacters={generateChildCharacters}
            registerCharacter={registerChildCharacter}
            quizLevel={quizLevel}
            selectQuizLevel={selectQuizLevel}
          />
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
            label="내 캐릭터"
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
function HomeView({
  books,
  progress,
  quizLevel,
  go,
  startQuiz,
  childProfile,
  character,
}) {
  const level = QUIZ_LEVELS[quizLevel];
  const childName = childProfile.completed ? childProfile.name : "";
  const completedCount = books.filter((book) =>
    progress.completed.includes(bookProgressKey(book.id, quizLevel)),
  ).length;
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">
            {childName ? `${childName}의 오늘` : "오늘의 책 모험"}
          </span>
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
          <button className="level-shortcut" onClick={() => go("profile")}>
            <span>{level.label}</span>
            {level.name} <ChevronRight size={15} />
          </button>
          <button
            className="primary"
            onClick={() =>
              startQuiz(
                books.find(
                  (book) =>
                    !progress.completed.includes(
                      bookProgressKey(book.id, quizLevel),
                    ),
                ) ||
                  books[0],
              )
            }
          >
            모험 시작하기 <ChevronRight size={18} />
          </button>
        </div>
        <img
          className={character?.url ? "hero-reader-character" : ""}
          src={character?.url || asset("assets/mori-mascot.png")}
          alt={
            character?.url
              ? `책을 읽는 ${childName} 캐릭터`
              : "책을 든 모리"
          }
        />
      </section>
      <section className="daily">
        <div className="ring">
          <strong>{completedCount}</strong>
          <span>/ {books.length}권</span>
        </div>
        <div>
          <span className="overline">
            {childName ? childShelfTitle(childName) : "나의 책숲"}
          </span>
          <h2>
            {completedCount === books.length
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
              done={progress.completed.includes(
                bookProgressKey(b.id, quizLevel),
              )}
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
        <span className={`book-level-badge ${book.quizLevel}`}>
          {QUIZ_LEVELS[book.quizLevel].label}
        </span>
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
  const level = QUIZ_LEVELS[book.quizLevel];
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
            <span className="level-chip">{level.label}</span>
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
            {level.summary} {book.questions.length}개의 문을 열어 보세요.
          </p>
        </div>
      </div>
      <div className="skill-row">
        {level.stages.map((stage, stageIndex) => (
          <React.Fragment key={stage}>
            {stageIndex > 0 && <i />}
            <div>
              <strong>{stageIndex + 1}</strong>
              <span>{stage}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <button className="primary wide" onClick={start}>
        {done ? `${level.label} 다시 도전하기` : `${level.label} 퀴즈 시작하기`} <ChevronRight />
      </button>
      <button className="secondary wide" onClick={review}>
        <LockKeyhole size={18} /> 보호자 문제 미리보기
      </button>
    </div>
  );
}

function StoryIntro({ book, back, begin }) {
  return (
    <div className="page story-intro-page">
      <Back onClick={back} label="책 정보로" />
      <span className="eyebrow">
        {QUIZ_LEVELS[book.quizLevel].label} · 퀴즈 전 이야기 지도
      </span>
      <h1>
        그림을 보며
        <br />한 문장씩 따라 읽어요
      </h1>
      <p className="story-guide-copy">
        왼쪽 위부터 오른쪽 아래까지 살펴보세요. 문장 카드를 누르면 모리가
        천천히 읽어 줘요.
      </p>
      <StoryComic book={book} interactive />
      <button className="primary wide story-begin" onClick={begin}>
        줄거리를 읽었어요 · 퀴즈 시작 <ChevronRight />
      </button>
    </div>
  );
}

function StoryComic({ book, interactive = false }) {
  return (
    <section className="story-comic" aria-label={`${book.title} 8컷 줄거리`}>
      <figure>
        <img
          src={book.storyComic}
          alt={`${book.title}의 핵심 흐름을 왼쪽 위부터 오른쪽 아래까지 보여 주는 글자 없는 8컷 그림`}
          draggable="false"
        />
        <figcaption>그림 1–8과 아래 문장 1–8이 서로 이어져요.</figcaption>
      </figure>
      <ol className="story-sentences">
        {book.storySentences.map((sentence, sentenceIndex) => (
          <li key={sentence}>
            {interactive ? (
              <button onClick={() => speakKorean(sentence)}>
                <span>{sentenceIndex + 1}</span>
                <strong>{sentence}</strong>
                <Volume2 size={18} aria-hidden="true" />
              </button>
            ) : (
              <div>
                <span>{sentenceIndex + 1}</span>
                <strong>{sentence}</strong>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Quiz({
  book,
  index,
  choice,
  setChoice,
  eliminatedOptions,
  submit,
  close,
}) {
  const q = book.questions[index];
  const complete = isQuestionComplete(q, choice);
  const speak = () => {
    speakKorean(spokenPrompt(q));
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
            <span className={`level-tag ${book.quizLevel}`}>
              {QUIZ_LEVELS[book.quizLevel].label}
            </span>
            <span className="stage-tag">{quizStage(index, book.quizLevel)}</span>
            {q.method && <span className="method-tag">{q.method}</span>}
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
          <ChoiceQuestion
            q={q}
            choice={choice}
            setChoice={setChoice}
            eliminatedOptions={eliminatedOptions}
          />
        )}
        {questionKind(q) === "completion" && (
          <CompletionQuestion
            q={q}
            choice={choice}
            setChoice={setChoice}
            eliminatedOptions={eliminatedOptions}
          />
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

function CompletionQuestion({
  q,
  choice,
  setChoice,
  eliminatedOptions = [],
}) {
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
      <ChoiceQuestion
        q={q}
        choice={choice}
        setChoice={setChoice}
        eliminatedOptions={eliminatedOptions}
      />
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

function ChoiceQuestion({ q, choice, setChoice, eliminatedOptions = [] }) {
  return (
    <div className="options">
      {q.options.map((option, optionIndex) =>
        eliminatedOptions.includes(optionIndex) ? null : (
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
        ),
      )}
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
  const boardRef = useRef(null);
  const leftRefs = useRef(new Map());
  const rightRefs = useRef(new Map());
  const [dragLine, setDragLine] = useState(null);
  const [connectionLines, setConnectionLines] = useState([]);

  const updateConnectionLines = () => {
    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const lines = Object.entries(response.pairs)
      .map(([leftId, rightId]) => {
        const leftRect = leftRefs.current.get(leftId)?.getBoundingClientRect();
        const rightRect = rightRefs.current.get(rightId)?.getBoundingClientRect();
        if (!leftRect || !rightRect) return null;
        return {
          id: leftId,
          start: {
            x: leftRect.right - boardRect.left,
            y: leftRect.top + leftRect.height / 2 - boardRect.top,
          },
          end: {
            x: rightRect.left - boardRect.left,
            y: rightRect.top + rightRect.height / 2 - boardRect.top,
          },
        };
      })
      .filter(Boolean);
    setConnectionLines(lines);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateConnectionLines);
    const resizeObserver = new ResizeObserver(updateConnectionLines);
    if (boardRef.current) resizeObserver.observe(boardRef.current);
    window.addEventListener("resize", updateConnectionLines);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateConnectionLines);
    };
  }, [choice?.pairs, q]);

  const selectLeft = (leftId) => {
    setChoice((current) => ({
      active: leftId,
      pairs: current?.pairs || {},
    }));
  };
  const connectPair = (leftId, rightId) => {
    if (!leftId || !rightId) return;
    setChoice((current) => {
      const pairs = { ...(current?.pairs || {}) };
      Object.keys(pairs).forEach((leftId) => {
        if (pairs[leftId] === rightId) delete pairs[leftId];
      });
      pairs[leftId] = rightId;
      return { active: null, pairs };
    });
  };
  const selectRight = (rightId) => connectPair(response.active, rightId);
  const pointInBoard = (clientX, clientY) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return { x: 0, y: 0 };
    return {
      x: clientX - boardRect.left,
      y: clientY - boardRect.top,
    };
  };
  const startConnection = (event, leftId) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    const leftRect = event.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    selectLeft(leftId);
    setDragLine({
      pointerId: event.pointerId,
      leftId,
      start: {
        x: leftRect.right - boardRect.left,
        y: leftRect.top + leftRect.height / 2 - boardRect.top,
      },
      end: pointInBoard(event.clientX, event.clientY),
    });
  };
  const moveConnection = (event) => {
    setDragLine((current) =>
      current?.pointerId === event.pointerId
        ? { ...current, end: pointInBoard(event.clientX, event.clientY) }
        : current,
    );
  };
  const finishConnection = (event) => {
    if (!dragLine || dragLine.pointerId !== event.pointerId) return;
    const dropTarget = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-match-right-id]");
    if (dropTarget && boardRef.current?.contains(dropTarget)) {
      connectPair(dragLine.leftId, dropTarget.dataset.matchRightId);
    }
    setDragLine(null);
  };
  const connectionPath = (start, end) => {
    const middleX = start.x + (end.x - start.x) / 2;
    return `M ${start.x} ${start.y} C ${middleX} ${start.y}, ${middleX} ${end.y}, ${end.x} ${end.y}`;
  };
  const usedRightIds = Object.values(response.pairs);

  return (
    <div className="match-question">
      <div className="interaction-help">
        <span>1</span>
        왼쪽 카드의 점에서 알맞은 오른쪽 카드까지 손가락으로 선을 그어 주세요.
      </div>
      <div
        className={`match-board ${dragLine ? "drawing" : ""}`}
        ref={boardRef}
        onPointerMove={moveConnection}
        onPointerUp={finishConnection}
        onPointerCancel={() => setDragLine(null)}
      >
        <svg className="match-lines" aria-hidden="true">
          {connectionLines.map((line) => (
            <path
              key={line.id}
              className="match-line complete"
              d={connectionPath(line.start, line.end)}
            />
          ))}
          {dragLine && (
            <path
              className="match-line preview"
              d={connectionPath(dragLine.start, dragLine.end)}
            />
          )}
        </svg>
        <div className="match-column" aria-label="연결할 이야기 카드">
          {q.leftItems.map((item) => {
            const paired = q.rightItems.find(
              (right) => right.id === response.pairs[item.id],
            );
            return (
              <button
                key={item.id}
                ref={(element) => {
                  if (element) leftRefs.current.set(item.id, element);
                  else leftRefs.current.delete(item.id);
                }}
                className={`${response.active === item.id ? "active" : ""} ${paired ? "paired" : ""}`}
                aria-pressed={response.active === item.id}
                aria-label={`${item.label}, 오른쪽 카드로 선 긋기`}
                onPointerDown={(event) => startConnection(event, item.id)}
                onClick={(event) => {
                  if (event.detail === 0) selectLeft(item.id);
                }}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.label}</strong>
                <small>{paired ? `연결됨 · ${paired.label}` : "점에서 선을 시작해요"}</small>
              </button>
            );
          })}
        </div>
        <div className="match-draw-lane" aria-hidden="true" />
        <div className="match-column answers" aria-label="연결할 뜻 카드">
          {q.rightItems.map((item) => {
            const used = usedRightIds.includes(item.id);
            return (
              <button
                key={item.id}
                ref={(element) => {
                  if (element) rightRefs.current.set(item.id, element);
                  else rightRefs.current.delete(item.id);
                }}
                data-match-right-id={item.id}
                className={used ? "used" : ""}
                aria-pressed={used}
                onClick={(event) => {
                  if (event.detail === 0) selectRight(item.id);
                }}
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

function Feedback({ q, choice, level, mode, retry, next, last }) {
  if (mode === "retry") {
    const wrongAnswer = wrongAnswerDetails(q, choice);
    return (
      <div className="feedback retry" role="status" aria-live="polite">
        <div className="confetti">⌁</div>
        <div className="feedback-icon"><RotateCcw /></div>
        <span className="eyebrow">한 번 더 기회!</span>
        <h1>다시 한번 생각해 볼까?</h1>
        <section className="retry-question-card" aria-label="문제 다시 보기">
          <span>문제 다시 보기</span>
          <h2>{q.q}</h2>
        </section>
        <section className="retry-answer-card" aria-label="고른 답 설명">
          <span>내가 고른 답</span>
          <strong>{wrongAnswer.selected}</strong>
          <p>{wrongAnswer.reason}</p>
        </section>
        <button className="primary wide" onClick={retry}>
          다시 골라보기 <RotateCcw />
        </button>
      </div>
    );
  }

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
  const showLv1Answer = level === "lv1" && !ok;
  return (
    <div className={`feedback ${ok ? "correct" : "wrong"}`}>
      <div className="confetti">{ok ? "✦  ·  ✦" : "⌁"}</div>
      <div className="feedback-icon">{ok ? <Check /> : <RotateCcw />}</div>
      <span className="eyebrow">
        {ok
          ? "멋진 발견!"
          : showLv1Answer
            ? "정답을 함께 확인해요"
            : "한 번 더 생각했구나!"}
      </span>
      <h1>
        {ok
          ? "정답이에요!"
          : showLv1Answer
            ? "정답을 알려 줄게요."
            : "괜찮아요, 단서를 찾았어요."}
      </h1>
      {showLv1Answer && (
        <div className="final-answer-callout">
          <span>정답은</span>
          <strong>{answerLabel(q)}</strong>
          <span>이야.</span>
        </div>
      )}
      <div className="explain">
        <strong>
          {ok
            ? "왜 그럴까요?"
            : showLv1Answer
              ? "왜 이 답일까요?"
              : "책 속 단서"}
        </strong>
        <p>{q.why}</p>
        {!ok && !showLv1Answer && (
          <small className="answer-reveal">정답: {answerLabel(q)}</small>
        )}
      </div>
      <button className="primary wide" onClick={next}>
        {last ? "모험 마치기" : "다음 문제"} <ChevronRight />
      </button>
    </div>
  );
}
function Result({ book, correct, reflectionCount, go, record }) {
  const score = correct;
  const level = QUIZ_LEVELS[book.quizLevel];
  const scoredTotal = book.questions.filter(
    (question) => !isReflectiveQuestion(question),
  ).length;
  const reflectionTotal = book.questions.length - scoredTotal;
  return (
    <div className="result">
      <div className="rays" />
      <img src={asset("assets/mori-mascot.png")} alt="축하하는 모리" />
      <span className="eyebrow">{level.label} 책 모험 완료</span>
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
          <span>{reflectionTotal ? "책 속 단서" : "맞힌 문제"}</span>
          <strong>
            {score} / {scoredTotal}
          </strong>
          {reflectionTotal > 0 && (
            <small className="reflection-record">
              생각 말하기 {reflectionCount} / {reflectionTotal}
            </small>
          )}
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
      <button className="primary wide" onClick={record}>
        줄거리 소리 내어 읽기 <Mic />
      </button>
      <button className="text-btn" onClick={() => go("library")}>
        녹음은 나중에 하고 책장으로
      </button>
    </div>
  );
}

function StoryRecording({ book, existing, save, finish }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const draftUrlRef = useRef("");

  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (draftUrlRef.current) URL.revokeObjectURL(draftUrlRef.current);
    },
    [],
  );

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setError("이 브라우저에서는 음성 녹음을 사용할 수 없어요.");
      return;
    }
    try {
      if (draftUrlRef.current) {
        URL.revokeObjectURL(draftUrlRef.current);
        draftUrlRef.current = "";
      }
      setDraft(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedType = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(
        stream,
        supportedType ? { mimeType: supportedType } : undefined,
      );
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || supportedType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        draftUrlRef.current = url;
        setDraft({ blob, url });
        setStatus("ready");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch {
      setError("마이크 사용을 허용하면 줄거리 읽기를 녹음할 수 있어요.");
      setStatus("idle");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const saveAndFinish = async () => {
    if (!draft?.blob) return;
    setStatus("saving");
    try {
      await save(draft.blob);
      finish();
    } catch {
      setError("녹음을 이 기기에 저장하지 못했어요. 다시 시도해 주세요.");
      setStatus("ready");
    }
  };

  return (
    <div className="page recording-page">
      <span className="eyebrow">마지막 읽기 활동</span>
      <h1>
        줄거리를 천천히
        <br />소리 내어 읽어 봐요
      </h1>
      <p>
        여덟 문장을 이어 읽어 보세요. 녹음은 서버가 아닌 이 기기에만 저장돼요.
      </p>
      <div className="recording-script">
        <button
          className="listen-script"
          onClick={() => speakKorean(book.storySentences.join(" "))}
        >
          <Volume2 /> 전체 문장 먼저 들어보기
        </button>
        <ol>
          {book.storySentences.map((sentence) => (
            <li key={sentence}>{sentence}</li>
          ))}
        </ol>
      </div>
      <div className={`recorder-panel ${status}`}>
        {status === "recording" ? (
          <>
            <span className="recording-pulse"><Mic /></span>
            <strong>목소리를 듣고 있어요…</strong>
            <button className="stop-recording" onClick={stopRecording}>
              <Square fill="currentColor" /> 녹음 멈추기
            </button>
          </>
        ) : (
          <>
            <span className="recording-icon"><Mic /></span>
            <strong>{draft ? "내 목소리를 확인해 보세요" : "준비되면 녹음을 시작해요"}</strong>
            {draft && <audio controls src={draft.url} />}
            {!draft && existing && <audio controls src={existing.url} />}
            <button className="secondary wide" onClick={startRecording}>
              <Mic /> {draft || existing ? "다시 녹음하기" : "녹음 시작하기"}
            </button>
          </>
        )}
      </div>
      {error && <p className="recording-error" role="alert">{error}</p>}
      {draft && status !== "recording" && (
        <button
          className="primary wide"
          onClick={saveAndFinish}
          disabled={status === "saving"}
        >
          {status === "saving" ? "저장하는 중…" : "녹음 저장하고 책장에 꽂기"}
          <Library />
        </button>
      )}
      <button className="text-btn" onClick={finish}>
        녹음은 나중에 하기
      </button>
    </div>
  );
}

function StoryArchive({ book, recording, back, record, remove }) {
  return (
    <div className="page archive-page">
      <Back onClick={back} label="도감으로" />
      <span className="eyebrow">이야기 도감 · {QUIZ_LEVELS[book.quizLevel].label}</span>
      <h1>{book.title}</h1>
      <div className="archive-meta">
        <span>{book.publisher}</span>
        <span>{book.series}</span>
        <span>{book.topics.join(" · ")}</span>
      </div>
      <StoryComic book={book} interactive />
      <section className="saved-voice">
        <div>
          <span className="recording-icon"><Headphones /></span>
          <div>
            <span className="overline">내가 읽은 줄거리</span>
            <strong>{recording ? "저장된 목소리가 있어요" : "아직 녹음이 없어요"}</strong>
          </div>
        </div>
        {recording && <audio controls src={recording.url} />}
        <button className="secondary wide" onClick={record}>
          <Mic /> {recording ? "다시 녹음하기" : "줄거리 녹음하기"}
        </button>
        {recording && (
          <button className="delete-recording" onClick={remove}>
            <Trash2 size={17} /> 이 기기의 녹음 지우기
          </button>
        )}
      </section>
    </div>
  );
}

function LibraryView({ books, progress, quizLevel, recordings, go }) {
  const [filterType, setFilterType] = useState("topic");
  const [filterValue, setFilterValue] = useState("all");
  const completedBooks = useMemo(
    () =>
      books
        .filter((book) =>
          progress.completed.includes(bookProgressKey(book.id, quizLevel)),
        )
        .sort((left, right) => {
          const leftDate = progress.readDates?.[
            bookProgressKey(left.id, quizLevel)
          ];
          const rightDate = progress.readDates?.[
            bookProgressKey(right.id, quizLevel)
          ];
          return new Date(rightDate || 0) - new Date(leftDate || 0);
        }),
    [books, progress.completed, progress.readDates, quizLevel],
  );
  const filterOptions = useMemo(() => {
    const values = completedBooks.flatMap((book) =>
      filterType === "publisher"
        ? [book.publisher]
        : filterType === "series"
          ? [book.series]
          : book.topics,
    );
    return [...new Set(values.filter(Boolean))];
  }, [completedBooks, filterType]);
  const filteredBooks = completedBooks.filter((book) => {
    if (filterValue === "all") return true;
    if (filterType === "publisher") return book.publisher === filterValue;
    if (filterType === "series") return book.series === filterValue;
    return book.topics.includes(filterValue);
  });
  const completedCount = completedBooks.length;
  const emptySlots = Math.max(0, books.length - completedCount);
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
          <strong>{completedCount}</strong>
          <span>완독</span>
        </div>
      </div>
      <div className="shelf-scene">
        <div className="shelf-books">
          {completedBooks.map((book) => (
            <button
              key={book.id}
              className="shelf-book"
              onClick={() => go("archive", book)}
              style={{ "--book": book.color }}
            >
              <BookCover book={book} className="shelf-cover" />
              <span>{book.title}</span>
            </button>
          ))}
          {Array.from({ length: emptySlots }, (_, slotIndex) => (
            <div key={`empty-${slotIndex}`} className="empty-book">
              <BookOpen />
              <span>다음 책</span>
            </div>
          ))}
        </div>
        <div className="wood" />
      </div>
      <section className="collection">
        <div className="section-title">
          <div>
            <span className="overline">최근에 읽은 순서</span>
            <h2>나의 이야기 도감</h2>
          </div>
          <span className="count">{QUIZ_LEVELS[quizLevel].label} · {completedCount}권</span>
        </div>
        <div
          className="catalog-filters"
          data-allow-native-editing="true"
          aria-label="도감 필터"
        >
          <SlidersHorizontal aria-hidden="true" />
          <label>
            <span>분류</span>
            <select
              value={filterType}
              onChange={(event) => {
                setFilterType(event.target.value);
                setFilterValue("all");
              }}
            >
              <option value="publisher">출판사</option>
              <option value="series">시리즈</option>
              <option value="topic">주제</option>
            </select>
          </label>
          <label>
            <span>찾기</span>
            <select
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
            >
              <option value="all">전체 보기</option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="catalog-list">
          {filteredBooks.map((book) => {
            const progressKey = bookProgressKey(book.id, quizLevel);
            const recording = recordings[progressKey];
            return (
              <button
                className="catalog-book"
                key={book.id}
                onClick={() => go("archive", book)}
              >
                <BookCover book={book} className="catalog-cover" />
                <span className="catalog-book-copy">
                  <small>{book.publisher} · {book.series}</small>
                  <strong>{book.title}</strong>
                  <span className="read-date">
                    <CalendarDays size={15} />
                    읽은 날 {formatReadDate(progress.readDates?.[progressKey])}
                  </span>
                  <span className="topic-row">
                    {book.topics.map((topic) => <i key={topic}>{topic}</i>)}
                  </span>
                  <span className={`voice-status ${recording ? "saved" : ""}`}>
                    <Headphones size={15} />
                    {recording ? "내 줄거리 녹음 듣기" : "줄거리 보기 · 녹음하기"}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            );
          })}
          {!filteredBooks.length && (
            <div className="catalog-empty">
              <BookOpen />
              <strong>조건에 맞는 완독 책이 없어요.</strong>
              <span>필터를 바꾸거나 새 책 모험을 마쳐 보세요.</span>
            </div>
          )}
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
  const textLength = registeredBook?.textLength || 0;

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
        제목·저자·출판사·ISBN만 저장하고, 본문은 문제를 만드는 데만 쓰고 저장하지 않아요.
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
              <strong>{registeredBook.title || "책"}의 책 정보를 저장했어요</strong>
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
              <dd>{textLength.toLocaleString()}자 분석 · 원문 미저장</dd>
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
          <span className="eyebrow">
            보호자 확인함 · {QUIZ_LEVELS[book.quizLevel].label} 생성 초안
          </span>
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
                <small>
                  {question.method ? `${question.method} · ` : ""}{question.type}
                </small>
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

function Profile({
  profile,
  photoUrl,
  variants,
  characterState,
  characterError,
  uploadPhoto,
  generateCharacters,
  registerCharacter,
  quizLevel,
  selectQuizLevel,
}) {
  const [name, setName] = useState(profile.name);
  const [selectedVariantId, setSelectedVariantId] = useState(
    profile.selectedVariantId,
  );
  const [guardianConsent, setGuardianConsent] = useState(false);
  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const generating = characterState === "generating";

  useEffect(() => {
    if (!variants.length) {
      setSelectedVariantId(null);
      return;
    }
    if (
      profile.selectedVariantId &&
      variants.some((variant) => variant.id === profile.selectedVariantId)
    ) {
      setSelectedVariantId(profile.selectedVariantId);
    } else if (!variants.some((variant) => variant.id === selectedVariantId)) {
      setSelectedVariantId(null);
    }
  }, [profile.selectedVariantId, variants]);

  return (
    <div className="page profile">
      <span className="eyebrow">내가 이야기 속으로</span>
      <h1>
        나만의 책 친구를
        <br />
        만들어 봐요
      </h1>
      <p>
        아이 사진을 따뜻한 그림책 캐릭터로 바꾸고, 마음에 드는 모습을 골라
        나만의 책장을 만들어요.
      </p>

      {profile.completed && selectedVariant && (
        <section className="registered-character" aria-label="등록된 캐릭터">
          <img
            src={selectedVariant.url}
            alt={`책을 읽는 ${profile.name} 캐릭터`}
            draggable="false"
          />
          <div>
            <span className="overline">현재 나의 책 친구</span>
            <h2>{childShelfTitle(profile.name)}</h2>
            <p>{selectedVariant.label} 캐릭터로 책 모험을 하고 있어요.</p>
          </div>
        </section>
      )}

      <section
        className="profile-character-maker"
        aria-labelledby="character-maker-title"
        data-allow-native-editing="true"
      >
        <div className="character-maker-heading">
          <div>
            <span className="overline">프로필 만들기</span>
            <h2 id="character-maker-title">사진으로 캐릭터 만들기</h2>
          </div>
          <span>1 · 2 · 3</span>
        </div>

        <label className="child-name-field">
          <span><b>1</b> 아이 이름</span>
          <input
            type="text"
            value={name}
            maxLength={12}
            placeholder="예: 지온"
            aria-label="아이 이름"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="character-photo-step">
          <div>
            <span><b>2</b> 아이 사진</span>
            <small>얼굴과 머리 모양이 잘 보이는 정면 사진이 좋아요.</small>
          </div>
          <div className={`character-photo-preview ${photoUrl ? "has-photo" : ""}`}>
            {photoUrl ? (
              <img src={photoUrl} alt="캐릭터로 만들 아이 사진" draggable="false" />
            ) : (
              <UserRound aria-hidden="true" />
            )}
          </div>
          <label className="character-photo-button">
            <Camera /> {photoUrl ? "다른 사진 고르기" : "아이 사진 등록하기"}
            <input type="file" accept="image/*" onChange={uploadPhoto} />
          </label>
        </div>

        <label className="guardian-consent">
          <input
            type="checkbox"
            checked={guardianConsent}
            onChange={(event) => setGuardianConsent(event.target.checked)}
          />
          <span>
            <strong>보호자가 이미지 생성에 동의했어요.</strong>
            <small>
              사진은 캐릭터 생성 시 설정된 AI 이미지 서버로 전송됩니다. 모리
              서버는 원본 사진과 생성 결과를 보관하지 않아요.
            </small>
          </span>
        </label>

        <button
          className="primary wide generate-character-button"
          type="button"
          disabled={!name.trim() || !photoUrl || !guardianConsent || generating}
          onClick={generateCharacters}
        >
          <Sparkles />
          {generating
            ? "8가지 모습을 그리고 있어요…"
            : variants.length
              ? "8가지 모습 다시 만들기"
              : "8가지 캐릭터 만들기"}
        </button>

        {generating && (
          <div className="character-generating" role="status" aria-live="polite">
            <div className="character-skeleton-grid" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <i key={index} style={{ "--delay": `${index * 90}ms` }} />
              ))}
            </div>
            <strong>크레파스와 색연필로 캐릭터를 그리고 있어요.</strong>
            <p>한 장의 캐릭터 시트를 만든 뒤 여덟 모습으로 나누고 있어요.</p>
          </div>
        )}

        {characterError && (
          <div className="character-error" role="alert">
            <RotateCcw aria-hidden="true" />
            <span>{characterError}</span>
          </div>
        )}

        {variants.length === 8 && !generating && (
          <div className="character-choice-step">
            <div>
              <span><b>3</b> 나의 캐릭터 고르기</span>
              <small>마음에 드는 모습을 하나 눌러 주세요.</small>
            </div>
            <div className="character-variant-grid" role="radiogroup" aria-label="캐릭터 선택">
              {variants.map((variant) => {
                const active = selectedVariantId === variant.id;
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={active ? "selected" : ""}
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <img src={variant.url} alt={variant.description} draggable="false" />
                    <span>
                      <strong>{variant.label}</strong>
                      <small>{variant.description}</small>
                    </span>
                    {active && <Check aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="primary wide register-character-button"
              disabled={!name.trim() || !selectedVariantId}
              onClick={() =>
                registerCharacter({ name, variantId: selectedVariantId })
              }
            >
              {selectedVariant
                ? `${selectedVariant.label}로 등록하기`
                : "캐릭터를 골라 주세요"}
              <ChevronRight />
            </button>
          </div>
        )}

        <div className="local-profile-note">
          <LockKeyhole aria-hidden="true" />
          <p>
            지금은 이 기기의 익명 사용자 ID에 저장돼요. 로그인 도입 뒤에는 같은
            데이터가 Supabase 사용자 계정에 연결됩니다.
          </p>
        </div>
      </section>

      <section className="level-setting" aria-labelledby="level-setting-title">
        <div className="level-setting-heading">
          <div>
            <span className="overline">모든 책에 공통 적용</span>
            <h2 id="level-setting-title">읽기 모험 난이도</h2>
          </div>
          <span className="current-level">현재 {QUIZ_LEVELS[quizLevel].label}</span>
        </div>
        <p>
          아이가 편안하게 시작할 수 있는 단계를 골라 주세요. 언제든 바꿀 수
          있고, 레벨별 완독 기록은 따로 남아요.
        </p>
        <div className="level-options" role="radiogroup" aria-label="퀴즈 난이도">
          {Object.values(QUIZ_LEVELS).map((level, levelIndex) => {
            const selectedLevel = quizLevel === level.id;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selectedLevel}
                className={`${level.id} ${selectedLevel ? "selected" : ""}`}
                key={level.id}
                onClick={() => selectQuizLevel(level.id)}
              >
                <span className="level-option-top">
                  <strong>{level.label}</strong>
                  {levelIndex === 0 && <em>처음이라면 추천</em>}
                  {selectedLevel && <Check size={20} aria-hidden="true" />}
                </span>
                <b>{level.name}</b>
                <p>{level.summary}</p>
                <small>{level.detail}</small>
                <span
                  className="difficulty-meter"
                  aria-label={`난이도 ${levelIndex + 1}단계`}
                >
                  <i className="on" />
                  <i className={levelIndex > 0 ? "on" : ""} />
                  난이도 {levelIndex === 0 ? "기본" : "높음"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
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
