import React, { useMemo, useState } from "react";
import {
  GENRES,
  SKIES,
  layoutForest,
  place,
  stageFor,
  nextStageFor,
  starField,
  treeParts,
} from "./forestGeometry";

const TIMES = [
  { id: "day", label: "낮" },
  { id: "sunset", label: "노을" },
  { id: "night", label: "밤" },
];

// The forest is the main collection view: every completed book is a tree on a
// growing island. Tree type = book genre, tree size = quiz level (and it grows
// to a big tree a week after it was read). Visual is kept from the design
// handoff; text uses the app font to stay offline-friendly.
export function ForestView({ trees, todayBook, onQuiz, onOpenShelf, onOpenStats, onReread }) {
  const [selIdx, setSelIdx] = useState(null);
  const [time, setTime] = useState("day");
  const n = trees.length;
  const forest = useMemo(() => layoutForest(trees, 1), [trees]);
  const sky = SKIES[time];
  const stars = sky.stars > 0 ? starField(sky.stars) : [];
  const stage = stageFor(Math.max(1, n));
  const next = nextStageFor(n);
  const progress = next ? (n - stage.min) / (next.min - stage.min) : 1;

  const sel = selIdx != null ? forest.list.find((t) => t.i === selIdx) : null;
  const F = forest;

  return (
    <div className="page forest-page">
      <div className="forest-scene">
        <svg
          className="forest-svg"
          viewBox="0 0 1000 776"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={sky.top} />
              <stop offset="1" stopColor={sky.bottom} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="776" fill="url(#forestSky)" />
          {stars.map((s) => (
            <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} fill="#FFF3D6" opacity={s.o} />
          ))}
          <circle cx={sky.sunX} cy={sky.sunY} r="46" fill={sky.sun} opacity="0.9" />

          <ellipse cx="500" cy={F.cy} rx={F.R + 42} ry={F.ry + 22} fill={sky.water} />
          <ellipse cx="500" cy={F.cy} rx={F.R + 18} ry={F.ry + 9} fill={sky.sand} />
          <ellipse cx="500" cy={F.cy} rx={F.R} ry={F.ry} fill={sky.grass} />
          <ellipse cx="500" cy={F.cy - F.ry * 0.18} rx={F.R * 0.66} ry={F.ry * 0.6} fill={sky.grassLight} opacity="0.55" />

          {n >= 50 && (
            <path
              d={`M ${F.cx - F.R * 0.8} ${F.cy + F.ry * 0.15} Q ${F.cx - F.R * 0.1} ${F.cy + F.ry * 0.72} ${F.cx + F.R * 0.55} ${F.cy + F.ry * 0.22}`}
              fill="none"
              stroke={sky.sand}
              strokeWidth={Math.max(6, F.R * 0.045)}
              strokeLinecap="round"
              opacity="0.85"
            />
          )}
          {n >= 20 && (
            <ellipse cx={F.cx - F.R * 0.46} cy={F.cy + F.ry * 0.38} rx={F.R * 0.15} ry={F.ry * 0.17} fill={sky.water} />
          )}

          {F.list.map((t) => {
            const tr = `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) scale(${t.s.toFixed(3)})`;
            return place(treeParts(t.genre, t.lv, t.H, { shadow: true, simple: t.s < 0.42 }), tr, t.i + "-").map(
              (p) => <path key={p.key} d={p.d} fill={p.fill} transform={p.t} />,
            );
          })}

          {n >= 100 && (
            <g transform={`translate(${F.cx + F.R * 0.52} ${F.cy - F.ry * 0.34}) scale(0.9)`}>
              <path d="M -26 0 L -26 -22 L 26 -22 L 26 0 Z" fill="#A9744F" />
              <path d="M -32 -22 L 0 -44 L 32 -22 Z" fill="#7B4B3A" />
              <rect x="-7" y="-16" width="14" height="16" rx="2" fill="#FFC93C" />
            </g>
          )}

          {sel && (
            <circle
              cx={sel.x}
              cy={sel.y - sel.H * 0.42 * sel.s}
              r={Math.max(26, sel.H * 0.42 * sel.s)}
              fill="none"
              stroke="#FFC93C"
              strokeWidth="4"
              className="forest-sel-ring"
            />
          )}
          {F.list.map((t) => (
            <circle
              key={"h" + t.i}
              cx={t.x}
              cy={t.y - t.H * 0.42 * t.s}
              r={Math.max(15, t.H * 0.34 * t.s)}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => setSelIdx(t.i)}
            />
          ))}
        </svg>

        <div className="forest-stagecard">
          <div className="forest-owner">내 생각의 숲</div>
          <div className="forest-stagename">{stage.name}</div>
          <div className="forest-count">
            <strong>{n}</strong>
            <span>그루 · 읽은 책 {n}권</span>
          </div>
          <div className="forest-progress">
            <div style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="forest-next">
            {next ? `${next.name}까지 ${next.min - n}권` : "가장 큰 숲이에요!"}
          </div>
        </div>

        {todayBook && (
          <button className="forest-quiz-btn" onClick={onQuiz}>
            <span className="forest-quiz-mark">?</span>
            <span>
              <strong>오늘의 퀴즈 풀기</strong>
              <small>{todayBook}</small>
            </span>
          </button>
        )}

        <div className="forest-times">
          {TIMES.map((t) => (
            <button
              key={t.id}
              className={`forest-time-chip ${time === t.id ? "on" : ""}`}
              onClick={() => setTime(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="forest-corner-btns">
          <button className="forest-shelf-btn" onClick={onOpenStats}>
            기록
          </button>
          <button className="forest-shelf-btn" onClick={onOpenShelf}>
            책장으로 보기
          </button>
        </div>

        <div className="forest-legend">
          책 위에서 자라는 생각의 나무 · LV1 묘목 · LV2 자란나무 · 일주일 뒤 큰나무
        </div>

        {n === 0 && (
          <div className="forest-empty">
            <strong>아직 숲이 비어 있어요.</strong>
            <span>퀴즈를 마치면 책 위에 첫 나무가 자라요.</span>
          </div>
        )}

        {sel && (
          <div className="forest-detail" role="dialog" aria-label={`${sel.title} 나무`}>
            <div className="forest-detail-top">
              <span className="forest-genretag" style={{ background: GENRES[sel.genre].backdrop }}>
                {GENRES[sel.genre].name}
              </span>
              <button className="forest-detail-close" onClick={() => setSelIdx(null)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="forest-detail-art" style={{ background: GENRES[sel.genre].backdrop }}>
              <svg viewBox="0 0 200 200" className="forest-detail-tree">
                <ellipse cx="100" cy="182" rx="48" ry="10" fill="rgba(30,50,30,.14)" />
                {place(treeParts(sel.genre, sel.lv, sel.lv === 1 ? 108 : 138, { big: true }), "translate(100 182)", "dp").map(
                  (p) => <path key={p.key} d={p.d} fill={p.fill} transform={p.t} />,
                )}
              </svg>
            </div>
            <div className="forest-detail-title">{sel.title}</div>
            <div className="forest-detail-sub">
              {sel.dateText} 읽음 · {GENRES[sel.genre].tree}
            </div>
            <div className="forest-detail-stats">
              <div>
                <span>퀴즈 난이도</span>
                <strong>{sel.levelLabel}</strong>
              </div>
              <div>
                <span>맞힌 개수</span>
                <strong>{sel.scoreText}</strong>
              </div>
            </div>
            <div className={`forest-growth ${sel.fresh ? "growing" : "grown"}`}>
              {sel.fresh ? "아직 자라는 중 · 일주일 뒤 큰 나무로" : "일주일 성장 완료"}
            </div>
            <div className="forest-detail-actions">
              <button className="primary" onClick={() => onReread(sel.bookId)}>
                다시 읽기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
