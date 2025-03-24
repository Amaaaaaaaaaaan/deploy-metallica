import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { 
  FaDrum, 
  FaMousePointer, 
  FaTshirt, 
  FaPalette, 
  FaRulerCombined, 
  FaRobot, 
  FaEnvelope,
  FaPhone,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaCheckCircle
} from 'react-icons/fa';
import Slider from "react-slick";
import styles from '../styles/home.module.css'
import Sidenav from '../components/sidenav';

// Import slick-carousel CSS
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  // Static reviews array
  const reviews = [
    {
      initials: 'JD',
      name: 'Jon Doe',
      review: 'Your music project brings creativity and innovation to every track!'
    },
    {
      initials: 'MS',
      name: 'Mark Smith',
      review: 'The sound mixing and design elements of this project are top-notch.'
    },
    {
      initials: 'JA',
      name: 'Jane Doe',
      review: 'Every beat feels uniquely crafted, making the experience unforgettable.'
    },
    {
      initials: 'AC',
      name: 'Alice Cooper',
      review: 'Absolutely loved the fusion of classic and modern sound techniques!'
    },
    {
      initials: 'BR',
      name: 'Bob Ross',
      review: 'This project inspires creativity and brings music to life with every note.'
    },
    {
      initials: 'EC',
      name: 'Eve Carter',
      review: 'A truly innovative approach to music creation and customization.'
    },
  ];
  
  // State to hold dynamic feedback from localStorage
  const [dynamicFeedbacks, setDynamicFeedbacks] = useState([]);

  // Load feedbacks from localStorage when component mounts
  useEffect(() => {
    const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    setDynamicFeedbacks(storedFeedbacks);
  }, []);

  // Combine static reviews with dynamic feedbacks
  const allReviews = [...reviews, ...dynamicFeedbacks];

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,    // Change this to show more slides per view if desired
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // For top scrollbar, add a ref to the scrollable container and track its scroll progress
  const wrapperRef = useRef(null);
  const [scrollYProgress, setScrollYProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        const scrollTop = wrapperRef.current.scrollTop;
        const scrollHeight = wrapperRef.current.scrollHeight - wrapperRef.current.clientHeight;
        const progress = scrollTop / scrollHeight;
        setScrollYProgress(progress);
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (wrapper) wrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.body}>
      <Sidenav />
      <div className={styles.container} ref={wrapperRef} style={{ overflowY: 'scroll', height: '100vh' }}>
        {/* Top Scrollbar */}
        <motion.div
          id="scroll-indicator"
          style={{
            scaleX: scrollYProgress,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            transformOrigin: "0%",
            backgroundColor: "var(--hue-1, #285584f2)",
            zIndex: 1000,
          }}
        />

        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.header}>
               <img
  src="/metallica-svg-white.svg"
  style={{ width: "339px", marginLeft: "70px", height: "118px" }}
  alt="Metallica Logo"
/>
            </h1>
            <p style={{ fontWeight: "bold" }}>
  Revolutionizing the way you experience technology.
</p>

          </div>
        </header>

        {/* HOW IT WORKS SECTION (Features) */}
        <section id="features" className={styles.features}>
          <div className={styles.featuresHeader}>
            <div className={styles.featuresIconContainer}>
              <svg
                className={styles.featuresIcon}
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 576 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"></path>
              </svg>
              <h2>How It Works</h2>
            </div>
            <p className={styles.featuresSubtitle}>
              <h4>
                Metallica: A virtual instrument hub where you can play, record, 
                and save custom audio—unlocking endless musical possibilities.
              </h4>
            </p>
          </div>
          <div className={styles.featureCards}>
  <div className={styles.featureCard}>
    <FaDrum className={styles.featureCardIcon} />
    <h3>Select Your Drum Kit</h3>
    <p>Choose from a variety of drum presets to kick off your beat.</p>
  </div>
  <div className={styles.featureCard}>
    <FaPalette className={styles.featureCardIcon} />
    <h3>Customize Your Stage</h3>
    <p>Pick your colors and backgrounds for a personalized performance.</p>
  </div>
  <div className={styles.featureCard}>
    <FaRulerCombined className={styles.featureCardIcon} />
    <h3>Adjust Your Volume</h3>
    <p>Control sound levels for the perfect mix.</p>
  </div>
  <div className={styles.featureCard}>
    <FaRobot className={styles.featureCardIcon} />
    <h3>Hand Tracking Magic</h3>
    <p>Experience AI-driven hand tracking for dynamic drumming.</p>
  </div>
  <div className={styles.featureCard}>
    <FaMousePointer className={styles.featureCardIcon} />
    <h3>Interactive Interface</h3>
    <p>Enjoy an intuitive, touch-friendly control panel.</p>
  </div>
  <div className={styles.featureCard}>
    <FaCheckCircle className={styles.featureCardIcon} />
    <h3>Record & Review</h3>
    <p>Capture your performance and perfect your mix before sharing.</p>
  </div>
</div>

  </section>

        {/* About Section */}
        <section id="about" className={styles.about}>
          <h2>About Our Project</h2>
          <p>
            Our project aims to merge art and technology in ways never seen before.
            We leverage modern design principles and the latest technology to provide
            a unique, immersive user experience. From interactive interfaces to seamless
            integration across devices, our platform offers everything you need to innovate.
          </p>
        </section>

        {/* Contact Section */}
        <section id="contact" className={styles.contact}>
          <h2>Contact Us</h2>
          <p>Have questions or want to collaborate? Reach out now!</p>
          <button className={styles.ctaButton}>Contact</button>
        </section>

        {/* Reviews Section with Slider */}
        <section className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <div className={styles.iconContainer}>
              <svg
                className={styles.icon}
                fill="currentColor"
                viewBox="0 0 24 24"
                height="2.5rem"
                width="2.5rem"
              >
                <path d="M12 2C6.477 2 2 6.365 2 11.792 2 15.65 4.663 18.852 8.151 19.821L7.36 22.716c-.06.23.052.473.25.604a.543.543 0 0 0 .643-.03L12 20.069l3.748 3.221c.19.163.464.167.663.01a.44.44 0 0 0 .249-.584l-.78-2.527C19.43 18.818 22 15.61 22 11.792 22 6.365 17.523 2 12 2z"></path>
              </svg>
            </div>
            <h2>Customer Reviews</h2>
            <p>
              Hear from our satisfied customers who have created their unique outfits
              with our 3D customizer.
            </p>
          </div>
          <Slider {...sliderSettings} className={styles.reviewCards}>
            {allReviews.map((item, index) => (
              <div key={index} className={styles.reviewCard}>
                <div className={styles.avatar}>
                  <span>{item.initials}</span>
                </div>
                <h3>{item.name}</h3>
                <p className={styles.reviewText}>{item.review}</p>
              </div>
            ))}
          </Slider>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <p>© 2025 METALLICA. All rights reserved.</p>
            <div className={styles.footerIcons}>
              <a
                href="mailto:metallica@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>
              <a
                href="tel: +91 9876543210"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Phone"
              >
                <FaPhone />
              </a>
              <a
                href="https://www.linkedin.com/company/metallica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://github.com/metallica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://twitter.com/metallica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;