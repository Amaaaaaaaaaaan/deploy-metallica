import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './sidenav.module.css';

function Sidenav() {
  const navigate = useNavigate();

  // Define a hook for handling logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('User Logged out');
    setTimeout(() => navigate('/login'), 1000);
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarNav}>
        {/* start logo */}
        <li className={`${styles.firstNavItem} ${styles.logo}`}>
          <a href="#" className={styles.navLink}>
            <svg
              width="800px"
              height="800px"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              className="iconify iconify--twemoji"
              preserveAspectRatio="xMidYMid meet"
            >
              <path fill="#F18F26" d="M0 18h36v9H0z" fontSize={25} />
              <ellipse fill="#F18F26" cx="18" cy="26" rx="18" ry="9" />
              <ellipse fill="#F18F26" cx="18" cy="27" rx="18" ry="9" />
              <path fill="#9D0522" d="M0 10v16h.117c.996 4.499 8.619 8 17.883 8s16.887-3.501 17.883-8H36V10H0z" />
              <ellipse fill="#F18F26" cx="18" cy="11" rx="18" ry="9" />
              <ellipse fill="#F18F26" cx="18" cy="12" rx="18" ry="9" />
              <path fill="#F18F26" d="M0 10h1v2H0zm35 0h1v2h-1z" />
              <ellipse fill="#FCAB40" cx="18" cy="10" rx="18" ry="9" />
              <ellipse fill="#F5F8FA" cx="18" cy="10" rx="17" ry="8" />
              <path fill="#FDD888" d="M18 3c9.03 0 16.395 3.316 16.946 7.5c.022-.166.054-.331.054-.5c0-4.418-7.611-8-17-8S1 5.582 1 10c0 .169.032.334.054.5C1.605 6.316 8.97 3 18 3z" />
              <path d="M28.601 2.599c.44-.33.53-.96.2-1.4l-.6-.8c-.33-.44-.96-.53-1.4-.2L14.157 10.243c-.774-.167-1.785.083-2.673.749-1.326.994-1.863 2.516-1.2 3.4s2.275.794 3.6-.2c.835-.626 1.355-1.461 1.462-2.215l13.255-9.378zm5.868 2.919l-.509-.861a1.003 1.003 0 0 0-1.37-.352l-13.913 8.751c-.719-.141-1.626.023-2.472.524-1.426.843-2.127 2.297-1.565 3.248.562.951 2.174 1.039 3.6.196 1.005-.594 1.638-1.49 1.735-2.301l14.142-7.835c.474-.281.632-.897.352-1.37z" fill="#AA695B" />
              <path fill="#DA2F47" d="M2 28c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1s1 .45 1 1v9c0 .55-.45 1-1 1zm9 4c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1s1 .45 1 1v9c0 .55-.45 1-1 1zm12 0c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1s1 .45 1 1v9c0 .55-.45 1-1 1zm11-4c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1s1 .45 1 1v9c0 .55-.45 1-1 1z" />
            </svg>
          </a>
        </li>

        {/* 1 */}
        <li className={styles.navItem}>
          <a href="/" className={`${styles.navLink} ${styles.centerMarginTop}`}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 576 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z" />
            </svg>
          </a>
        </li>

        {/* 2 */}
        <li className={styles.navItem}>
          <a href="/instrument" className={styles.navLink}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 448 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
            </svg>
          </a>
        </li>

        {/* 3 */}
        <li className={styles.navItem}>
          <a href="/about" className={styles.navLink}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M20 2H4c-1.103 0-2 .894-2 1.992v12.016C2 17.106 2.897 18 4 18h3v4l6.351-4H20c1.103 0 2-.894 2-1.992V3.992A1.998 1.998 0 0 0 20 2z" />
            </svg>
          </a>
        </li>

        {/* 4 - Logout (Using anchor with onClick) */}
        <li className={styles.navItem}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className={styles.navLink}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 640 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M624 448h-80V113.45C544 86.19 522.47 64 496 64H384v64h96v384h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM312.24 1.01l-192 49.74C105.99 54.44 96 67.7 96 82.92V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h336V33.18c0-21.58-19.56-37.41-39.76-32.17zM264 288c-13.25 0-24-14.33-24-32s10.75-32 24-32 24 14.33 24 32-10.75 32-24 32z" />
            </svg>
          </a>
        </li>

        <li className={styles.navItem}>
          <a href="/contact" className={styles.navLink}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z" />
            </svg>
          </a>
        </li>

        <li className={styles.navItem}>
          <a href="/contact" className={styles.navLink}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M12 6a3.939 3.939 0 0 0-3.934 3.934h2C10.066 8.867 10.934 8 12 8s1.934.867 1.934 1.934c0 .598-.481 1.032-1.216 1.626a9.208 9.208 0 0 0-.691.599c-.998.997-1.027 2.056-1.027 2.174V15h2l-.001-.633c.001-.016.033-.386.441-.793.15-.15.339-.3.535-.458.779-.631 1.958-1.584 1.958-3.182A3.937 3.937 0 0 0 12 6zm-1 10h2v2h-2z" />
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
            </svg>
          </a>
        </li>

        {/* Last item (Theme Button) */}
        <li className={`${styles.lastNavItem} ${styles.logo}`} id="themeButton">
          <a href="#" className={styles.navLink}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 640 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              fontSize={25}
            >
              <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z" />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Sidenav;