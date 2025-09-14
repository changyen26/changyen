'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 檢查是否為觸控設備
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      return; // 在觸控設備上不顯示自定義游標
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // 檢測可互動元素的 hover
    const handleHoverableEnter = () => setIsHovering(true);
    const handleHoverableLeave = () => setIsHovering(false);

    // 添加滑鼠事件監聽器
    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 為可互動元素添加事件監聽器
    const hoverableElements = document.querySelectorAll(
      'a, button, [role="button"], .cursor-pointer, input, textarea, select'
    );

    hoverableElements.forEach(element => {
      element.addEventListener('mouseenter', handleHoverableEnter);
      element.addEventListener('mouseleave', handleHoverableLeave);
    });

    // 隱藏預設游標
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);

      hoverableElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHoverableEnter);
        element.removeEventListener('mouseleave', handleHoverableLeave);
      });

      // 恢復預設游標
      document.body.style.cursor = 'auto';
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null; // 在觸控設備上不渲染
  }

  return (
    <>
      {/* 主游標點 */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>

      {/* 外圈游標 */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        animate={{
          scale: isVisible ? (isHovering ? 2 : 1) : 0,
          opacity: isVisible ? (isHovering ? 0.6 : 0.3) : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          mass: 0.8
        }}
      >
        <div className="w-8 h-8 border border-white rounded-full" />
      </motion.div>

      {/* Hover 狀態的額外效果 */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997] mix-blend-difference"
          style={{
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 0.2,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          <div className="w-12 h-12 border border-white rounded-full animate-pulse" />
        </motion.div>
      )}
    </>
  );
}