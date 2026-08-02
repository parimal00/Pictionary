import React, { useRef, useState, useEffect } from "react";

interface DrawingCanvasProps {
  isDrawingAllowed?: boolean; // Controls whether mouse/touch events draw
}

const COLORS = [
  "#000000", // Black
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#a855f7", // Purple
  "#ffffff", // White
];

const BRUSH_SIZES = [2, 6, 12, 24];

export function DrawingCanvas({ isDrawingAllowed = true }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);

  // Set white background on canvas init so downloads/clears don't show transparent grids
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high-DPI scaling for sharp rendering
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  // Helper to get exact canvas-relative mouse coordinates
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingAllowed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingAllowed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={styles.wrapper}>
      {isDrawingAllowed && (
        <div style={styles.toolbar}>
          <div style={styles.group}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                style={{
                  ...styles.colorBtn,
                  backgroundColor: c,
                  border: color === c && !isEraser ? "2px solid #38bdf8" : "1px solid #475569",
                  transform: color === c && !isEraser ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.group}>
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                style={{
                  ...styles.sizeBtn,
                  border: brushSize === size ? "1px solid #38bdf8" : "1px solid #334155",
                  backgroundColor: brushSize === size ? "#1e293b" : "transparent",
                }}
              >
                <span
                  style={{
                    width: `${size / 1.5}px`,
                    height: `${size / 1.5}px`,
                    borderRadius: "50%",
                    backgroundColor: isEraser ? "#94a3b8" : color,
                  }}
                />
              </button>
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.group}>
            <button
              onClick={() => setIsEraser(!isEraser)}
              style={{
                ...styles.actionBtn,
                backgroundColor: isEraser ? "#0284c7" : "#1e293b",
                color: "#fff",
              }}
            >
              ✏️ Eraser
            </button>
            <button onClick={handleClear} style={{ ...styles.actionBtn, backgroundColor: "#ef4444", color: "#fff" }}>
              🗑️ Clear
            </button>
          </div>
        </div>
      )}

      <div style={styles.canvasFrame}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            ...styles.canvas,
            cursor: isDrawingAllowed ? (isEraser ? "cell" : "crosshair") : "default",
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    gap: "12px",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "8px 16px",
  },
  group: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#334155",
  },
  colorBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  sizeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  actionBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
  canvasFrame: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b0f19",
    overflow: "hidden",
  },
  canvas: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    maxWidth: "100%",
    maxHeight: "100%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
};