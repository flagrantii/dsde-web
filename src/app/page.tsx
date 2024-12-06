'use client'

import { Button } from "@/src/components/ui/button"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, Brain, LucideGitGraph, MessageSquare, Sparkles, Library, ChevronDown, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background animate-gradient relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 animate-pulse"
              style={{
                background: `radial-gradient(circle at ${50 + i * 15}% ${50 + i * 10}%, rgba(34, 197, 94, 0.1), transparent 40%)`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section with Enhanced Animation */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          style={{ opacity, scale }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Enhanced Hero Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 200 }}
            className="space-y-4"
          >
            {/* Enhanced Badge */}
            <motion.div 
              className="flex items-center justify-center gap-2 text-primary mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Brain className="w-6 h-6" />
                <motion.div
                  className="absolute -inset-2 bg-primary/20 rounded-full -z-10"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                AI-Powered Research Assistant
              </span>
            </motion.div>
            
            {/* Enhanced Title */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-400 to-primary animate-gradient bg-300% inline-block"
                whileHover={{ scale: 1.02 }}
              >
                The Nodi
              </motion.span>
              <br />
              <span className="text-4xl md:text-5xl text-muted-foreground">
                Through Intelligent Conversations
              </span>
            </h1>
          </motion.div>
          
          {/* Enhanced Description */}
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Explore academic papers through natural conversations. Visualize connections
            and uncover hidden relationships in research with our intelligent graph-based interface.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/chat">
              <Button size="lg" className="bg-primary hover:bg-primary/90 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Exploring
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="group">
              <Star className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-sm">Scroll to explore</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="group p-6 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
              onHoverStart={() => setHoveredFeature(feature.title)}
              onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="p-2 rounded-md bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  animate={hoveredFeature === feature.title ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-32 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg bg-secondary/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <motion.div 
                  className="text-3xl font-bold text-primary mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Testimonials Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl font-bold mb-12">Trusted by Researchers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="p-6 rounded-lg bg-secondary/20 backdrop-blur-sm border border-border/50"
              >
                <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.title}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

const features = [
  {
    title: "AI Chat Interface",
    description: "Interact naturally with our AI to discover and explore research papers that match your interests.",
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    title: "Visual Research Graph",
    description: "See how papers are connected through an interactive visualization of research relationships.",
    icon: <LucideGitGraph className="w-5 h-5" />
  },
  {
    title: "Smart Recommendations",
    description: "Get intelligent paper suggestions based on your research interests and exploration patterns.",
    icon: <Sparkles className="w-5 h-5" />
  }
]

const stats = [
  {
    value: "1M+",
    label: "Research Papers"
  },
  {
    value: "50K+",
    label: "Daily Users"
  },
  {
    value: "100+",
    label: "Subject Areas"
  },
  {
    value: "24/7",
    label: "AI Assistance"
  }
]

const testimonials = [
  {
    quote: "This tool has revolutionized how I discover and connect research papers in my field.",
    name: "Dr. Sarah Chen",
    title: "AI Researcher, Stanford University"
  },
  {
    quote: "The visual graph interface makes understanding paper relationships incredibly intuitive.",
    name: "Prof. Michael Brown",
    title: "Computer Science, MIT"
  },
  {
    quote: "An indispensable tool for staying current with research in my field.",
    name: "Dr. Emily Martinez",
    title: "Research Lead, Google AI"
  }
]
