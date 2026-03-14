import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "sf-button whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "sf-button--default",
        secondary: "sf-button--secondary",
        outline: "sf-button--outline",
        ghost: "sf-button--ghost",
        destructive: "sf-button--destructive"
      },
      size: {
        default: "sf-button--md",
        sm: "sf-button--sm",
        lg: "sf-button--lg",
        icon: "sf-button--icon"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ className, variant, size }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
