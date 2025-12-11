"use client"

import { useReveal } from "@/hooks/use-reveal"
import { TrendingUp, Globe, Brain } from "lucide-react"

export function CapabilitiesSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            AI Capabilities
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Powered by machine learning</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-12 lg:gap-x-24">
          {[
            {
              title: "Nutrition Analysis",
              description: "Real-time scanning and nutritional breakdown with open data analytics",
              icon: TrendingUp,
              direction: "top",
            },
            {
              title: "Cultural Pairing",
              description: "Discover cultural food combinations and traditional snack pairings worldwide",
              icon: Globe,
              direction: "right",
            },
            {
              title: "Smart Recommendations",
              description: "ML-powered suggestions tailored to your health goals and taste preferences",
              icon: Brain,
              direction: "left",
            },
            {
              title: "Health Insights",
              description: "Track snack consumption patterns and get personalized wellness insights",
              icon: TrendingUp,
              direction: "bottom",
            },
          ].map((capability, i) => (
            <CapabilityCard key={i} capability={capability} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CapabilityCard({
  capability,
  index,
  isVisible,
}: {
  capability: { title: string; description: string; icon: any; direction: string }
  index: number
  isVisible: boolean
}) {
  const Icon = capability.icon
  const getRevealClass = () => {
    if (!isVisible) {
      switch (capability.direction) {
        case "left":
          return "-translate-x-16 opacity-0"
        case "right":
          return "translate-x-16 opacity-0"
        case "top":
          return "-translate-y-16 opacity-0"
        case "bottom":
          return "translate-y-16 opacity-0"
        default:
          return "translate-y-12 opacity-0"
      }
    }
    return "translate-x-0 translate-y-0 opacity-100"
  }

  return (
    <div
      className={`group transition-all duration-700 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-mono text-xs text-foreground/60">0{index + 1}</span>
      </div>
      <h3 className="mb-2 font-sans text-2xl font-light text-foreground md:text-3xl">{capability.title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-foreground/80 md:text-base">{capability.description}</p>
    </div>
  )
}
