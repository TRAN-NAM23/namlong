import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SafeTimer from '../../utils/timerUtils';
import imgMienBac from '../../assets/mienBac.png';
import imgMienTrung from '../../assets/mienTrung.png';
import imgMienNam from '../../assets/mienNam.png';
import '../../styles/slider.css';

  // Dữ liệu mẫu
  const slides = [
    {
      id: 1,
      image: imgMienBac, 
      link: "/",
    },
    {
      id: 2,
      image: imgMienTrung, 
      link: "/",
    },
    {
      id: 3,
      image: imgMienNam, 
      link: "/",

    }
  ];

const Slider = () => {

  const [current, setCurrent] = useState(0);
  const length = slides.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Tự động chạy slider
  useEffect(() => {
    let timerId = null;
    try {
      timerId = SafeTimer.setTimeout(() => {
        nextSlide();
      }, 5000);
    } catch (error) {
      console.error('Error setting slider timer:', error);
    }

    // Clear timeout khi component unmount hoặc user bấm chuyển slide thủ công
    return () => {
      SafeTimer.clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]); 

  if (!Array.isArray(slides) || slides.length <= 0) {
    return null;
  }

  return (
    <div className="slider-container">
      <div 
        className="slider-wrapper" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div className="slide" key={slide.id}>
            <img src={slide.image} alt={slide.title} className="slide-image" />
          </div>
        ))}
      </div>

      <button className="arrow-btn left-arrow" onClick={prevSlide}>
        <FaChevronLeft />
      </button>
      <button className="arrow-btn right-arrow" onClick={nextSlide}>
        <FaChevronRight />
      </button>

 
      <div className="dots-container">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Slider;