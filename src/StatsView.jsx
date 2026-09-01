import React from "react";
import { ArrowLeft } from "lucide-react";
import { GENRES, LV, STAGES, place, stageFor, treeParts } from "./forestGeometry";

// 기록 (growth record): parents-friendly view built entirely from the child's
// real completed books — this week's reading, tree levels, and genre spread.
export function StatsView({ trees, weekBars, onBack }) {
  const n = trees.length;
  const stage = stageFor(Math.max(1, n));
  const maxWeek = Math.max(1, ...weekBars.map((w) => w.n));

  const lvCounts = [0, 0, 0, 0];
  const genreCounts = Array(GENRES.length).fill(0);
  trees.forEach((t) => {
    lvCounts[t.lv] = (lvCounts[t.lv] || 0) + 1;
    genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
  });
  const maxGenre = Math.max(1, ...genreCounts);
  const lvColor = ["", "#a7d18f", "#4fa96b", "#2e7d52"];
  const lvName = ["", "LV1 묘목", "LV2 자란 나무", "큰 나무 · 일주일 성장"];

  return (
    <div className="page stats-page">
      <button className="shelf-to-forest" onClick={onBack}>
        <ArrowLeft size={17} /> 내 숲으로
      </button>
      <span className="eyebrow">성장 기록</span>
      <h1>부모님도 볼 수 있어요</h1>

      <section className="stats-card">
        <h2>이번 주에 읽은 책</h2>
        <div className="stats-week">
          {weekBars.map((w, i) => (
            <div className="stats-week-col" key={i}>
              <strong>{w.n}</strong>
              <div
                className="stats-bar"
                style={{ height: `${Math.max(6, (w.n / maxWeek) * 120)}px` }}
              />
              <span>{w.day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-card">
        <h2>나무 크기</h2>
        <div className="stats-rows">
          {[1, 2, 3].map((l) => (
            <div className="stats-row" key={l}>
              <div className="stats-row-top">
                <span>{lvName[l]}</span>
                <span>{lvCounts[l]}그루</span>
              </div>
              <div className="stats-track">
                <div
                  style={{
                    width: `${Math.round((lvCounts[l] / Math.max(1, n)) * 100)}%`,
                    background: lvColor[l],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="stats-hint">
          퀴즈는 LV1·LV2 두 단계예요. LV2 나무는 읽은 지 일주일이 지나면 큰 나무로 자라요.
        </p>
      </section>

      <section className="stats-card">
        <h2>장르별 나무</h2>
        <div className="stats-genres">
          {GENRES.map((g, i) =>
            genreCounts[i] === 0 ? null : (
              <div className="stats-genre" key={i}>
                <svg viewBox="0 0 60 60" className="stats-genre-icon">
                  {place(treeParts(i, 2, 44, {}), "translate(30 52) scale(0.7)", `g${i}-`).map(
                    (p) => <path key={p.key} d={p.d} fill={p.fill} transform={p.t} />,
                  )}
                </svg>
                <div className="stats-genre-body">
                  <div className="stats-genre-name">{g.name}</div>
                  <div className="stats-track">
                    <div style={{ width: `${Math.round((genreCounts[i] / maxGenre) * 100)}%`, background: g.leaf }} />
                  </div>
                </div>
                <strong>{genreCounts[i]}</strong>
              </div>
            ),
          )}
          {n === 0 && <p className="stats-hint">아직 심은 나무가 없어요.</p>}
        </div>
      </section>

      <section className="stats-card">
        <h2>숲의 단계</h2>
        <div className="stats-stages">
          {STAGES.map((s) => (
            <div
              key={s.name}
              className={`stats-stage ${s.name === stage.name ? "on" : ""}`}
            >
              <span>{s.name}</span>
              <span className="stats-stage-range">{s.range}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
