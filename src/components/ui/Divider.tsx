import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", decorative = false, ...props }, ref) => {
    const isVertical = orientation === "vertical";
    const baseClass = isVertical
      ? "w-px h-full mx-2 bg-border/50"
      : "h-px w-full my-2 bg-border/50";

    const roleProps = decorative
      ? { 'aria-hidden': true }
      : { role: 'separator', 'aria-orientation': orientation };

    return (
      <div
        ref={ref}
        className={cn(baseClass, className)}
        {...roleProps}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export { Divider };
export default Divider;
