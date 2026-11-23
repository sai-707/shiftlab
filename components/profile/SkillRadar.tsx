import { radarPath, radarPoint } from "@/lib/radar";
import { TOPIC_COLOR } from "@/lib/topics";
import type { Topic } from "@/lib/types";

export type RadarTopic = { topic: Topic; avg: number | null };

const W = 300;
const H = 250;
const CX = 150;
const CY = 125;
const R = 78;

/** Average score per topic as a radar. A topic with no closed alert sits at the centre. The list beside it carries the same numbers in words. */
export default function SkillRadar({ topics }: { topics: RadarTopic[] }) {
  const n = topics.length;
  if (n < 3) return null;
  const values = topics.map((t) => t.avg ?? 0);
  const label = `Skills radar. ${topics.map((t) => `${t.topic}: ${t.avg ?? "not tried"}`).join(", ")}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-3 w-full max-w-sm" role="img" aria-label={label}>
      <g fill="none" stroke="var(--color-line)" strokeWidth="1">
        {[25, 50, 75, 100].map((ring) => (
          <polygon key={ring} points={radarPath(topics.map(() => ring), CX, CY, R)} />
        ))}
        {topics.map((t, i) => {
          const end = radarPoint(i, n, 100, CX, CY, R);
          return <line key={t.topic} x1={CX} y1={CY} x2={end.x} y2={end.y} />;
        })}
      </g>

      <polygon
        className="pf-radar"
        style={{ transformOrigin: `${CX}px ${CY}px` }}
        points={radarPath(values, CX, CY, R)}
        fill="rgb(34 211 238 / 0.2)"
        stroke="var(--color-accent)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {topics.map((t, i) => {
        const dot = radarPoint(i, n, values[i], CX, CY, R);
        const text = radarPoint(i, n, 100, CX, CY, R + 15);
        const side = text.x - CX;
        return (
          <g key={t.topic}>
            <circle cx={dot.x} cy={dot.y} r="3" fill={TOPIC_COLOR[t.topic]} />
            <text x={text.x} y={text.y + 3.5} textAnchor={side > 8 ? "start" : side < -8 ? "end" : "middle"} fontSize="10" fill="var(--color-muted)">
              {t.topic}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
