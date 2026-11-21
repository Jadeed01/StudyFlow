const PALETTE = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform"
          style={{
            backgroundColor: color,
            transform: value === color ? "scale(1.15)" : "scale(1)",
            boxShadow: value === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : "none",
          }}
        />
      ))}
    </div>
  );
}