import type { ReactNode } from "react";

// The one layout every analysis renders into. Columns on larger screens and stacked panels on phones are
// defined here and nowhere else: later phases fill the columns, they don't move
// them. The detail pane is a real column, not an overlay, so opening it never
// covers the map.
export function Shell({ rail, map, detail }: { rail?: ReactNode; map?: ReactNode; detail?: ReactNode }) {
  return (
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(14rem,1fr)_minmax(12rem,0.8fr)] md:grid-cols-[12rem_minmax(0,1fr)_21rem] md:grid-rows-1">
      <nav aria-label="Categories" className="min-h-0 min-w-0 max-h-28 overflow-auto border-b border-line bg-surface md:max-h-none md:border-r md:border-b-0">
        {rail}
      </nav>
      <section aria-label="Map" className="workspace-map relative min-h-0 min-w-0 bg-canvas">
        {map}
      </section>
      <aside aria-label="Details" className="min-h-0 min-w-0 overflow-y-auto border-t border-line bg-surface md:border-t-0 md:border-l">
        {detail}
      </aside>
    </div>
  );
}
