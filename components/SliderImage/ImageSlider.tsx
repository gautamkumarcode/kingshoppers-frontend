"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  interval?: number; // Auto slide delay (ms)
}

export default function ImageSlider({ images, interval = 4000 }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Auto slide logic
  useEffect(() => {
    if (isHovered) return; // pause when hovered
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isHovered]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className=" mt-25 relative w-8xl max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-lg mt-10 h-[350px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✅ Slides Wrapper */}
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index}`}
            className="w-full h-[220px] sm:h-[350px] md:h-[480px] lg:h-[550px] object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* ✅ Left Button */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full shadow-lg transition duration-300"
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>

      {/* ✅ Right Button */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full shadow-lg transition duration-300"
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      {/* ✅ Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "bg-white scale-110 shadow-md"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
