"use client";

import * as React from "react";
import { useXAxisScale, useYAxisScale, usePlotArea } from "recharts";
import { WORLD_MAP_PATH } from "@/lib/world-map-path";

/**
 * Faint equirectangular land outline drawn behind the scatter, aligned to the
 * chart's longitude/latitude axes via Recharts' scale hooks. Render as a direct
 * child of <ScatterChart>, before the <Scatter> layers.
 *
 * Path space (see lib/world-map-path.ts): x = lon + 180, y = 90 - lat.
 */
export function WorldMapLayer() {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  const clipId = React.useId();

  if (!xScale || !yScale || !plot) return null;

  // Both axis scales are linear, so a single affine transform maps the whole
  // path: screenX = xScale(-180) + px * (xScale(-179) - xScale(-180)), etc.
  const tx = Number(xScale(-180));
  const ty = Number(yScale(90));
  const kx = Number(xScale(-179)) - tx;
  const ky = Number(yScale(89)) - ty;
  if (![kx, ky, tx, ty].every(Number.isFinite) || kx === 0 || ky === 0) {
    return null;
  }

  return (
    <g aria-hidden className="recharts-world-map">
      <defs>
        <clipPath id={clipId}>
          <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          d={WORLD_MAP_PATH}
          transform={`translate(${tx} ${ty}) scale(${kx} ${ky})`}
          fill="var(--muted-foreground)"
          fillOpacity={0.05}
          stroke="var(--muted-foreground)"
          strokeOpacity={0.3}
          strokeWidth={0.75}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </g>
  );
}
