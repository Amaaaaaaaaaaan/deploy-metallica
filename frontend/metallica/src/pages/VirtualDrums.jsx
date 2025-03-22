import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Howl } from 'howler';
import style from '../styles/Handdrum.module.css';

// Import images for each drum zone
import bassDrumImg from '../assets/virtualdrum/Bass_drum.png';
import leftHatImg from '../assets/virtualdrum/left_hat.png';
import leftDrumImg from '../assets/virtualdrum/left_drum.png';
import rightDrumImg from '../assets/virtualdrum/right_drum.png';
import hatBassImg from '../assets/virtualdrum/hat_bass.png';
import leftBottomImg from '../assets/virtualdrum/left_bottom.png';
import rightBottomImg from '../assets/virtualdrum/right_bottom.png';
import rightCymbalImg from '../assets/virtualdrum/right_cymbal.png';

// Use your provided audio paths and static drum names.
const PRESET_MAPPINGS = {
  Default: {
    BassDrum: '/audios/bass_drum.mp3',
    LeftHat: '/audios/bottom_left_hat.mp3',
    LeftDrum: '/audios/center_left_Drum.mp3',
    RightDrum: '/audios/center_right_drum.mp3',
    HatBass: '/audios/hat+bass.mp3',
    LeftBottom: '/audios/left_bottom.mp3',
    RightBottom: '/audios/right_bottom_Drum.mp3',
    RightCymbal: '/audios/right_Cymbal.mp3'
  }
};

// Define drum zones with an additional "image" property.
// Positions are defined in relative percentages.
const drumZones = [
  {
    name: 'LeftHat',
    x: 0.05,  // top-left
    y: 0.05,
    width: 0.2,
    height: 0.2,
    sound: PRESET_MAPPINGS.Default.LeftHat,
    image: leftHatImg
  },
  {
    name: 'HatBass',
    x: 0.40,  // top-center
    y: 0.05,
    width: 0.2,
    height: 0.2,
    sound: PRESET_MAPPINGS.Default.HatBass,
    image: hatBassImg
  },
  {
    name: 'RightCymbal',
    x: 0.75,  // top-right
    y: 0.05,
    width: 0.2,
    height: 0.2,
    sound: PRESET_MAPPINGS.Default.RightCymbal,
    image: rightCymbalImg
  },
  {
    name: 'LeftDrum',
    x: 0.04,  // middle-left
    y: 0.33,
    width: 0.2,
    height: 0.3,
    sound: PRESET_MAPPINGS.Default.LeftDrum,
    image: leftDrumImg
  },
  {
    name: 'RightDrum',
    x: 0.75,  // middle-right
    y: 0.30,
    width: 0.2,
    height: 0.3,
    sound: PRESET_MAPPINGS.Default.RightDrum,
    image: rightDrumImg
  },
  {
    name: 'LeftBottom',
    x: 0.05,  // bottom-left
    y: 0.60,
    width: 0.2,
    height: 0.4,
    sound: PRESET_MAPPINGS.Default.LeftBottom,
    image: leftBottomImg
  },
  {
    name: 'BassDrum',
    x: 0.40,  // bottom-center
    y: 0.55,
    width: 0.2,
    height: 0.4,
    sound: PRESET_MAPPINGS.Default.BassDrum,
    image: bassDrumImg
  },
  {
    name: 'RightBottom',
    x: 0.75,  // bottom-right
    y: 0.60,
    width: 0.2,
    height: 0.4,
    sound: PRESET_MAPPINGS.Default.RightBottom,
    image: rightBottomImg
  }
];

// Debounce storage to avoid retriggering the same sound too frequently.
const lastPlayTime = {};

const HandDrum = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  // Cache for preloaded images.
  const imagesCacheRef = useRef({});

  // Toggle state to show or hide hand tracking debug markers.
  const [showHandTracking, setShowHandTracking] = useState(false);

  // Preload images on mount.
  useEffect(() => {
    drumZones.forEach(zone => {
      const img = new Image();
      img.src = zone.image;
      imagesCacheRef.current[zone.name] = img;
    });
  }, []);

  // Update canvas size on window resize.
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to play drum sound (debounced).
  const playDrumSound = (zone) => {
    const now = Date.now();
    if (lastPlayTime[zone.name] && now - lastPlayTime[zone.name] < 300) return;
    lastPlayTime[zone.name] = now;
    const sound = new Howl({
      src: [zone.sound],
      volume: 1.0
    });
    sound.play();
  };

  // MediaPipe Hands results callback.
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror the video feed.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw each drum image at its designated zone.
    drumZones.forEach(zone => {
      const x = canvas.width - (zone.x * canvas.width) - (zone.width * canvas.width);
      const y = zone.y * canvas.height;
      const w = zone.width * canvas.width;
      const h = zone.height * canvas.height;
      const zoneImg = imagesCacheRef.current[zone.name];
      if (zoneImg && zoneImg.complete) {
        ctx.drawImage(zoneImg, x, y, w, h);
      }
    });

    // Process detected hand landmarks.
    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks) => {
        // Draw the index finger tip for collision detection.
        const indexTip = landmarks[8];
        if (indexTip) {
          const x = canvas.width - (indexTip.x * canvas.width);
          const y = indexTip.y * canvas.height;
          // If hand tracking toggle is enabled, draw a blue circle at the index tip.
          if (showHandTracking) {
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
          }
          // Check collision with each drum zone.
          drumZones.forEach(zone => {
            const zoneX = canvas.width - (zone.x * canvas.width) - (zone.width * canvas.width);
            const zoneY = zone.y * canvas.height;
            const zoneW = zone.width * canvas.width;
            const zoneH = zone.height * canvas.height;
            if (x >= zoneX && x <= zoneX + zoneW && y >= zoneY && y <= zoneY + zoneH) {
              playDrumSound(zone);
            }
          });
        }
        // If toggle is enabled, optionally draw all hand landmarks.
        if (showHandTracking) {
          landmarks.forEach(pt => {
            const x = canvas.width - (pt.x * canvas.width);
            const y = pt.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          });
        }
      });
    }
  };

  // Set up Mediapipe Hands and camera.
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: canvasSize.width,
      height: canvasSize.height,
    });
    camera.start();
    return () => {
      camera.stop();
    };
  }, [canvasSize, showHandTracking]);

  // Resume AudioContext on user gesture.
  const handleUserGesture = () => {
    if (window.AudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    }
  };

  return (
    <div className={style["hand-drum-container"]} onClick={handleUserGesture}>
      {/* Toggle button for showing/hiding hand tracking markers */}
      <button
        className={style.handTrackingToggle}
        onClick={(e) => {
          e.stopPropagation();
          setShowHandTracking(prev => !prev);
        }}
      >
        {showHandTracking ? 'Hide Hand Tracking' : 'Show Hand Tracking'}
      </button>
      {/* Hidden video feed for Mediapipe */}
      <video
        ref={videoRef}
        className={style["hand-drum-video"]}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      {/* Main canvas for drawing camera feed and drum images */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={style["hand-drum-canvas"]}
      />
      <div className={style["drum-instructions"]}>
        <p>Wave your hand over the drum images to play the drums!</p>
      </div>
    </div>
  );
};

export default HandDrum;
