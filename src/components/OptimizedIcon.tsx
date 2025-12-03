"use client";

import dynamic from "next/dynamic";
import { LucideProps } from "lucide-react";
import { ComponentType, memo } from "react";

// Create a map of icon names to their dynamic imports
const iconMap = {
  ArrowRight: dynamic(() => import("lucide-react").then(mod => ({ default: mod.ArrowRight }))),
  Check: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Check }))),
  Brain: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Brain }))),
  Target: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Target }))),
  BarChart3: dynamic(() => import("lucide-react").then(mod => ({ default: mod.BarChart3 }))),
  Zap: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Zap }))),
  Shield: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Shield }))),
  TrendingUp: dynamic(() => import("lucide-react").then(mod => ({ default: mod.TrendingUp }))),
  Sparkles: dynamic(() => import("lucide-react").then(mod => ({ default: mod.Sparkles }))),
} as const;

type IconName = keyof typeof iconMap;

interface OptimizedIconProps extends LucideProps {
  name: IconName;
}

/**
 * Optimized icon component that lazy loads lucide-react icons
 * This reduces the initial bundle size significantly
 */
const OptimizedIcon = memo(({ name, ...props }: OptimizedIconProps) => {
  const Icon = iconMap[name] as ComponentType<LucideProps>;

  if (!Icon) {
    return null;
  }

  return <Icon {...props} />;
});

OptimizedIcon.displayName = "OptimizedIcon";

export default OptimizedIcon;
export type { IconName };
