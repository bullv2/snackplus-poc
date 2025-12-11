"use client"

import { useReveal } from "@/hooks/use-reveal"
import { Barcode, Camera, Leaf } from "lucide-react"

export function FeaturesSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Core Features
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">
            / Everything you need to understand snacks
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {[
            {
              number: "01",
              title: "Barcode Scanner",
              description: "Instantly scan any snack packaging to retrieve complete nutritional data",
              icon: Barcode,
              direction: "left",
            },
            {
              number: "02",
              title: "Ingredient Analysis",
              description: "AI-powered analysis of ingredients with allergen detection and sourcing info",
              icon: Camera,
              direction: "right",
            },
            {
              number: "03",
              title: "Health Recommendations",
              description: "Personalized snack suggestions based on your dietary goals and preferences",
              icon: Leaf,
              direction: "left",
            },
          ].map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
  isVisible,
}: {
  feature: { number: string; title: string; description: string; icon: any; direction: string }
  index: number
  isVisible: boolean
}) {
  const Icon = feature.icon
  const getRevealClass = () => {
    if (!isVisible) {
      return feature.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
    }
    return "translate-x-0 opacity-100"
  }

  return (
    <div
      className={`group flex items-start justify-between gap-6 border-b border-foreground/10 py-6 transition-all duration-700 hover:border-foreground/20 md:gap-8 md:py-8 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
        marginLeft: index % 2 === 0 ? "0" : "auto",
        maxWidth: index % 2 === 0 ? "85%" : "90%",
      }}
    >
      <div className="flex items-start gap-4 md:gap-8">
        <Icon className="h-6 w-6 flex-shrink-0 text-primary md:h-8 md:w-8" />
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-foreground/30 transition-colors group-hover:text-foreground/50 md:text-base">
              {feature.number}
            </span>
            <h3 className="font-sans text-2xl font-light text-foreground transition-transform duration-300 group-hover:translate-x-2 md:text-3xl lg:text-4xl">
              {feature.title}
            </h3>
          </div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">{feature.description}</p>
        </div>
      </div>
    </div>
  )
}
