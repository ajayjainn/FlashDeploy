"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Play, Pause, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Landing() {
  const { scrollY } = useScroll()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // Parallax effect for hero section
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroY = useTransform(scrollY, [0, 300], [0, 100])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const featureCardVariants = {
    offscreen: {
      opacity: 0,
      y: 50,
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <motion.div className="px-6 py-24 text-center relative" style={{ opacity: heroOpacity, y: heroY }}>
        <motion.h1
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-black via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Develop. Preview. Ship.
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Deploy your web projects with Flash Deploy. Experience seamless deployment, instant previews, and simplified
          workflow.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Start Deploying
          </Button>
        </motion.div>
      </motion.div>

      {/* Demo Video Section */}
      <motion.div
        className="max-w-6xl mx-auto px-6 py-16"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch how easy it is to deploy your projects with our platform
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-100 dark:via-gray-200 dark:to-white p-1"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="relative rounded-xl overflow-hidden bg-black group cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[600px] object-cover"
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Controls Bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: showControls || !isPlaying ? 1 : 0,
                y: showControls || !isPlaying ? 0 : 20,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay()
                    }}
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-white text-sm font-medium">{isPlaying ? "Playing" : "Paused"}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Center Play Button (only when paused) */}
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 shadow-2xl"
                  whileHover={{ scale: 1.1, bg: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    scale: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <Play className="h-8 w-8 text-white ml-0.5" />
                </motion.div>
              </motion.div>
            )}

            {/* Loading indicator */}
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPlaying ? 0 : 0 }}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs">Demo Video</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Grid with Scroll Animations */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🚀",
              title: "Instant Deployments",
              description: "Push your code and watch it go live instantly with automatic deployments.",
            },
            {
              icon: "🌐",
              title: "Global Edge Network",
              description: "Your applications are served from the closest edge location for optimal performance.",
            },
            {
              icon: "👥",
              title: "Team Collaboration",
              description: "Work together seamlessly with built-in collaboration tools and preview deployments.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors bg-gray-50 dark:bg-gray-900"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={featureCardVariants}
              custom={index}
            >
              <motion.div
                className="text-2xl mb-4"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Start Building Section with Reveal on Scroll */}
      <motion.div
        className="px-6 py-24 text-center bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-4xl font-bold mb-6"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to Start Building?
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join developers who deploy their projects with Flash Deploy.
        </motion.p>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Deploy Your First Project
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
