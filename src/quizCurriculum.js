export const QUIZ_LEVELS = {
  lv1: {
    id: "lv1",
    label: "Lv.1",
    age: "4–5세",
    name: "보고 찾고 스스로 풀기",
    summary: "그림과 핵심 낱말을 단서로 이야기의 기본 내용을 스스로 찾아요.",
    stages: ["대상 찾기", "순서 이어 보기", "결과 확인하기"],
  },
  lv2: {
    id: "lv2",
    label: "Lv.2",
    age: "6–7세",
    name: "떠올리고 이어서 설명하기",
    summary: "책 속 정보를 기억하고 관계와 순서를 연결한 뒤, 마지막에 소리 내어 말해요.",
    stages: ["정보 떠올리기", "관계 이어 보기", "이야기 설명하기"],
  },
};

export const SOURCE_ANCHORS = {
  money: {
    M1: "아이의 방에 말하는 저금통 친구가 찾아온다.",
    M2: "저금통 친구가 둥근 동전과 네모난 지폐를 보여 준다.",
    M3: "물건을 사기 전에 가격과 가진 돈을 비교한다.",
    M4: "마음대로 그린 돈은 가게에서 쓸 수 없다.",
    M5: "돈은 일을 한 대가로 벌 수 있다.",
    M6: "돈으로 필요한 물건과 서비스를 이용할 수 있다.",
    M7: "쓰지 않은 동전을 저금통에 모은다.",
    M8: "돈을 계획해서 쓰고 모으면 원하는 일을 준비할 수 있다.",
  },
  origin: {
    O1: "우주 친구들이 마트 음식이 어디에서 왔는지 궁금해한다.",
    O2: "배추는 밭의 작은 씨앗에서 자라기 시작한다.",
    O3: "달걀은 닭을 기르는 양계장에서 온다.",
    O4: "우유는 젖소를 기르는 농장에서 얻는다.",
    O5: "우유를 차갑게 지켜 공장으로 옮기고 치즈로 만든다.",
    O6: "토마토는 농장에서 자라 트럭을 타고 공장으로 간다.",
    O7: "빵·치즈·배추·토마토가 한곳에 모인다.",
    O8: "여러 사람의 손을 거친 재료가 샌드위치가 된다.",
  },
  cold: {
    C1: "빵집에서 빵집 아저씨가 간지러운 코를 손가락으로 문지른다.",
    C2: "빵집 아저씨의 재채기와 함께 감기 바이러스가 침방울을 타고 나온다.",
    C3: "감기 바이러스가 손님과 빵, 엄마의 손에 내려앉는다.",
    C4: "엄마가 빵을 먹고 아이가 올 시간이라며 집으로 서둘러 간다.",
    C5: "엄마가 유치원에서 온 아이를 안고 얼굴을 맞댄다.",
    C6: "아이가 손을 씻지 않고 놀며 코를 만진 뒤 그대로 밥을 먹는다.",
    C7: "아이가 늦게까지 놀고 다음 날 열·목 통증·콧물로 힘들어한다.",
    C8: "아이가 입을 가리지 않고 재채기와 기침을 해 침방울이 퍼진다.",
  },
  bicycle: {
    B1: "아이가 자전거 가게에서 마음에 드는 자전거를 발견한다.",
    B2: "아이가 엄마에게 자전거를 사 달라고 여러 번 조른다.",
    B3: "엄마가 얼마 전에 산 킥보드와 방 안의 많은 장난감을 보여 준다.",
    B4: "엄마가 자전거는 과자보다 훨씬 비싸서 돈이 많이 필요하다고 설명한다.",
    B5: "엄마가 용돈을 주며 돈을 아껴 모으는 저축을 알려 준다.",
    B6: "아이가 로봇·사탕·게임에 용돈을 써서 돈이 하나도 남지 않는다.",
    B7: "며칠 뒤 마트에서 아이가 저축이 잘되지 않는다며 엄마에게 방법을 묻는다.",
    B8: "저축은 원하는 것을 살 만큼 돈이 모일 때까지 아껴 모으는 일이다.",
  },
  transport: {
    T1: "아이가 엄마와 함께 시골 할머니 댁에 가기로 한다.",
    T2: "버스 정류장에서 여러 색 버스 가운데 초록 버스를 고른다.",
    T3: "아이와 엄마가 교통 카드를 찍고 버스에 탄다.",
    T4: "버스에서 손잡이를 잡고 내릴 곳이 다가오자 미리 벨을 누른다.",
    T5: "도로가 막히자 버스에서 내려 지하철로 갈아탄다.",
    T6: "개찰구를 지나 줄을 서고 사람들이 모두 내린 다음 지하철에 탄다.",
    T7: "지하철이 땅속과 땅 위를 달려 기차역에 도착한다.",
    T8: "기차표의 번호를 보고 자리를 찾아 빠른 기차에 오른다.",
  },
};

export const CURRICULUM_QUESTIONS = {
  "money": {
    "lv1": [
      {
        "id": "money-lv1-01",
        "kind": "choice",
        "skill": "find-object",
        "type": "핵심 대상",
        "q": "{hero}의 방에 무엇이 찾아왔나요?",
        "options": [
          "말하는 동전",
          "말하는 지폐",
          "말하는 저금통",
          "말하는 인형"
        ],
        "answer": 2,
        "why": "{hero}의 방에 말하는 저금통 친구가 찾아왔어요.",
        "sourceAnchors": [
          "M1"
        ],
        "sourceEvidence": "M1에서 아이의 방에 말하는 저금통 친구가 찾아온다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "money-lv1-02",
        "kind": "choice",
        "skill": "find-action",
        "type": "장면 행동",
        "q": "{guide}가 {hero}에게 무엇을 보여 주었나요?",
        "options": [
          "색연필과 그림",
          "동전과 지폐",
          "저금통과 사탕",
          "가게와 물건"
        ],
        "answer": 1,
        "why": "저금통 친구는 둥근 동전과 네모난 지폐를 보여 주었어요.",
        "sourceAnchors": [
          "M2"
        ],
        "sourceEvidence": "M2에서 저금통 친구가 둥근 동전과 네모난 지폐를 보여 준다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "money-lv1-03",
        "kind": "choice",
        "skill": "find-fact",
        "type": "직접 정보",
        "q": "물건을 사기 전에 무엇과 무엇을 견주어 보나요?",
        "options": [
          "크기와 색깔",
          "동전과 지폐",
          "이름과 숫자",
          "가격과 가진 돈"
        ],
        "answer": 3,
        "why": "물건을 사기 전에 물건의 가격과 내가 가진 돈을 비교해요.",
        "sourceAnchors": [
          "M3"
        ],
        "sourceEvidence": "M3에서 물건을 사기 전에 가격과 가진 돈을 비교한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "money-lv1-04",
        "kind": "match",
        "skill": "match-object",
        "type": "짝 연결",
        "q": "왼쪽 물건과 알맞은 설명을 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "동전"
          },
          {
            "id": "l1",
            "label": "지폐"
          },
          {
            "id": "l2",
            "label": "저금통"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "동전을 모으는 곳"
          },
          {
            "id": "r1",
            "label": "둥근 모양"
          },
          {
            "id": "r2",
            "label": "네모난 모양"
          }
        ],
        "answer": {
          "l0": "r1",
          "l1": "r2",
          "l2": "r0"
        },
        "why": "동전은 둥글고 지폐는 네모나며, 저금통은 동전을 모으는 곳이에요.",
        "sourceAnchors": [
          "M2",
          "M7"
        ],
        "sourceEvidence": "M2에서 동전은 둥글고 지폐는 네모나며, M7에서 저금통에 동전을 모은다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "money-lv1-05",
        "kind": "sequence",
        "skill": "sequence-scenes",
        "type": "장면 순서",
        "q": "이야기가 일어난 순서대로 장면을 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "물건을 사기 전에 가진 돈을 살펴봐요"
          },
          {
            "id": "s1",
            "label": "저금통 친구가 방에 찾아와요"
          },
          {
            "id": "s2",
            "label": "쓰지 않은 동전을 저금통에 모아요"
          },
          {
            "id": "s3",
            "label": "동전과 지폐를 보여 줘요"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s0",
          "s2"
        ],
        "why": "저금통 친구가 찾아와(M1), 동전과 지폐를 보여 주고(M2), 살 때 돈을 살펴본 뒤(M3), 남은 동전을 모아요(M7).",
        "sourceAnchors": [
          "M1",
          "M2",
          "M3",
          "M7"
        ],
        "sourceEvidence": "M1 저금통 친구 방문, M2 동전·지폐 소개, M3 돈 비교, M7 동전 모으기 순으로 이어진다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "money-lv1-06",
        "kind": "choice",
        "skill": "find-result",
        "type": "마지막 결과",
        "q": "돈을 계획해서 쓰고 모으면 무엇을 할 수 있나요?",
        "options": [
          "원하는 일을 준비할 수 있어요",
          "갖고 싶은 것을 바로 다 살 수 있어요",
          "돈이 저절로 두 배로 늘어나요",
          "다시는 일을 하지 않아도 돼요"
        ],
        "answer": 0,
        "why": "돈을 계획해서 쓰고 모으면 나중에 원하는 일을 준비할 수 있어요.",
        "sourceAnchors": [
          "M8"
        ],
        "sourceEvidence": "M8에서 돈을 계획해서 쓰고 모으면 원하는 일을 준비할 수 있다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      }
    ],
    "lv2": [
      {
        "id": "money-lv2-01",
        "kind": "completion",
        "skill": "completion",
        "type": "빈칸 채우기",
        "q": "빈칸에 알맞은 낱말을 고르세요.",
        "sentence": "돈을 ____해서 쓰고 모으면 원하는 일을 준비할 수 있어요.",
        "options": [
          "낭비",
          "계획",
          "자랑",
          "구경"
        ],
        "answer": 1,
        "why": "돈은 함부로 낭비하지 않고 계획해서 쓰고 모아야 원하는 일을 준비할 수 있어요.",
        "sourceAnchors": [
          "M7",
          "M8"
        ],
        "sourceEvidence": "M7에서 동전을 모으고, M8에서 계획해서 쓰고 모으면 원하는 일을 준비할 수 있다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 1
      },
      {
        "id": "money-lv2-02",
        "kind": "match",
        "skill": "match-concept",
        "type": "개념 연결",
        "q": "장면과 어울리는 낱말을 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "물건을 사기 전에 가격을 살펴봐요"
          },
          {
            "id": "l1",
            "label": "일을 해서 돈을 벌어요"
          },
          {
            "id": "l2",
            "label": "쓰지 않은 동전을 저금통에 넣어요"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "저축"
          },
          {
            "id": "r1",
            "label": "비교"
          },
          {
            "id": "r2",
            "label": "벌기"
          }
        ],
        "answer": {
          "l0": "r1",
          "l1": "r2",
          "l2": "r0"
        },
        "why": "가격을 살펴보는 것은 비교, 일을 해서 돈을 얻는 것은 벌기, 동전을 모으는 것은 저축이에요.",
        "sourceAnchors": [
          "M3",
          "M5",
          "M7"
        ],
        "sourceEvidence": "M3 가격 비교, M5 일로 돈 벌기, M7 저금통에 저축이 각각의 개념에 대응한다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 2
      },
      {
        "id": "money-lv2-03",
        "kind": "choice",
        "skill": "verify-detail",
        "type": "직접 확인",
        "q": "이야기에서 맞는 것을 고르세요.",
        "options": [
          "동전으로는 물건을 살 수 없어요",
          "동전은 네모나고 지폐는 둥글어요",
          "마음대로 그린 돈은 가게에서 쓸 수 없어요",
          "물건은 값을 보지 않고 사요"
        ],
        "answer": 2,
        "why": "마음대로 그린 돈은 진짜 돈이 아니어서 가게에서 쓸 수 없어요.",
        "sourceAnchors": [
          "M4"
        ],
        "sourceEvidence": "M4에서 마음대로 그린 돈은 가게에서 쓸 수 없다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 3
      },
      {
        "id": "money-lv2-04",
        "kind": "sequence",
        "skill": "sequence-flow",
        "type": "흐름 순서",
        "q": "돈을 쓰는 이야기의 흐름을 순서대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "필요한 물건과 서비스를 이용해요"
          },
          {
            "id": "s1",
            "label": "일을 해서 돈을 벌어요"
          },
          {
            "id": "s2",
            "label": "돈을 모아 원하는 일을 준비해요"
          },
          {
            "id": "s3",
            "label": "살 물건의 값과 가진 돈을 비교해요"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s0",
          "s2"
        ],
        "why": "일을 해서 돈을 벌고(M5), 값과 가진 돈을 비교한 뒤(M3), 물건과 서비스를 이용하고(M6), 남은 돈을 모아 준비해요(M8).",
        "sourceAnchors": [
          "M5",
          "M3",
          "M6",
          "M8"
        ],
        "sourceEvidence": "M5 벌기, M3 비교, M6 사용, M8 모아 준비하기 순으로 돈을 다룬다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 4
      },
      {
        "id": "money-lv2-05",
        "kind": "choice",
        "skill": "main-idea",
        "type": "중심 생각",
        "q": "이 책이 가장 잘 알려 주는 것은 무엇인가요?",
        "options": [
          "돈을 알고 계획해서 쓰고 모아야 해요",
          "저금통에 넣으면 돈이 바로 두 배가 돼요",
          "동전을 많이 모으면 지폐로 저절로 바뀌어요",
          "비싼 물건일수록 먼저 사는 것이 좋아요"
        ],
        "answer": 0,
        "why": "책은 돈이 무엇인지 알고, 잘 비교해 쓰고 모으는 것이 좋다는 것을 여러 장면으로 알려 줘요.",
        "sourceAnchors": [
          "M3",
          "M6",
          "M8"
        ],
        "sourceEvidence": "M3 비교, M6 알맞게 쓰기, M8 계획해 모으기가 함께 중심 생각을 이룬다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 5
      },
      {
        "id": "money-lv2-06",
        "kind": "recall",
        "skill": "recall",
        "type": "회상 말하기",
        "q": "저금통 친구가 알려 준 것을 두 가지 이상 말해 보세요.",
        "prompts": [
          "저금통 친구가 보여 준 돈은 어떤 모양이었나요?",
          "돈은 어떻게 벌 수 있다고 했나요?",
          "돈으로 무엇을 할 수 있다고 했나요?"
        ],
        "hint": "동전과 지폐, 일, 물건을 떠올려 보세요.",
        "exampleAnswer": "둥근 동전과 네모난 지폐를 보여 주었고, 돈은 일을 한 대가로 벌며, 그 돈으로 필요한 물건과 서비스를 이용할 수 있다고 했어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "M2",
          "M5",
          "M6"
        ],
        "sourceEvidence": "M2 동전·지폐, M5 일의 대가로 벌기, M6 물건·서비스 이용을 회상한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 6
      },
      {
        "id": "money-lv2-07",
        "kind": "distancing",
        "skill": "distancing",
        "type": "질문 만들기",
        "q": "돈에 대해 더 알고 싶은 새 질문을 만들고, 어떻게 알아볼지 순서를 정해 말해 보세요.",
        "prompts": [
          "돈에 대해 더 궁금한 질문을 하나 만들어 보세요.",
          "그 답을 누구에게 물어보거나 어디에서 찾을 수 있을까요?",
          "알아본 것을 어떻게 확인하고 정리할까요?"
        ],
        "hint": "우리 집에서는 돈을 어떻게 모을까 같은 질문도 좋아요.",
        "exampleAnswer": "예: '우리 가족은 돈을 어떻게 모을까?'라는 질문을 만들고, 먼저 부모님께 여쭤보고, 저금통에 얼마가 있는지 세어 보고, 알게 된 것을 그림이나 말로 정리하기로 순서를 정할 수 있어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "M8"
        ],
        "sourceEvidence": "M8의 계획해서 모으는 생각을 넓혀 새 질문과 조사 순서를 만든다.",
        "sourceRelation": "extension",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 7
      }
    ]
  },
  "origin": {
    "lv1": [
      {
        "id": "origin-lv1-01",
        "kind": "choice",
        "skill": "find-place",
        "type": "장소 찾기",
        "q": "우유는 어디에서 얻나요?",
        "options": [
          "젖소를 기르는 농장",
          "닭을 기르는 양계장",
          "씨앗을 심는 밭",
          "치즈를 만드는 공장"
        ],
        "answer": 0,
        "why": "우유는 젖소를 기르는 농장에서 얻어요.",
        "sourceAnchors": [
          "O4"
        ],
        "sourceEvidence": "우유는 젖소를 기르는 농장에서 얻는다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "origin-lv1-02",
        "kind": "choice",
        "skill": "scene-action",
        "type": "장면 행동",
        "q": "우주 친구들은 무엇을 궁금해했나요?",
        "options": [
          "치즈를 어떻게 만드는지",
          "씨앗을 언제 심는지",
          "마트 음식이 어디에서 왔는지",
          "트럭이 어디로 가는지"
        ],
        "answer": 2,
        "why": "우주 친구들은 마트 음식이 어디에서 왔는지 궁금해했어요.",
        "sourceAnchors": [
          "O1"
        ],
        "sourceEvidence": "우주 친구들이 마트 음식이 어디에서 왔는지 궁금해한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "origin-lv1-03",
        "kind": "choice",
        "skill": "direct-fact",
        "type": "사실 찾기",
        "q": "배추는 무엇에서 자라기 시작하나요?",
        "options": [
          "큰 뿌리",
          "작은 씨앗",
          "노란 꽃",
          "푸른 잎"
        ],
        "answer": 1,
        "why": "배추는 밭의 작은 씨앗에서 자라기 시작해요.",
        "sourceAnchors": [
          "O2"
        ],
        "sourceEvidence": "배추는 밭의 작은 씨앗에서 자라기 시작한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "origin-lv1-04",
        "kind": "match",
        "skill": "match-item-place",
        "type": "짝 연결",
        "q": "음식과 그것이 오는 곳을 짝지어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "달걀"
          },
          {
            "id": "l1",
            "label": "배추"
          },
          {
            "id": "l2",
            "label": "토마토"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "밭"
          },
          {
            "id": "r1",
            "label": "농장"
          },
          {
            "id": "r2",
            "label": "양계장"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "달걀은 양계장, 배추는 밭, 토마토는 농장에서 와요.",
        "sourceAnchors": [
          "O2",
          "O3",
          "O6"
        ],
        "sourceEvidence": "달걀은 양계장에서, 배추는 밭에서, 토마토는 농장에서 온다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "origin-lv1-05",
        "kind": "sequence",
        "skill": "order-scenes",
        "type": "순서 맞추기",
        "q": "이야기가 일어난 순서대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "재료가 샌드위치가 된다"
          },
          {
            "id": "s1",
            "label": "배추가 밭의 씨앗에서 자란다"
          },
          {
            "id": "s2",
            "label": "빵·치즈·배추·토마토가 한곳에 모인다"
          },
          {
            "id": "s3",
            "label": "토마토가 트럭을 타고 공장으로 간다"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s2",
          "s0"
        ],
        "why": "배추가 자라고, 토마토가 공장으로 가고, 재료가 모여, 샌드위치가 돼요.",
        "sourceAnchors": [
          "O2",
          "O6",
          "O7",
          "O8"
        ],
        "sourceEvidence": "배추가 씨앗에서 자란 뒤 토마토가 공장으로 가고 재료가 모여 샌드위치가 된다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "origin-lv1-06",
        "kind": "choice",
        "skill": "final-result",
        "type": "결과 찾기",
        "q": "여러 재료는 마지막에 무엇이 되나요?",
        "options": [
          "김밥",
          "피자",
          "비빔밥",
          "샌드위치"
        ],
        "answer": 3,
        "why": "여러 사람의 손을 거친 재료가 샌드위치가 돼요.",
        "sourceAnchors": [
          "O7",
          "O8"
        ],
        "sourceEvidence": "여러 사람의 손을 거친 재료가 샌드위치가 된다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      }
    ],
    "lv2": [
      {
        "id": "origin-lv2-01",
        "kind": "completion",
        "skill": "fill-process",
        "type": "빈칸 채우기",
        "q": "빈칸에 알맞은 말을 고르세요.",
        "sentence": "우유를 차갑게 지켜 공장으로 옮겨 ____ 만들어요.",
        "options": [
          "달걀을",
          "배추를",
          "토마토를",
          "치즈를"
        ],
        "answer": 3,
        "why": "우유를 차갑게 지켜 공장으로 옮겨 치즈를 만들어요.",
        "sourceAnchors": [
          "O4",
          "O5"
        ],
        "sourceEvidence": "우유를 차갑게 지켜 공장으로 옮기고 치즈로 만든다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 1
      },
      {
        "id": "origin-lv2-02",
        "kind": "match",
        "skill": "match-scene-process",
        "type": "과정 연결",
        "q": "장면과 어울리는 과정 낱말을 짝지어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "배추가 밭의 씨앗에서 자란다"
          },
          {
            "id": "l1",
            "label": "토마토가 트럭을 타고 공장으로 간다"
          },
          {
            "id": "l2",
            "label": "여러 재료가 하나로 합쳐진다"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "나르기"
          },
          {
            "id": "r1",
            "label": "만들기"
          },
          {
            "id": "r2",
            "label": "기르기"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "씨앗에서 자라는 건 기르기, 트럭으로 옮기는 건 나르기, 재료를 합치는 건 만들기예요.",
        "sourceAnchors": [
          "O2",
          "O6",
          "O8"
        ],
        "sourceEvidence": "배추는 밭에서 자라고, 토마토는 트럭으로 옮겨지고, 재료는 합쳐져 샌드위치가 된다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 2
      },
      {
        "id": "origin-lv2-03",
        "kind": "choice",
        "skill": "verify-fact",
        "type": "직접 확인",
        "q": "이야기에서 직접 확인할 수 있는 내용은 무엇인가요?",
        "options": [
          "우유는 트럭을 타고 마트로 간다",
          "토마토는 트럭을 타고 공장으로 간다",
          "달걀은 트럭을 타고 식당으로 간다",
          "배추는 트럭을 타고 시장으로 간다"
        ],
        "answer": 1,
        "why": "이야기에서 토마토는 농장에서 자라 트럭을 타고 공장으로 가요.",
        "sourceAnchors": [
          "O6"
        ],
        "sourceEvidence": "토마토는 농장에서 자라 트럭을 타고 공장으로 간다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 3
      },
      {
        "id": "origin-lv2-04",
        "kind": "sequence",
        "skill": "rebuild-flow",
        "type": "흐름 재구성",
        "q": "이야기 전체를 순서대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "우유를 공장으로 옮겨 치즈로 만든다"
          },
          {
            "id": "s1",
            "label": "재료가 모여 샌드위치가 된다"
          },
          {
            "id": "s2",
            "label": "우주 친구들이 음식이 어디에서 왔는지 궁금해한다"
          },
          {
            "id": "s3",
            "label": "달걀은 닭을 기르는 양계장에서 온다"
          }
        ],
        "answer": [
          "s2",
          "s3",
          "s0",
          "s1"
        ],
        "why": "궁금증에서 시작해 달걀·우유 재료를 거쳐 샌드위치로 끝나요.",
        "sourceAnchors": [
          "O1",
          "O3",
          "O5",
          "O8"
        ],
        "sourceEvidence": "궁금증으로 시작해 달걀과 우유 재료를 거쳐 재료가 모여 샌드위치가 된다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 4
      },
      {
        "id": "origin-lv2-05",
        "kind": "choice",
        "skill": "main-idea",
        "type": "중심 생각",
        "q": "이 책이 가장 잘 알려주는 생각은 무엇인가요?",
        "options": [
          "우유는 몸에 좋은 음식이다",
          "농부는 날마다 열심히 일한다",
          "음식은 여러 곳을 거쳐 우리에게 온다",
          "샌드위치는 맛있는 음식이다"
        ],
        "answer": 2,
        "why": "밭·양계장·농장·공장을 거쳐 음식이 우리에게 온다는 것이 책 전체의 생각이에요.",
        "sourceAnchors": [
          "O2",
          "O4",
          "O6",
          "O8"
        ],
        "sourceEvidence": "배추·우유·토마토 등 재료가 여러 곳을 거쳐 샌드위치가 되어 우리에게 온다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 5
      },
      {
        "id": "origin-lv2-06",
        "kind": "recall",
        "skill": "recall-sources",
        "type": "기억해 말하기",
        "q": "음식 재료가 어디에서 오는지 기억나는 대로 두 가지 이상 말해 볼까요?",
        "prompts": [
          "달걀은 어디에서 왔나요?",
          "우유는 어디에서 왔나요?",
          "배추는 어떻게 자라기 시작했나요?"
        ],
        "hint": "양계장, 농장, 밭을 떠올려 보세요.",
        "exampleAnswer": "달걀은 닭을 기르는 양계장에서 오고, 우유는 젖소를 기르는 농장에서 와요. 배추는 밭의 작은 씨앗에서 자라기 시작해요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "O2",
          "O3",
          "O4"
        ],
        "sourceEvidence": "달걀은 양계장, 우유는 농장, 배추는 밭의 씨앗에서 온다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 6
      },
      {
        "id": "origin-lv2-07",
        "kind": "distancing",
        "skill": "new-inquiry",
        "type": "새 질문 만들기",
        "q": "우리가 먹는 다른 음식은 어디에서 올까요? 궁금한 음식을 골라 어떻게 알아볼지 순서를 만들어 볼까요?",
        "prompts": [
          "어떤 음식이 어디에서 왔는지 궁금한가요?",
          "누구에게 물어보거나 어디를 찾아보면 알 수 있을까요?",
          "무엇을 먼저 알아보고, 그다음 무엇을 알아볼까요?"
        ],
        "hint": "우주 친구들처럼 궁금한 음식 하나를 정해 보세요.",
        "exampleAnswer": "예를 들어 '사과는 어디에서 올까?'를 정하고, 먼저 나무에서 자라는지 찾아보고, 그다음 어떻게 우리에게 오는지 알아보는 순서를 만들 수 있어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "O1"
        ],
        "sourceEvidence": "우주 친구들이 음식이 어디에서 왔는지 궁금해한 것처럼 새 질문을 만든다.",
        "sourceRelation": "extension",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 7
      }
    ]
  },
  "cold": {
    "lv1": [
      {
        "id": "cold-lv1-01",
        "kind": "choice",
        "skill": "find-subject",
        "type": "핵심 대상 찾기",
        "q": "빵집에서 간지러운 코를 손가락으로 문지른 사람은 누구인가요?",
        "options": [
          "엄마",
          "{hero}",
          "빵집 아저씨",
          "빵집 손님"
        ],
        "answer": 2,
        "why": "빵집 장면에서 간지러운 코를 손가락으로 문지른 사람은 빵집 아저씨예요.",
        "sourceAnchors": [
          "C1"
        ],
        "sourceEvidence": "빵집에서 빵집 아저씨가 간지러운 코를 손가락으로 문질렀다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "cold-lv1-02",
        "kind": "choice",
        "skill": "find-action",
        "type": "장면 행동 찾기",
        "q": "엄마는 유치원에서 온 {hero}를 만나 무엇을 했나요?",
        "options": [
          "안고 얼굴을 맞댔어요",
          "코를 문지르고 재채기했어요",
          "손을 안 씻고 코를 만졌어요",
          "빵을 먹고 집으로 갔어요"
        ],
        "answer": 0,
        "why": "엄마는 유치원에서 온 {hero}를 안고 얼굴을 맞댔어요.",
        "sourceAnchors": [
          "C5"
        ],
        "sourceEvidence": "엄마가 유치원에서 온 아이를 안고 얼굴을 맞댔다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "cold-lv1-03",
        "kind": "choice",
        "skill": "find-fact",
        "type": "직접 정보 찾기",
        "q": "{hero}는 놀다가 밥을 먹기 전에 어떻게 했나요?",
        "options": [
          "장난감을 정리하고 손을 씻었어요",
          "물을 마시고 자리에 앉았어요",
          "손을 씻고 밥을 먹었어요",
          "코를 만지고 그대로 밥을 먹었어요"
        ],
        "answer": 3,
        "why": "{hero}는 손을 씻지 않고 코를 만진 뒤 그대로 밥을 먹었어요.",
        "sourceAnchors": [
          "C6"
        ],
        "sourceEvidence": "아이가 손을 씻지 않고 놀며 코를 만진 뒤 그대로 밥을 먹었다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "cold-lv1-04",
        "kind": "match",
        "skill": "match-objects",
        "type": "구체물 짝 연결",
        "q": "누가 무엇을 했는지 알맞게 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "빵집 아저씨"
          },
          {
            "id": "l1",
            "label": "엄마"
          },
          {
            "id": "l2",
            "label": "{hero}"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "빵을 먹고 집으로 갔어요"
          },
          {
            "id": "r1",
            "label": "손을 안 씻고 밥을 먹었어요"
          },
          {
            "id": "r2",
            "label": "재채기로 바이러스가 나왔어요"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "빵집 아저씨는 재채기로 바이러스를 냈고, 엄마는 빵을 먹고 집에 갔고, {hero}는 손을 안 씻고 밥을 먹었어요.",
        "sourceAnchors": [
          "C2",
          "C4",
          "C6"
        ],
        "sourceEvidence": "빵집 아저씨는 재채기로 바이러스를 냈고, 엄마는 빵을 먹고 집으로 갔고, 아이는 손을 안 씻고 밥을 먹었다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "cold-lv1-05",
        "kind": "sequence",
        "skill": "order-scenes",
        "type": "네 장면 순서",
        "q": "이야기가 일어난 순서대로 장면을 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "빵집 아저씨가 재채기를 했어요"
          },
          {
            "id": "s1",
            "label": "{hero}가 손을 안 씻고 밥을 먹었어요"
          },
          {
            "id": "s2",
            "label": "엄마가 {hero}를 안고 얼굴을 맞댔어요"
          },
          {
            "id": "s3",
            "label": "다음 날 {hero}가 열이 나고 콧물이 났어요"
          }
        ],
        "answer": [
          "s0",
          "s2",
          "s1",
          "s3"
        ],
        "why": "재채기 → 엄마가 얼굴을 맞댐 → {hero}가 손 안 씻고 밥 → 다음 날 감기 순서예요.",
        "sourceAnchors": [
          "C2",
          "C5",
          "C6",
          "C7"
        ],
        "sourceEvidence": "재채기로 나온 바이러스가 엄마를 거쳐 아이에게 옮고, 손을 안 씻은 아이가 다음 날 감기에 걸렸다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "cold-lv1-06",
        "kind": "choice",
        "skill": "find-result",
        "type": "마지막 결과 찾기",
        "q": "이야기의 마지막에 {hero}는 어떻게 되었나요?",
        "options": [
          "따뜻한 이불을 덮고 잤어요",
          "콧물이 나고 열이 났어요",
          "병원에서 주사를 맞았어요",
          "씩씩하게 유치원에 갔어요"
        ],
        "answer": 1,
        "why": "다음 날 {hero}는 열이 나고 목이 아프고 콧물이 나서 힘들어했어요.",
        "sourceAnchors": [
          "C7"
        ],
        "sourceEvidence": "아이가 늦게까지 놀고 다음 날 열·목 통증·콧물로 힘들어했다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      }
    ],
    "lv2": [
      {
        "id": "cold-lv2-01",
        "kind": "completion",
        "skill": "fill-blank",
        "type": "빈칸 채우기",
        "q": "빈칸에 알맞은 말을 골라 보세요.",
        "sentence": "빵집 아저씨가 재채기를 하자 ____가 침방울을 타고 나왔어요.",
        "options": [
          "바이러스",
          "빵가루",
          "먼지",
          "연기"
        ],
        "answer": 0,
        "why": "재채기와 함께 감기 바이러스가 침방울을 타고 나왔어요.",
        "sourceAnchors": [
          "C2"
        ],
        "sourceEvidence": "빵집 아저씨의 재채기와 함께 감기 바이러스가 침방울을 타고 나왔다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 1
      },
      {
        "id": "cold-lv2-02",
        "kind": "match",
        "skill": "match-process",
        "type": "장면과 과정 잇기",
        "q": "각 장면에서 바이러스가 어떻게 되는지 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "빵집 아저씨가 재채기했어요"
          },
          {
            "id": "l1",
            "label": "엄마가 {hero}와 얼굴을 맞댔어요"
          },
          {
            "id": "l2",
            "label": "{hero}가 손을 안 씻고 코를 만졌어요"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "바이러스가 옮겨 갔어요"
          },
          {
            "id": "r1",
            "label": "바이러스가 몸으로 들어갔어요"
          },
          {
            "id": "r2",
            "label": "바이러스가 밖으로 나왔어요"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "재채기로 바이러스가 밖으로 나오고, 얼굴을 맞대며 옮겨 가고, 코를 만져 몸으로 들어가요.",
        "sourceAnchors": [
          "C2",
          "C5",
          "C6"
        ],
        "sourceEvidence": "재채기로 바이러스가 나오고, 얼굴을 맞대 옮겨 가고, 손으로 코를 만져 몸으로 들어간다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 2
      },
      {
        "id": "cold-lv2-03",
        "kind": "choice",
        "skill": "verify-fact",
        "type": "직접 확인하기",
        "q": "이야기에서 직접 확인할 수 있는 것은 무엇인가요?",
        "options": [
          "빵집 아저씨가 약을 먹었어요",
          "{hero}가 입을 가리고 재채기했어요",
          "엄마가 마스크를 쓰고 나갔어요",
          "엄마가 빵을 먹고 집으로 갔어요"
        ],
        "answer": 3,
        "why": "엄마는 빵을 먹고 아이가 올 시간이라며 집으로 서둘러 갔어요.",
        "sourceAnchors": [
          "C4"
        ],
        "sourceEvidence": "엄마가 빵을 먹고 아이가 올 시간이라며 집으로 서둘러 갔다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 3
      },
      {
        "id": "cold-lv2-04",
        "kind": "sequence",
        "skill": "reconstruct-flow",
        "type": "전체 흐름 순서",
        "q": "떨어져 있는 네 장면을 이야기 순서대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "{hero}가 손을 안 씻고 코를 만졌어요"
          },
          {
            "id": "s1",
            "label": "빵집 아저씨가 코를 문질렀어요"
          },
          {
            "id": "s2",
            "label": "{hero}가 입을 안 가리고 재채기했어요"
          },
          {
            "id": "s3",
            "label": "바이러스가 빵과 손에 내려앉았어요"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s0",
          "s2"
        ],
        "why": "아저씨가 코를 문지름 → 바이러스가 빵과 손에 앉음 → {hero}가 손 안 씻고 코 만짐 → {hero}가 입 안 가리고 재채기 순서예요.",
        "sourceAnchors": [
          "C1",
          "C3",
          "C6",
          "C8"
        ],
        "sourceEvidence": "빵집 아저씨의 코에서 시작한 바이러스가 빵과 손에 앉고, 아이가 손을 안 씻고 코를 만진 뒤 입을 안 가리고 재채기해 다시 퍼진다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 4
      },
      {
        "id": "cold-lv2-05",
        "kind": "choice",
        "skill": "main-idea",
        "type": "중심 생각 찾기",
        "q": "이 책이 우리에게 가장 잘 알려 주는 것은 무엇인가요?",
        "options": [
          "감기에 걸리면 반드시 병원에 가야 해요",
          "재채기는 꾹 참으면 병이 나아요",
          "감기 바이러스는 재채기와 손을 타고 옮겨 다녀요",
          "빵을 많이 먹으면 감기에 걸려요"
        ],
        "answer": 2,
        "why": "재채기, 손, 얼굴을 맞대는 여러 장면이 모두 바이러스가 옮겨 다니는 모습을 보여 줘요.",
        "sourceAnchors": [
          "C2",
          "C3",
          "C6",
          "C8"
        ],
        "sourceEvidence": "재채기로 나온 바이러스가 손과 접촉을 타고 여러 사람에게 옮겨 다닌다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 5
      },
      {
        "id": "cold-lv2-06",
        "kind": "recall",
        "skill": "recall-two",
        "type": "두 가지 이상 회상",
        "q": "감기 바이러스가 빵집 아저씨의 재채기에서 나온 뒤, 어디어디에 내려앉았는지 두 가지 이상 말해 볼까요?",
        "prompts": [
          "먼저 한 곳을 말해 보세요",
          "그다음 또 다른 곳도 말해 보세요",
          "모두 몇 곳에 앉았는지 세어 보세요"
        ],
        "hint": "빵, 손님, 엄마의 손을 떠올려 보세요.",
        "exampleAnswer": "바이러스가 손님한테도 앉고, 빵에도 앉고, 엄마 손에도 앉았어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "C3"
        ],
        "sourceEvidence": "감기 바이러스가 손님과 빵, 엄마의 손에 내려앉았다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 6
      },
      {
        "id": "cold-lv2-07",
        "kind": "distancing",
        "skill": "new-question",
        "type": "새 질문과 조사하기",
        "q": "감기를 막으려면 무엇을 더 알아보고 싶은지 새로운 질문을 만들고, 어떤 순서로 알아볼지 말해 볼까요?",
        "prompts": [
          "궁금한 것을 질문으로 만들어 보세요",
          "무엇을 가장 먼저 알아볼지 정해 보세요",
          "그다음에는 무엇을 알아볼지 말해 보세요"
        ],
        "hint": "손 씻기, 마스크, 재채기 예절을 떠올려 보세요.",
        "exampleAnswer": "'손은 언제 씻어야 할까?'를 먼저 알아보고, 그다음 '재채기할 때 어떻게 가릴까?'를 알아보고 싶어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "C6",
          "C8"
        ],
        "sourceEvidence": "아이가 손을 안 씻고 입을 안 가려 바이러스가 퍼진 장면에서 예방 질문으로 확장한다.",
        "sourceRelation": "extension",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 7
      }
    ]
  },
  "bicycle": {
    "lv1": [
      {
        "id": "bicycle-lv1-01",
        "kind": "choice",
        "skill": "retrieve",
        "type": "핵심 대상",
        "q": "{hero}가 가게에서 보고 갖고 싶어 한 것은 무엇인가요?",
        "options": [
          "새 킥보드",
          "작은 로봇",
          "새 자전거",
          "달콤한 사탕"
        ],
        "answer": 2,
        "why": "{hero}는 가게에서 마음에 드는 자전거를 보고 갖고 싶어 했어요.",
        "sourceAnchors": [
          "B1"
        ],
        "sourceEvidence": "{hero}가 자전거 가게에서 마음에 드는 자전거를 발견한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "bicycle-lv1-02",
        "kind": "choice",
        "skill": "retrieve",
        "type": "장면 행동",
        "q": "{hero}는 엄마에게 무엇을 했나요?",
        "options": [
          "자전거를 사 달라고 여러 번 졸랐어요",
          "얼마 전에 산 킥보드를 보여 주었어요",
          "저축이 무엇인지 알려 주었어요",
          "용돈을 아껴 모으라고 했어요"
        ],
        "answer": 0,
        "why": "{hero}는 엄마에게 자전거를 사 달라고 여러 번 졸랐어요.",
        "sourceAnchors": [
          "B2"
        ],
        "sourceEvidence": "{hero}가 엄마에게 자전거를 사 달라고 여러 번 조른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "bicycle-lv1-03",
        "kind": "choice",
        "skill": "retrieve",
        "type": "책 속 사실",
        "q": "엄마는 자전거가 무엇보다 훨씬 비싸다고 했나요?",
        "options": [
          "로봇",
          "사탕",
          "게임",
          "과자"
        ],
        "answer": 3,
        "why": "엄마는 자전거가 과자보다 훨씬 비싸서 돈이 많이 필요하다고 했어요.",
        "sourceAnchors": [
          "B4"
        ],
        "sourceEvidence": "엄마가 자전거는 과자보다 훨씬 비싸서 돈이 많이 필요하다고 설명한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "bicycle-lv1-04",
        "kind": "match",
        "skill": "match",
        "type": "짝 연결",
        "q": "장소나 물건과 거기서 본 것을 알맞게 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "자전거 가게"
          },
          {
            "id": "l1",
            "label": "방 안"
          },
          {
            "id": "l2",
            "label": "받은 용돈"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "많은 장난감"
          },
          {
            "id": "r1",
            "label": "로봇과 사탕과 게임"
          },
          {
            "id": "r2",
            "label": "마음에 드는 자전거"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "자전거 가게에서는 자전거를, 방 안에서는 많은 장난감을, 용돈으로는 로봇과 사탕과 게임을 봤어요.",
        "sourceAnchors": [
          "B1",
          "B3",
          "B6"
        ],
        "sourceEvidence": "가게의 자전거, 방 안의 장난감, 용돈으로 산 로봇·사탕·게임이 각각 나온다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "bicycle-lv1-05",
        "kind": "sequence",
        "skill": "sequence",
        "type": "이야기 순서",
        "q": "먼저 일어난 장면부터 차례대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "{hero}가 용돈을 로봇과 사탕에 다 썼어요"
          },
          {
            "id": "s1",
            "label": "{hero}가 가게에서 자전거를 발견했어요"
          },
          {
            "id": "s2",
            "label": "엄마가 용돈을 주며 저축을 알려 주었어요"
          },
          {
            "id": "s3",
            "label": "{hero}가 자전거를 사 달라고 졸랐어요"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s2",
          "s0"
        ],
        "why": "자전거를 발견하고 사 달라고 졸랐고, 용돈을 받아 저축을 배운 뒤 용돈을 다 썼어요.",
        "sourceAnchors": [
          "B1",
          "B2",
          "B5",
          "B6"
        ],
        "sourceEvidence": "자전거 발견, 조르기, 용돈과 저축, 용돈 소진의 순서가 이어진다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "bicycle-lv1-06",
        "kind": "choice",
        "skill": "retrieve",
        "type": "마지막 결과",
        "q": "{hero}가 용돈을 로봇과 사탕과 게임에 쓰자 어떻게 되었나요?",
        "options": [
          "킥보드를 새로 샀어요",
          "돈이 하나도 남지 않았어요",
          "자전거를 살 수 있었어요",
          "돈이 조금씩 모였어요"
        ],
        "answer": 1,
        "why": "{hero}가 용돈을 로봇·사탕·게임에 써서 돈이 하나도 남지 않았어요.",
        "sourceAnchors": [
          "B6"
        ],
        "sourceEvidence": "{hero}가 로봇·사탕·게임에 용돈을 써서 돈이 하나도 남지 않는다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      }
    ],
    "lv2": [
      {
        "id": "bicycle-lv2-01",
        "kind": "completion",
        "skill": "completion",
        "type": "빈칸 완성",
        "q": "책에서 배운 낱말을 떠올려 문장을 완성해 보세요.",
        "sentence": "돈을 쓰지 않고 아껴서 모으는 것을 무엇이라고 할까요? ____",
        "options": [
          "저축",
          "소비",
          "낭비",
          "용돈"
        ],
        "answer": 0,
        "why": "엄마는 돈을 쓰지 않고 아껴 모으는 일을 저축이라고 알려 주었어요.",
        "sourceAnchors": [
          "B5",
          "B8"
        ],
        "sourceEvidence": "엄마가 저축을 알려 주고, 저축은 돈이 모일 때까지 아껴 모으는 일이다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 1
      },
      {
        "id": "bicycle-lv2-02",
        "kind": "match",
        "skill": "categorize",
        "type": "개념 연결",
        "q": "장면과 알맞은 낱말을 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "자전거가 과자보다 비싸다고 견주어요"
          },
          {
            "id": "l1",
            "label": "쓰지 않은 용돈을 남겨 두어요"
          },
          {
            "id": "l2",
            "label": "용돈을 로봇과 게임에 모두 써요"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "모으기"
          },
          {
            "id": "r1",
            "label": "써 버리기"
          },
          {
            "id": "r2",
            "label": "비교하기"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "값을 견주는 것은 비교, 남겨 두는 것은 모으기, 다 쓰는 것은 써 버리기예요.",
        "sourceAnchors": [
          "B4",
          "B5",
          "B6"
        ],
        "sourceEvidence": "값을 비교하는 장면, 아껴 모으는 저축 장면, 용돈을 다 쓰는 장면이 각각 나온다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 2
      },
      {
        "id": "bicycle-lv2-03",
        "kind": "choice",
        "skill": "source-boundary",
        "type": "직접 확인",
        "q": "이야기에서 직접 확인할 수 있는 내용은 무엇인가요?",
        "options": [
          "엄마가 {hero} 대신 자전거를 골라 주었어요",
          "{hero}가 저축이 잘 안 된다며 방법을 물었어요",
          "{hero}가 모은 돈으로 자전거를 샀어요",
          "엄마가 {hero}에게 로봇과 사탕을 사 주었어요"
        ],
        "answer": 1,
        "why": "이야기에서는 며칠 뒤 마트에서 {hero}가 저축이 잘 안 된다며 엄마에게 방법을 물었어요.",
        "sourceAnchors": [
          "B7"
        ],
        "sourceEvidence": "며칠 뒤 마트에서 {hero}가 저축이 잘되지 않는다며 엄마에게 방법을 묻는다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 3
      },
      {
        "id": "bicycle-lv2-04",
        "kind": "sequence",
        "skill": "sequence",
        "type": "흐름 재구성",
        "q": "이야기의 흐름에 맞게 장면을 차례대로 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "엄마가 자전거는 과자보다 비싸다고 설명했어요"
          },
          {
            "id": "s1",
            "label": "{hero}가 마트에서 저축 방법을 물었어요"
          },
          {
            "id": "s2",
            "label": "{hero}가 자전거를 사 달라고 졸랐어요"
          },
          {
            "id": "s3",
            "label": "{hero}가 용돈을 모두 써 버렸어요"
          }
        ],
        "answer": [
          "s2",
          "s0",
          "s3",
          "s1"
        ],
        "why": "사 달라고 졸랐고, 엄마가 비싸다고 설명했고, 용돈을 다 쓴 뒤 마트에서 방법을 물었어요.",
        "sourceAnchors": [
          "B2",
          "B4",
          "B6",
          "B7"
        ],
        "sourceEvidence": "조르기, 값 설명, 용돈 소진, 마트에서의 질문이 이야기 흐름을 이룬다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 4
      },
      {
        "id": "bicycle-lv2-05",
        "kind": "choice",
        "skill": "main-idea",
        "type": "중심 생각",
        "q": "이 책 전체가 가장 잘 알려 주는 생각은 무엇인가요?",
        "options": [
          "자전거는 과자보다 비싸요",
          "엄마가 {hero}에게 용돈을 주었어요",
          "{hero}가 용돈을 로봇과 사탕에 썼어요",
          "갖고 싶은 것은 용돈을 아껴 모아서 살 수 있어요"
        ],
        "answer": 3,
        "why": "책 전체는 갖고 싶은 것을 용돈을 아껴 모아서 살 수 있다는 저축을 알려 줘요. 나머지는 책에 나오지만 한 장면만 말하는 좁은 사실이에요.",
        "sourceAnchors": [
          "B5",
          "B6",
          "B8"
        ],
        "sourceEvidence": "저축을 배우고 용돈을 다 써 본 뒤, 저축은 살 만큼 돈이 모일 때까지 모으는 일임이 드러난다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 5
      },
      {
        "id": "bicycle-lv2-06",
        "kind": "recall",
        "skill": "recall",
        "type": "정보 회상",
        "q": "엄마가 자전거를 바로 사 주지 않으면서 보여 주거나 알려 준 것을 두 가지 이상 말해 보세요.",
        "prompts": [
          "엄마가 방에서 무엇을 보여 주었는지 말했어요",
          "자전거 값에 대해 무엇이라고 했는지 말했어요",
          "돈을 어떻게 하라고 알려 주었는지 말했어요"
        ],
        "hint": "킥보드와 많은 장난감, 비싼 값, 저축을 떠올려 보세요.",
        "exampleAnswer": "엄마는 얼마 전에 산 킥보드와 방 안 장난감을 보여 주고, 자전거는 과자보다 비싸다고 하며 용돈을 아껴 모으는 저축을 알려 주었어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "B3",
          "B4",
          "B5"
        ],
        "sourceEvidence": "엄마가 킥보드와 장난감을 보여 주고, 비싼 값을 설명하고, 저축을 알려 준다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 6
      },
      {
        "id": "bicycle-lv2-07",
        "kind": "distancing",
        "skill": "inquiry-plan",
        "type": "질문 만들기",
        "q": "이 책을 읽고 용돈에 대해 더 알고 싶은 질문 하나와 그 답을 알아볼 순서를 만들어 보세요.",
        "prompts": [
          "무엇이 더 궁금한지 질문으로 만들었어요",
          "먼저 누구에게 물어볼지 정했어요",
          "다음에 어떻게 확인할지 말했어요"
        ],
        "hint": "자전거를 사려면 용돈을 얼마나, 며칠이나 모아야 할지 생각해 보세요.",
        "exampleAnswer": "자전거를 사려면 용돈을 얼마나 모아야 할까요? 먼저 엄마에게 자전거 값을 묻고, 한 주에 모으는 용돈으로 며칠이 걸릴지 세어 볼래요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "B5",
          "B8"
        ],
        "sourceEvidence": "엄마가 저축을 알려 주고, 저축은 살 만큼 돈이 모일 때까지 아껴 모으는 일이다.",
        "sourceRelation": "extension",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 7
      }
    ]
  },
  "transport": {
    "lv1": [
      {
        "id": "transport-lv1-01",
        "kind": "choice",
        "skill": "identify-object",
        "type": "핵심 대상",
        "q": "{hero}와 엄마는 어디에 가기로 했나요?",
        "options": [
          "바닷가 이모 댁",
          "도시 삼촌 댁",
          "시골 할머니 댁",
          "산 너머 외갓집"
        ],
        "answer": 2,
        "why": "{hero}와 엄마는 시골 할머니 댁에 가기로 했어요.",
        "sourceAnchors": [
          "T1"
        ],
        "sourceEvidence": "아이가 엄마와 함께 시골 할머니 댁에 가기로 한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "transport-lv1-02",
        "kind": "choice",
        "skill": "identify-action",
        "type": "행동 찾기",
        "q": "버스에서 내릴 곳이 다가오자 {hero}는 무엇을 했나요?",
        "options": [
          "미리 벨을 눌렀어요",
          "손잡이를 놓았어요",
          "교통 카드를 찍었어요",
          "자리 번호를 찾았어요"
        ],
        "answer": 0,
        "why": "내릴 곳이 다가오자 {hero}는 미리 벨을 눌렀어요.",
        "sourceAnchors": [
          "T4"
        ],
        "sourceEvidence": "버스에서 내릴 곳이 다가오자 미리 벨을 누른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "transport-lv1-03",
        "kind": "choice",
        "skill": "retrieve-fact",
        "type": "책 속 사실",
        "q": "{hero}가 정류장에서 고른 버스는 무슨 색인가요?",
        "options": [
          "빨간 버스",
          "초록 버스",
          "파란 버스",
          "노란 버스"
        ],
        "answer": 1,
        "why": "정류장에서 여러 색 버스 가운데 초록 버스를 골랐어요.",
        "sourceAnchors": [
          "T2"
        ],
        "sourceEvidence": "버스 정류장에서 여러 색 버스 가운데 초록 버스를 고른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "transport-lv1-04",
        "kind": "match",
        "skill": "match-object",
        "type": "짝 연결",
        "q": "각 탈것과 그 탈것에서 나온 물건을 선으로 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "버스"
          },
          {
            "id": "l1",
            "label": "지하철"
          },
          {
            "id": "l2",
            "label": "기차"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "개찰구"
          },
          {
            "id": "r1",
            "label": "기차표"
          },
          {
            "id": "r2",
            "label": "손잡이"
          }
        ],
        "answer": {
          "l0": "r2",
          "l1": "r0",
          "l2": "r1"
        },
        "why": "버스에는 손잡이, 지하철에는 개찰구, 기차에는 기차표가 나와요.",
        "sourceAnchors": [
          "T4",
          "T6",
          "T8"
        ],
        "sourceEvidence": "버스에서 손잡이를 잡고, 지하철은 개찰구를 지나며, 기차는 기차표 번호로 자리를 찾는다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "transport-lv1-05",
        "kind": "sequence",
        "skill": "sequence",
        "type": "이야기 순서",
        "q": "{hero}가 탄 순서대로 장면을 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "지하철로 갈아탔어요"
          },
          {
            "id": "s1",
            "label": "빠른 기차에 탔어요"
          },
          {
            "id": "s2",
            "label": "초록 버스에 탔어요"
          },
          {
            "id": "s3",
            "label": "지하철이 기차역에 도착했어요"
          }
        ],
        "answer": [
          "s2",
          "s0",
          "s3",
          "s1"
        ],
        "why": "버스에 탄 뒤 지하철로 갈아타고, 기차역에 도착해 기차를 탔어요.",
        "sourceAnchors": [
          "T3",
          "T5",
          "T7",
          "T8"
        ],
        "sourceEvidence": "버스에 탄 뒤 지하철로 갈아타고 기차역에 도착해 빠른 기차에 오른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      },
      {
        "id": "transport-lv1-06",
        "kind": "choice",
        "skill": "final-result",
        "type": "마지막 결과",
        "q": "이야기의 마지막에 {hero}는 무엇에 탔나요?",
        "options": [
          "버스",
          "지하철",
          "택시",
          "기차"
        ],
        "answer": 3,
        "why": "이야기의 마지막에 {hero}는 번호를 찾아 기차에 탔어요.",
        "sourceAnchors": [
          "T8"
        ],
        "sourceEvidence": "기차표의 번호를 보고 자리를 찾아 빠른 기차에 오른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective"
      }
    ],
    "lv2": [
      {
        "id": "transport-lv2-01",
        "kind": "completion",
        "skill": "completion",
        "type": "빈칸 완성",
        "q": "책 내용을 떠올려 빈칸을 채워 보세요.",
        "sentence": "지하철은 땅속과 땅 위를 달려 기차로 갈아타는 ____에 도착했어요.",
        "options": [
          "기차역",
          "공항",
          "항구",
          "정류장"
        ],
        "answer": 0,
        "why": "지하철은 땅속과 땅 위를 달려 기차로 갈아타는 기차역에 도착했어요.",
        "sourceAnchors": [
          "T7",
          "T8"
        ],
        "sourceEvidence": "지하철이 기차역에 도착하고, 거기서 번호를 찾아 빠른 기차로 갈아탄다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 1
      },
      {
        "id": "transport-lv2-02",
        "kind": "match",
        "skill": "categorize",
        "type": "개념 짝짓기",
        "q": "각 장면과 그 장면이 뜻하는 낱말을 이어 보세요.",
        "leftItems": [
          {
            "id": "l0",
            "label": "교통 카드를 찍었어요"
          },
          {
            "id": "l1",
            "label": "내릴 곳에서 벨을 눌렀어요"
          },
          {
            "id": "l2",
            "label": "줄을 서서 차례로 탔어요"
          }
        ],
        "rightItems": [
          {
            "id": "r0",
            "label": "차례 지키기"
          },
          {
            "id": "r1",
            "label": "요금 내기"
          },
          {
            "id": "r2",
            "label": "내린다는 신호"
          }
        ],
        "answer": {
          "l0": "r1",
          "l1": "r2",
          "l2": "r0"
        },
        "why": "카드 찍기는 요금 내기, 벨은 내린다는 신호, 줄서기는 차례 지키기예요.",
        "sourceAnchors": [
          "T3",
          "T4",
          "T6"
        ],
        "sourceEvidence": "교통 카드를 찍고 타며, 내릴 곳에서 벨을 누르고, 개찰구를 지나 줄을 서서 탄다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 2
      },
      {
        "id": "transport-lv2-03",
        "kind": "choice",
        "skill": "verify-detail",
        "type": "직접 확인",
        "q": "이야기에서 지하철은 어떻게 달렸나요?",
        "options": [
          "늘 땅속으로만 달렸어요",
          "늘 땅 위로만 달렸어요",
          "땅속과 땅 위를 번갈아 달렸어요",
          "강 밑 터널로만 달렸어요"
        ],
        "answer": 2,
        "why": "지하철은 땅속과 땅 위를 번갈아 달렸어요.",
        "sourceAnchors": [
          "T7"
        ],
        "sourceEvidence": "지하철이 땅속과 땅 위를 달려 기차역에 도착한다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 3
      },
      {
        "id": "transport-lv2-04",
        "kind": "sequence",
        "skill": "sequence",
        "type": "흐름 재구성",
        "q": "이야기 전체 흐름에 맞게 장면을 놓아 보세요.",
        "items": [
          {
            "id": "s0",
            "label": "개찰구를 지나 지하철에 탔어요"
          },
          {
            "id": "s1",
            "label": "할머니 댁에 가기로 했어요"
          },
          {
            "id": "s2",
            "label": "번호를 보고 빠른 기차에 탔어요"
          },
          {
            "id": "s3",
            "label": "교통 카드를 찍고 버스에 탔어요"
          }
        ],
        "answer": [
          "s1",
          "s3",
          "s0",
          "s2"
        ],
        "why": "할머니 댁에 가기로 한 뒤 버스, 지하철, 기차를 차례로 탔어요.",
        "sourceAnchors": [
          "T1",
          "T3",
          "T6",
          "T8"
        ],
        "sourceEvidence": "할머니 댁에 가기로 한 뒤 버스, 지하철, 기차를 차례로 갈아탄다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 4
      },
      {
        "id": "transport-lv2-05",
        "kind": "choice",
        "skill": "main-idea",
        "type": "중심 생각",
        "q": "이 책이 가장 잘 알려 주는 내용은 무엇인가요?",
        "options": [
          "여러 탈것 중 기차가 가장 빨라요",
          "여러 탈것을 차례로 갈아타 목적지에 갔어요",
          "혼자서도 길을 잘 찾아다녔어요",
          "탈것마다 표 사는 방법이 달라요"
        ],
        "answer": 1,
        "why": "이야기는 여러 탈것을 차례로 갈아타며 목적지까지 가는 과정을 알려 줘요.",
        "sourceAnchors": [
          "T1",
          "T3",
          "T5",
          "T6",
          "T8"
        ],
        "sourceEvidence": "할머니 댁으로 가며 버스에서 지하철, 기차로 갈아타는 여러 장면이 이어진다.",
        "sourceRelation": "inference",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "objective",
        "order": 5
      },
      {
        "id": "transport-lv2-06",
        "kind": "recall",
        "skill": "recall",
        "type": "두 가지 회상",
        "q": "{hero}가 이번 여행에서 탄 탈것을 두 가지 이상 말해 보세요.",
        "prompts": [
          "탈것 이름을 두 가지 말했어요",
          "갈아탄 순서를 이어 말했어요",
          "힌트를 보고 다시 말했어요"
        ],
        "hint": "버스, 지하철, 기차 가운데 떠오르는 것을 골라 보세요.",
        "exampleAnswer": "{hero}는 버스를 타고 가다가 지하철로 갈아타고, 마지막에는 빠른 기차를 탔어요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "T3",
          "T5",
          "T8"
        ],
        "sourceEvidence": "버스에 탔다가 지하철로 갈아타고 마지막에 기차에 오른다.",
        "sourceRelation": "direct",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 6
      },
      {
        "id": "transport-lv2-07",
        "kind": "distancing",
        "skill": "inquiry",
        "type": "새 질문 만들기",
        "q": "책에 나오지 않은 탈것 하나를 골라 더 알고 싶은 질문과 알아볼 순서를 말해 보세요.",
        "prompts": [
          "더 알고 싶은 교통 질문을 만들었어요",
          "책에서 답을 찾을 수 있는지 살폈어요",
          "알아볼 방법이나 사람을 정했어요"
        ],
        "hint": "책에 나온 탈것과 나오지 않은 탈것을 구분해 보세요.",
        "exampleAnswer": "비행기는 어떻게 표를 사고 탈까요? 어린이 교통 안전 책을 먼저 찾아보고 어른에게 물어 차례로 알아볼래요.",
        "why": "책 속 내용을 내 말로 다시 꺼내면 이해가 더 단단해져요.",
        "sourceAnchors": [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8"
        ],
        "sourceEvidence": "책은 버스·지하철·기차를 타고 갈아타는 과정을 보여 주지만 다른 탈것은 다루지 않는다.",
        "sourceRelation": "extension",
        "sourceStatus": "adapted-story-awaiting-page-verification",
        "scoreMode": "performance",
        "order": 7
      }
    ]
  }
};

const SPEAKING_KINDS = new Set(["recall", "open-ended", "distancing"]);

// Built from the real questions, so the level card always matches the quiz.
export const levelDetail = (level) => {
  const books = Object.values(CURRICULUM_QUESTIONS);
  const questions = books[0]?.[level] || [];
  const speaking = questions.filter((q) => SPEAKING_KINDS.has(q.kind)).length;
  const objective = questions.length - speaking;
  if (level === "lv1") {
    return `문제 ${objective}개 · 선택지 4개 · 혼자 풀기`;
  }
  return `객관 ${objective} + 말하기·녹음 ${speaking} · 줄거리 낭독으로 시작`;
};
