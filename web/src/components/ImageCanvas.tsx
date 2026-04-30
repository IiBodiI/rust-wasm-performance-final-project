import { forwardRef } from "react";

interface ImageCanvasProps {
  label: string;
}

export const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ label }, ref) => (
  <figure className="canvas-frame">
    <figcaption>{label}</figcaption>
    <canvas aria-label={label} ref={ref} />
  </figure>
));

ImageCanvas.displayName = "ImageCanvas";

