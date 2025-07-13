import { useRef, useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import "./style.css"
import { useInView } from "react-intersection-observer"

const CHARS = "okjbfdsmERTYUSakscbja"

const ScrambleText = ({ children, delay, shuffle = false }) => {
  // Add safety check for children prop
  const safeChildren = children || ""
  
  const intervalRef = useRef(null)
  const controls = useAnimation()
  const [ref, inView] = useInView()
  const CYCLES_PER_LETTER = shuffle ? 2 : 1
  const SHUFFLE_TIME = shuffle ? 50 : 0
  const [text, setText] = useState(safeChildren)
  const [hasScrambled, setHasScrambled] = useState(false)

  const handleComplete = () => {
    stopScramble()
  }

  const scramble = () => {
    let pos = 0

    intervalRef.current = setInterval(() => {
      const scrambled = safeChildren
        .split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index || CHARS.includes(char) || char === " " || char === "." || char === "," || char === `'` || char === "!") {
            return char
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length)
          const randomChar = CHARS[randomCharIndex]

          return randomChar
        })
        .join("")

      setText(scrambled)
      pos = shuffle ? pos + 1 : pos + 4

      if (pos >= safeChildren.length * CYCLES_PER_LETTER) {
        stopScramble()
      }
    }, SHUFFLE_TIME)
  }

  const stopScramble = () => {
    clearInterval(intervalRef.current)
    setText(safeChildren)
    setHasScrambled(true)
  }

  useEffect(() => {
    // Trigger the scramble function after the specified delay
    const delayTimeout = setTimeout(() => {
      if (inView && !hasScrambled) {
        scramble()
      }
    }, delay * 1000)

    // Cleanup function to stop the interval and clear the delay timeout when the component is unmounted
    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(delayTimeout)
    }
  }, [delay, inView])

  useEffect(() => {
    // Start animation when the component is in view
    if (inView && !hasScrambled) {
      controls.start("visible")
    }
  }, [inView, controls])

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
        delayChildren: delay,
        staggerChildren: 0.006,
      },
    },
  }

  const charVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
      },
    },
  }

  // Don't render anything if there's no content
  if (!safeChildren) {
    return null
  }

  return (
    <motion.span className="scrambleText">
      <span>{safeChildren}</span>
      <motion.span initial="hidden" animate={controls} variants={textVariants} ref={ref} className="scrambleText--overlay" onAnimationComplete={() => handleComplete()}>
        {text.split("").map((char, index) => (
          <motion.span key={index} variants={charVariants}>
            {char}
          </motion.span>
        ))}
      </motion.span>
    </motion.span>
  )
}

export default ScrambleText
