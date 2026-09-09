"use client";

import * as React from "react";

/**
 * Measures its own width with a ResizeObserver and hands explicit pixel
 * dimensions to a Recharts chart. Recharts 3's own <ResponsiveContainer> can
 * get stuck at 0×0 under React 19, so we size the chart ourselves.
 */
export function ChartFrame({
  height,
  className,
  children,
}: {
  height: number;
  className?: string;
  children: (dims: { width: number; height: number }) => React.ReactElement;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ width: "100%", height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
}
