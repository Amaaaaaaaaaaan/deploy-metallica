import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';

const Carousel = () => {
  const navigate = useNavigate(); 
  const trackRef = useRef(null);
  const [mouseDownAt, setMouseDownAt] = useState(0);
  const [prevPercentage, setPrevPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOnDown = (e) => {
    setMouseDownAt(e.clientX);
    setIsDragging(false);
  };

  const handleOnUp = () => {
    setMouseDownAt(0);
    setPrevPercentage(trackRef.current.dataset.percentage);
    // Delay resetting isDragging so we don't mistakenly navigate on quick drags
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleOnMove = (e) => {
    if (mouseDownAt === 0) return;
    const mouseDelta = mouseDownAt - e.clientX;

    // If user moves more than 5px, consider it a drag (not a click)
    if (Math.abs(mouseDelta) > 5) {
      setIsDragging(true);
    }

    const maxDelta = window.innerWidth / 2;
    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    trackRef.current.dataset.percentage = nextPercentage;

    trackRef.current.animate(
      { transform: `translate(${nextPercentage}%, -50%)` },
      { duration: 1200, fill: 'forwards' }
    );

    for (const image of trackRef.current.getElementsByClassName('image')) {
      image.animate(
        { objectPosition: `${100 + nextPercentage}% center` },
        { duration: 1200, fill: 'forwards' }
      );
    }
  };

  // Only navigate if we didn't drag
  const handleClick = (route) => {
    if (!isDragging) {
      navigate(route);
    }
  };

  return (
<div className='body'>    <div
     
      id="image-track"
      ref={trackRef}
      data-mouse-down-at="0"
      data-prev-percentage="0"
      onMouseDown={handleOnDown}
      onMouseUp={handleOnUp}
      onMouseMove={handleOnMove}
      onTouchStart={(e) => handleOnDown(e.touches[0])}
      onTouchEnd={(e) => handleOnUp(e.touches[0])}
      onTouchMove={(e) => handleOnMove(e.touches[0])}
    >
      <img
        className="image"
        src="/drumbg2.png"
        draggable="false"
        alt="Drums"
        onClick={() => handleClick('/drums')}
      />
      <img
        className="image"
        src="/piano.jpeg"
        draggable="false"
        alt="Piano"
        onClick={() => handleClick('/piano')}
      />
      <img
        className="image"
        src="/sequencer.jpg"
        draggable="false"
        alt="Sequencer"
        onClick={() => handleClick('/beatsequencer')}
      />
      <img
        className="image"
        src="https://dl-asset.cyberlink.com/web/prog/learning-center/html/31482/PDR19-YouTube-909_PDR_AI%20Music%20Generators_PC/img/hdr-img-ai-music-gen-jpg.jpg "
        draggable="false"
        alt="Test"
        onClick={() => handleClick('/test')}
      />
      <img
        className="image"
        src="https://images-cdn.ubuy.co.in/66b867f7425e1954791e2685-virtual-air-drum-set-electric-drumsticks.jpg  "
        draggable="false"
        alt="Virtual Drums"
        onClick={() => handleClick('/virtualdrums')}
      />
      <img
        className="image"
        src="/savedmusic.png"
        draggable="false"
        alt="Test"
        onClick={() => handleClick('/saved')}
      />
    </div>
    </div>



  );
};

export default Carousel;
