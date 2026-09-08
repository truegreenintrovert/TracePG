export default function SidebarResizeHandle({ width, isDragging, onStartResize }) {
  return (
    <div
      className={`fixed bottom-0 top-0 z-[45] hidden w-1 shrink-0 cursor-col-resize bg-slate-200 transition-colors hover:bg-brand-500/50 lg:block dark:bg-slate-800 ${isDragging ? "bg-brand-600" : ""}`}
      style={{ left: `${width}px` }}
      role="separator"
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      onMouseDown={onStartResize}
    />
  );
}
