import React, { useState, useRef, useEffect } from 'react';
import styles from './Aboutus.module.css';
import Sidenav from '../components/sidenav';
import { motion } from 'framer-motion';
// React Icons
import {
  FaLink,
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const AboutUsPage = () => {
  // Create a ref for the scrollable container
  const wrapperRef = useRef(null);
  // Track scroll progress on the wrapper
  const [scrollYProgress, setScrollYProgress] = useState(0);

  // FAQ Data
  const faqData = [
    {
      question: "What is METALLICA?",
      answer:
        "Metallica is a pioneering platform revolutionizing AUDIO generation and performance. Our platform offers a wide range of instruments in one place, allowing users to seamlessly switch between them without the need for multiple apps. It incorporates advanced 2D, 3D, and motion interfaces, offering users an immersive and interactive musical experience. Additionally, the app includes AI generative music features, enabling users, even those unfamiliar with musical tones, to create their own music effortlessly."
    },
    {
      question: "Can I Save and Share My Creations Using METALLICA?",
      answer:
        "Absolutely! You can easily save, download, or share your custom creations on social platforms."
    },
    {
      question: "How Does METALLICA Work?",
      answer:
        "METALLICA is a web app that allows users to create and play custom music using a variety of instruments. The app provides a wide range of instruments in one place, allowing users to seamlessly switch between them without the need for multiple apps. It incorporates advanced 2D, 3D, and motion interfaces, offering users an immersive and interactive musical experience."
    },
    {
      question: "What Features Does METALLICA Offer?",
      answer:
        "METALLICA offers a wide range of features, including AI generative music, custom instrument creation, and seamless integration with other apps. The app also includes a built-in recording system, allowing users to play instruments and sing simultaneously, recording their performances for future use. Additionally, METALLICA ensures cross-platform compatibility, making it accessible to everyone, regardless of device."
    },
    {
      question: "How Does Metallica Ensure Security and Privacy for User Data?",
      answer:
        "We employ robust encryption protocols and follow strict privacy policies to protect your data."
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = wrapperRef.current.scrollTop;
      const scrollHeight = wrapperRef.current.scrollHeight - wrapperRef.current.clientHeight;
      const progress = scrollTop / scrollHeight;
      setScrollYProgress(progress);
    };

    const wrapper = wrapperRef.current;
    wrapper.addEventListener('scroll', handleScroll);

    return () => {
      wrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Feedback Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
  
    // Create a new feedback object
    const initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    const fullName = `${firstName} ${lastName}`;
    const newFeedback = { initials, name: fullName, review: feedback };
  
    // Get existing feedbacks from localStorage (or empty array) and add the new feedback
    const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    storedFeedbacks.push(newFeedback);
    localStorage.setItem('feedbacks', JSON.stringify(storedFeedbacks));
  
    // Prepare email content using the user's details
    const subject = encodeURIComponent(`Feedback from ${firstName} ${lastName}`);
    const body = encodeURIComponent(`Email: ${email}\n\nFeedback:\n${feedback}`);
    // Open the user's default mail client in a new tab/window
    window.open(`mailto:metallica@gmail.com?subject=${subject}&body=${body}`, '_blank');
  
    console.log({ firstName, lastName, email, feedback });
    setSubmitted(true);
  };
  
  

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setFeedback('');
    setSubmitted(false);
  };

  return (
    <>
      <div className={styles.body}>
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
            backgroundColor: "var(--hue-1,#285584f2)",
            zIndex: 1000,
          }}
        />
        <Sidenav />
        <div ref={wrapperRef} className={styles.wrapper} style={{ overflowY: 'scroll', height: '100vh' }}>
          <div className={styles.aboutUsContainer}>
            {/* ABOUT US DESCRIPTION SECTION */}
            <section className={styles.aboutSection}>
              <h1 className={styles.aboutHeading}>
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 320 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  fontSize={45}
                  color="#285584f2"
                >
                  <path d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V256.9L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6h29.7c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H152z"></path>
                </svg>
                About Us
              </h1>
              <p className={styles.aboutDescription}>
                This web app project aims to revolutionize the way users interact with musical instruments by integrating multiple features into a single, accessible platform.
                The app provides a wide range of instruments in one place, allowing users to seamlessly switch between them without the need for multiple apps.
                It incorporates advanced 2D, 3D, and motion interfaces, offering users an immersive and interactive musical experience.
                Additionally, the app includes AI generative music features, enabling users, even those unfamiliar with musical tones, to create their own music effortlessly.
                A built-in recording system allows users to play instruments and sing simultaneously, recording their performances for future use.
                Being a web app, it ensures cross-platform compatibility, making it accessible to everyone, regardless of device.
              </p>
            </section>

            {/* GET IN TOUCH SECTION */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <FaLink className={styles.sectionIcon} />
                <h2>Get in Touch</h2>
              </div>
              <p className={styles.sectionSubtitle}>
                Have a question or want to collaborate? Reach out to us through any of the channels below.
              </p>
              <div className={styles.contactCards}>
                <a href="mailto:metallica@gmail.com" aria-label="Email" className={styles.contactCard}>
                  <FaEnvelope className={styles.contactIcon} />
                  <h3>Email</h3>
                  <p>metallica@gmail.com</p>
                </a>
                <a href="tel:+911234567890" aria-label="Phone" className={styles.contactCard}>
                  <FaPhone className={styles.contactIcon} />
                  <h3>Phone</h3>
                  <p>+91-123-4567890</p>
                </a>
                <a href="https://twitter.com/Metallica" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={styles.contactCard}>
                  <FaTwitter className={styles.contactIcon} />
                  <h3>Twitter</h3>
                  <p>@Metallica</p>
                </a>
                <a href="https://www.linkedin.com/company/metallica" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.contactCard}>
                  <FaLinkedin className={styles.contactIcon} />
                  <h3>LinkedIn</h3>
                  <p>Metallica Pvt. Ltd</p>
                </a>
                <a href="https://instagram.com/Metallica" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.contactCard}>
                  <FaInstagram className={styles.contactIcon} />
                  <h3>Instagram</h3>
                  <p>@Metallica</p>
                </a>
                <a href="https://github.com/metallica" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={styles.contactCard}>
                  <FaGithub className={styles.contactIcon} />
                  <h3>GitHub</h3>
                  <p>Metallica</p>
                </a>
              </div>
            </section>

            {/* FAQ SECTION (with animation) */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <FaQuestionCircle className={styles.sectionIcon} />
                <h2>FAQ</h2>
              </div>
              <div className={styles.faqItems}>
                {faqData.map((item, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={index}
                      className={styles.faqItem}
                      onClick={() => toggleFAQ(index)}
                    >
                      <div className={styles.faqQuestion}>
                        <span>{item.question}</span>
                        {isOpen ? (
                          <FaChevronUp className={styles.faqChevron} />
                        ) : (
                          <FaChevronDown className={styles.faqChevron} />
                        )}
                      </div>
                      <div
                        className={`${styles.faqAnswer} ${isOpen ? styles.active : ''}`}
                      >
                        {item.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FEEDBACK SECTION */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2>Share Feedback</h2>
              </div>
              {submitted ? (
                <div className={styles.thankYouMessage}>
                  <h3>Thank you for your feedback!</h3>
                  <p>
                    We appreciate you taking the time to share your thoughts with us.
                  </p>
                </div>
              ) : (
                <form
                  className={styles.feedbackForm}
                  onSubmit={handleFeedbackSubmit}
                >
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">First Name:</label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Last Name:</label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email:</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="feedback">Feedback:</label>
                      <textarea
                        id="feedback"
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formButtons}>
                    <button type="submit" className={styles.submitBtn}>
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
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
                  href="tel:+91 9876543210"
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
    </>
  );
};

export default AboutUsPage;
