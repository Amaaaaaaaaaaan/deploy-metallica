import React, { useEffect, useState, useRef } from 'react';
import './Drumkit.module.css';
import 'font-awesome/css/font-awesome.min.css';
import { gsap } from 'gsap';
import KeyMapping from "./KeyMapping";

// Import images from your assets folder:
import crashImg from '../assets/drumkit/crash.png';
import hiHatImg from '../assets/drumkit/hi-hat.png';
import snareImg from '../assets/drumkit/snare.png';
import rightTomImg from '../assets/drumkit/right-tom.png';
import leftTomImg from '../assets/drumkit/left-tom.png';
import floorTomImg from '../assets/drumkit/floor-tom.png';
import kickImg from '../assets/drumkit/kick.png';

const SVGDrumKit = () => {
  // Sequencer / BPM state
  const [sequencerVisible, setSequencerVisible] = useState(false);
  const [sequencerOn, setSequencerOn] = useState(false);
  const [bpm, setBpm] = useState(150);
  const [beat, setBeat] = useState(1);
  const beatRef = useRef(1);

  // Drum audio and element refs
  const crashCymbolRef = useRef(null);
  const crashAudioRef = useRef(null);
  const rightTomDrumRef = useRef(null);
  const smallTomAudioRef = useRef(null);
  const leftTomDrumRef = useRef(null);
  const bigTomAudioRef = useRef(null);
  const floorTomDrumRef = useRef(null);
  const floorTomAudioRef = useRef(null);
  const snareDrumRef = useRef(null);
  const snareAudioRef = useRef(null);
  const kickDrumRef = useRef(null);
  const kickAudioRef = useRef(null);
  const hiHatRef = useRef(null);
  const hiHatClosedAudioRef = useRef(null);

  // Key mapping state
  const PRESET_MAPPINGS = {
    Default: {
      w: "/audios/bass_drum.mp3",
      a: "/audios/bottom_left_hat.mp3",
      s: "/audios/center_left_Drum.mp3",
      d: "/audios/center_right_drum.mp3",
      q: "/audios/hat+bass.mp3",
      e: "/audios/left_bottom.mp3",
      r: "/audios/right_bottom_Drum.mp3",
      t: "/audios/right_Cymbal.mp3",
    }
  };

  const drumImages = {
    crash: crashImg,
    hiHat: hiHatImg,
    snare: snareImg,
    rightTom: rightTomImg,
    leftTom: leftTomImg,
    floorTom: floorTomImg,
    kick: kickImg,
  };

  // Helper to attach the proper ref for GSAP animations.
  const getDrumRef = (drum) => {
    switch (drum) {
      case 'crash':
        return crashCymbolRef;
      case 'hiHat':
        return hiHatRef;
      case 'snare':
        return snareDrumRef;
      case 'rightTom':
        return rightTomDrumRef;
      case 'leftTom':
        return leftTomDrumRef;
      case 'floorTom':
        return floorTomDrumRef;
      case 'kick':
        return kickDrumRef;
      default:
        return null;
    }
  };

  const [keyMapping, setKeyMapping] = useState("Default");
  const [keyMappings, setKeyMappings] = useState(PRESET_MAPPINGS["Default"]);
  const [isKeyMappingOpen, setIsKeyMappingOpen] = useState(false);

  // Other states
  const [volume, setVolume] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [bgImage, setBgImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);
  const audioContextRef = useRef(null);
  const destRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Sequencer grid state: 7 rows × 8 steps
  const initialSequencerState = {
    crash: Array(8).fill(false),
    hiHat: Array(8).fill(false),
    snare: Array(8).fill(false),
    rightTom: Array(8).fill(false),
    leftTom: Array(8).fill(false),
    floorTom: Array(8).fill(false),
    kick: Array(8).fill(false),
  };
  const [seqState, setSeqState] = useState(initialSequencerState);
  const seqStateRef = useRef(seqState);
  useEffect(() => {
    seqStateRef.current = seqState;
  }, [seqState]);

  // Setup AudioContext and MediaRecorder
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    destRef.current = audioContextRef.current.createMediaStreamDestination();
    try {
      mediaRecorderRef.current = new MediaRecorder(destRef.current.stream);
    } catch (err) {
      console.error("MediaRecorder error:", err);
    }
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setRecordings((prev) => [...prev, { url, blob }]);
      recordedChunksRef.current = [];
    };
  }, []);

  // Live drumming via keyboard
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (keyMappings[key]) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        activeKeys.current.add(key);
        const audio = new Audio(keyMappings[key]);
        audio.volume = volume;
        const sourceNode = audioContextRef.current.createMediaElementSource(audio);
        sourceNode.connect(audioContextRef.current.destination);
        sourceNode.connect(destRef.current);
        audio.play();
        clearTimeout(inactivityTimer.current);
      }
    };
    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      activeKeys.current.delete(key);
      if (activeKeys.current.size === 0) {
        inactivityTimer.current = setTimeout(() => {
          // Optionally stop animations
        }, 1000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyMappings, volume]);

  // Setup GSAP animations for drum parts
  useEffect(() => {
    // Crash Cymbal Animation
    const crashtl = gsap.timeline({ paused: true });
    crashtl.to(crashCymbolRef.current, {
      duration: 0.1,
      rotation: 8,
      transformOrigin: "50% 50%"
    }).to(crashCymbolRef.current, {
      duration: 1.5,
      rotation: 0,
      transformOrigin: "50% 50%",
      ease: "elastic.out(2.5, 0.3)"
    });

    // Right Tom Animation
    const rightTomtl = gsap.timeline({ paused: true });
    rightTomtl.to(rightTomDrumRef.current, {
      duration: 0.1,
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }).to(rightTomDrumRef.current, {
      duration: 0.1,
      scaleY: 0.95,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }, 0).to(rightTomDrumRef.current, {
      duration: 0.4,
      scale: 1,
      transformOrigin: "50% 50%",
      ease: "elastic.out"
    });

    // Left Tom Animation
    const leftTomtl = gsap.timeline({ paused: true });
    leftTomtl.to(leftTomDrumRef.current, {
      duration: 0.1,
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }).to(leftTomDrumRef.current, {
      duration: 0.1,
      scaleY: 0.95,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }, 0).to(leftTomDrumRef.current, {
      duration: 0.4,
      scale: 1,
      transformOrigin: "50% 50%",
      ease: "elastic.out"
    });

    // Floor Tom Animation
    const floorTomtl = gsap.timeline({ paused: true });
    floorTomtl.to(floorTomDrumRef.current, {
      duration: 0.1,
      scaleX: 1.02,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }).to(floorTomDrumRef.current, {
      duration: 0.1,
      scaleY: 0.95,
      transformOrigin: "50% 100%",
      ease: "expo.out"
    }, 0).to(floorTomDrumRef.current, {
      duration: 0.4,
      scale: 1,
      transformOrigin: "50% 100%",
      ease: "elastic.out"
    });

    // Snare Animation
    const snaretl = gsap.timeline({ paused: true });
    snaretl.to(snareDrumRef.current, {
      duration: 0.1,
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: "expo.out"
    }).to(snareDrumRef.current, {
      duration: 0.1,
      scaleY: 0.9,
      transformOrigin: "50% 100%",
      ease: "expo.out"
    }, 0).to(snareDrumRef.current, {
      duration: 0.4,
      scale: 1,
      transformOrigin: "50% 100%",
      ease: "elastic.out"
    });

    // Kick Animation
    const kicktl = gsap.timeline({ paused: true });
    kicktl.to(kickDrumRef.current, {
      duration: 0.1,
      scale: 1.02,
      transformOrigin: "50% 100%",
      ease: "expo.out"
    }).to(kickDrumRef.current, {
      duration: 0.4,
      scale: 1,
      transformOrigin: "50% 100%",
      ease: "elastic.out"
    });

    // Hi-Hat Animation
    const hiHattl = gsap.timeline({ paused: true });
    hiHattl.to(hiHatRef.current, {
      duration: 0.1,
      rotation: -4,
      transformOrigin: "50% 50%"
    }).to(hiHatRef.current, {
      duration: 0.6,
      rotation: 0,
      transformOrigin: "50% 50%",
      ease: "elastic.out(1.5, 0.2)"
    });

    // Function to play audio and trigger animations
    const playAudio = (audioRef) => {
      const audioEl = audioRef.current;
      audioEl.currentTime = 0;
      audioEl.play();
    };

    const crash = () => {
      crashtl.restart();
      playAudio(crashAudioRef);
    };

    const rightTom = () => {
      rightTomtl.restart();
      playAudio(smallTomAudioRef);
    };

    const leftTom = () => {
      leftTomtl.restart();
      playAudio(bigTomAudioRef);
    };

    const floorTom = () => {
      floorTomtl.restart();
      playAudio(floorTomAudioRef);
    };

    const snare = () => {
      snaretl.restart();
      playAudio(snareAudioRef);
    };

    const kick = () => {
      kicktl.restart();
      playAudio(kickAudioRef);
    };

    const hiHat = () => {
      hiHattl.restart();
      playAudio(hiHatClosedAudioRef);
    };

    window._drumFunctions = { crash, hiHat, snare, rightTom, leftTom, floorTom, kick };
  }, []);

  // Beat Sequencer Interval
  useEffect(() => {
    const runSequencer = () => {
      const currentBeat = beatRef.current;
      const beatIndex = (currentBeat - 1) % 8;
      const currentSeq = seqStateRef.current;
      const { crash, hiHat, snare, rightTom, leftTom, floorTom, kick } = window._drumFunctions || {};
      if (currentSeq.crash[beatIndex] && crash) crash();
      if (currentSeq.hiHat[beatIndex] && hiHat) hiHat();
      if (currentSeq.snare[beatIndex] && snare) snare();
      if (currentSeq.rightTom[beatIndex] && rightTom) rightTom();
      if (currentSeq.leftTom[beatIndex] && leftTom) leftTom();
      if (currentSeq.floorTom[beatIndex] && floorTom) floorTom();
      if (currentSeq.kick[beatIndex] && kick) kick();
      const nextBeat = (currentBeat % 8) + 1;
      beatRef.current = nextBeat;
      setBeat(nextBeat);
    };

    if (sequencerOn) {
      const intervalId = setInterval(runSequencer, 60000 / bpm);
      return () => clearInterval(intervalId);
    }
  }, [sequencerOn, bpm]);

  const toggleSequencer = () => {
    setSequencerVisible(!sequencerVisible);
  };

  const toggleSequencerOn = () => {
    setSequencerOn(!sequencerOn);
    if (!sequencerOn) {
      beatRef.current = 1;
      setBeat(1);
    }
  };

  const increaseBpm = () => {
    if (bpm < 300) setBpm(bpm + 10);
  };

  const decreaseBpm = () => {
    if (bpm > 100) setBpm(bpm - 10);
  };

  // Recording functions (if needed)
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsRecordingActive(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      } else if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
      setIsRecordingActive(mediaRecorderRef.current.state === "recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsRecordingActive(false);
    }
  };

  const discardRecording = (index) => {
    setRecordings(prev => prev.filter((_, idx) => idx !== index));
  };

  const saveRecording = async (index) => {
    try {
      const recording = recordings[index];
      const formData = new FormData();
      formData.append("userId", "dummy-user-id");
      formData.append("audio", recording.blob, `recording-${Date.now()}.webm`);
      const response = await fetch("https://deploy-metallica-api.vercel.app/audio/upload-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Saved recording:", data);
    } catch (error) {
      console.error("Error saving recording:", error);
    }
  };

  return (
    <div className="container">
      <header className="codrops-header">
        <div className="codrops-links">
          <a className="codrops-icon codrops-icon--prev" href="http://tympanus.net/Tutorials/SpringLoaders/" title="Previous Demo">
            <span>Previous Demo</span>
          </a>
          <a className="codrops-icon codrops-icon--drop" href="http://tympanus.net/codrops/?p=26165" title="Back to the article">
            <span>Back to the Codrops article</span>
          </a>
        </div>
        <h1>
          SVG Drums <span>with <a href="http://greensock.com/">GSAP</a> by <a href="https://twitter.com/iamjoshellis">METALLICA</a></span>
        </h1>
      </header>
      <div className="content">
        <div id="container-sequencer" className={`container-sequencer ${sequencerVisible ? '' : 'collapse'}`}>
          <div id="sequencer" className="sequencer">
            {['crash', 'hiHat', 'snare', 'rightTom', 'leftTom', 'floorTom', 'kick'].map(drum => (
              <div className="row" data-target-drum={drum} key={drum}>
                <img
                  ref={getDrumRef(drum)}
                  src={drumImages[drum]}
                  alt={drum.charAt(0).toUpperCase() + drum.slice(1)}
                />
                {Array(8).fill().map((_, i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      checked={seqState[drum][i]}
                      onChange={(e) => {
                        const newRow = [...seqState[drum]];
                        newRow[i] = e.target.checked;
                        setSeqState({ ...seqState, [drum]: newRow });
                      }}
                    />
                    <span></span>
                  </label>
                ))}
              </div>
            ))}
            <div className="sequencer-controls">
              <button id="sequencer-active-btn" className="btn" aria-label="Play" onClick={toggleSequencerOn}>
                <i className={`fa ${sequencerOn ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <input className="sequencer-controls-tempo" />
              <button id="bpm-decrease-btn" className="btn" aria-label="Decrease bpm" onClick={decreaseBpm}>
                <i className="fa fa-minus"></i>
              </button>
              <input id="bpm-indicator" type="number" min="100" max="300" size="3" value={bpm} readOnly />
              <button id="bpm-increase-btn" className="btn" aria-label="Increase bpm" onClick={increaseBpm}>
                <i className="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div id="container-drums" className={`container-drums ${sequencerVisible ? 'screen-sm-hidden' : ''}`}>
          {/* Insert your provided SVG content here */}
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 790"
            preserveAspectRatio="xMidYMid meet"
          >
            <g id="Drums">
              <path
                id="Drum-Shadow"
                d="M999.77,656.9c0,36.16-223.73,65.48-499.77,65.48S0.23,693.06.23,656.9,224,591.42,500,591.42,999.77,620.65,999.77,656.9Z"
                transform="translate(-0.23)"
                fill="#b0bcc5"
              />
              <g id="Snare">
                <g id="Snare-Drum">
                  <path
                    d="M655.47,320.79H843.88v92.94H655.47V320.79Z"
                    transform="translate(-0.23)"
                    fill="#eb495d"
                    stroke="#333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="8"
                  />
                  <path
                    d="M840.5,345.29H658.84"
                    transform="translate(-0.23)"
                    fill="none"
                    stroke="#e61c35"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                  />
                  <g>
                    <path
                      d="M662.22,375.71a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Zm188.42,0a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                  <path
                      d="M718,393.45v-11m0-30.42v-11"
                      transform="translate(-0.23)"
                      fill="none"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="8"
                    />
                    <path
                      d="M724.75,375.71a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                    <g>
                      <path
                        d="M781.36,393.45v-11m0-30.42v-11"
                        transform="translate(-0.23)"
                        fill="none"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="8"
                      />
                      <path
                        d="M788.12,375.71a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z"
                        transform="translate(-0.23)"
                        fill="#eefaf9"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                      />
                    </g>
                  </g>
                  <path
                    d="M647,320.79H850.64v17.74H647V320.79Zm0,75.2H850.64v17.74H647V396Z"
                    transform="translate(-0.23)"
                    fill="#eefaf9"
                    stroke="#333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="8"
                  />
                  <path
                    d="M650.4,333.46H847.26M650.4,408.66H847.26"
                    transform="translate(-0.23)"
                    fill="none"
                    stroke="#bcece8"
                    strokeMiterlimit="10"
                    strokeWidth="4"
                  />
                </g>
                <g id="Snare-Stand">
                  <path
                    d="M741.65,491.46H756v80.27H741.65V491.46Z"
                    transform="translate(-0.23)"
                    fill="#eefaf9"
                    stroke="#333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="6"
                  />
                  <g>
                    <path
                      d="M811.18,634.25a7.14,7.14,0,0,1-10.22-.08L744.6,577.81a7.17,7.17,0,1,1,10.14-10.14L811.1,624A7.29,7.29,0,0,1,811.18,634.25Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                    <path
                      d="M804.42,631.55l-56.78-56.78"
                      transform="translate(-0.23)"
                      fill="none"
                      stroke="#bcece8"
                      strokeMiterlimit="10"
                      strokeWidth="4"
                    />
                    <path
                      d="M811.52,624.45l-10.14,10.14s5.41,9.13,6.76,10.48c4,4,10.05,3.63,14-.34s4.31-10.05.42-14C821.24,629.52,811.52,624.45,811.52,624.45Z"
                      transform="translate(-0.23)"
                      fill="#5c5c5c"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                  </g>
                  <g>
                    <path
                      d="M687.91,634a7.14,7.14,0,0,1,.08-10.22l56.36-56.36a7.17,7.17,0,1,1,10.14,10.14l-56.36,56.36A7.14,7.14,0,0,1,687.91,634Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                    <path
                      d="M694.84,631.55l54.75-54.84"
                      transform="translate(-0.23)"
                      fill="none"
                      stroke="#bcece8"
                      strokeMiterlimit="10"
                      strokeWidth="4"
                    />
                    <path
                      d="M697.63,634.34L687.49,624.2S678.36,629.61,677,631c-4,4-3.63,10.05.34,14s10.05,4.31,14,.42C692.56,644.14,697.63,634.34,697.63,634.34Z"
                      transform="translate(-0.23)"
                      fill="#5c5c5c"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                  </g>
                  <path
                    d="M738.27,572.41a11.41,11.41,0,1,1,11.41,11.41A11.36,11.36,0,0,1,738.27,572.41Z"
                    transform="translate(-0.23)"
                    fill="#eefaf9"
                    stroke="#333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="6"
                  />
                  <path
                    d="M751.7,569.62a3.39,3.39,0,1,0,.76,4.73A3.38,3.38,0,0,0,751.7,569.62Z"
                    transform="translate(-0.23)"
                    fill="#333"
                  />
                  <g>
                    <path
                      d="M647.86,400.72a5.49,5.49,0,1,0-11,0V411.2h11V400.72Z"
                      transform="translate(-0.23)"
                      fill="#5c5c5c"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                    <path
                      d="M647.86,415.67V411.2h-11v8.45c0,3,2.11,6,5.15,6.34l103.33,11.49,1-10.9-98.52-10.9h0Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                    <path
                      d="M642.54,423.53l100.38,11.24,0.17-1.69L640.34,421.59a2.86,2.86,0,0,0,2.2,1.94h0Z"
                      transform="translate(-0.23)"
                      fill="#bcece8"
                    />
                    <g>
                      <path
                        d="M860.78,411.2h-11v4.48l-96.91,10.81,1.35,10.9L856.13,426c3-.34,4.73-3.38,4.73-6.34V411.2h-0.08Z"
                        transform="translate(-0.23)"
                        fill="#eefaf9"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                      />
                      <path
                        d="M756.35,432.91l0.17,1.69L856,423.53a2.88,2.88,0,0,0,2.11-1.61Z"
                        transform="translate(-0.23)"
                        fill="#bcece8"
                      />
                      <path
                        d="M860.78,400.72a5.49,5.49,0,1,0-11,0V411.2h11V400.72Z"
                        transform="translate(-0.23)"
                        fill="#5c5c5c"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                      />
                    </g>
                    <g>
                      <path
                        d="M744,432.3l11,0.06-0.36,63.37-11-.06Z"
                        transform="translate(-0.23)"
                        fill="#eefaf9"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                      />
                      <circle
                        cx="749.44"
                        cy="432.15"
                        r="7.18"
                        fill="#eefaf9"
                        stroke="#333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                      />
                      <circle cx="749.44" cy="432.15" r="1.69" fill="#333" />
                      <g>
                        <path
                          d="M823.86,421.84a5.48,5.48,0,0,0-7.77-.08l-70.8,70,7.69,7.77,70.8-70A5.38,5.38,0,0,0,823.86,421.84Z"
                          transform="translate(-0.23)"
                          fill="#eefaf9"
                          stroke="#333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="6"
                        />
                        <path
                          d="M815.83,432.32l-54.67,54.07"
                          transform="translate(-0.23)"
                          fill="none"
                          stroke="#bcece8"
                          strokeMiterlimit="10"
                          strokeWidth="2"
                        />
                        <circle
                          cx="820.42"
                          cy="424.55"
                          r="7.18"
                          fill="#eefaf9"
                          stroke="#333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="6"
                        />
                        <circle cx="820.42" cy="424.55" r="1.69" fill="#333" />
                      </g>
                      <g>
                        <path
                          d="M676.25,421a5.48,5.48,0,0,0-.08,7.77l70,70.8,7.77-7.69-70-70.8a5.38,5.38,0,0,0-7.69-.08h0Z"
                          transform="translate(-0.23)"
                          fill="#eefaf9"
                          stroke="#333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="6"
                        />
                        <path
                          d="M679.71,427.25l58.55,59.14"
                          transform="translate(-0.23)"
                          fill="none"
                          stroke="#bcece8"
                          strokeMiterlimit="10"
                          strokeWidth="2"
                        />
                        <circle
                          cx="680.16"
                          cy="424.55"
                          r="7.18"
                          fill="#eefaf9"
                          stroke="#333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="6"
                        />
                        <circle cx="680.16" cy="424.55" r="1.69" fill="#333" />
                      </g>
                    </g>
                    <path
                      d="M764.46,493.24a7.54,7.54,0,0,1-7.52,7.52H741.56a7.54,7.54,0,0,1-7.52-7.52v-3.55a7.54,7.54,0,0,1,7.52-7.52h15.38a7.54,7.54,0,0,1,7.52,7.52v3.55Z"
                      transform="translate(-0.23)"
                      fill="#eefaf9"
                      stroke="#333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                    />
                  </g>
                </g>
              </g>
              <g id="Floor-Tom">
								<g id="Floor-Tom-Drum">
									<path d="M160.34,314.87H402.83V585.25H160.34V314.87Z" transform="translate(-0.23)" fill="#eb495d" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
									<path d="M399.45,339.38H163.72" transform="translate(-0.23)" fill="none" stroke="#e61c35" stroke-miterlimit="10" stroke-width="8"/>
									<g>
										<path d="M167.1,367.26a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Zm242.49,0a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M241.45,343.6v-11" transform="translate(-0.23)" fill="none" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<path d="M248.21,367.26a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<g>
											<path d="M321.72,343.6v-11" transform="translate(-0.23)" fill="none" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M328.48,367.26a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										</g>
									</g>
									<path d="M152.74,314.87H409.59v17.74H152.74V314.87Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
									<path d="M156.12,327.55h250.1" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
									<g>
										<g>
											<path d="M409.59,549.76a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Zm-242.49,0a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
											<path d="M321.72,556.52v11" transform="translate(-0.23)" fill="none" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M328.48,549.76a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
											<g>
												<path d="M241.45,556.52v11" transform="translate(-0.23)" fill="none" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
												<path d="M248.21,549.76a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
											</g>
										</g>
										<path d="M153.58,567.51H410.44v17.74H153.58V567.51Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<path d="M157,580.18h250.1" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
									</g>
								</g>
								<g id="Floor-Tom-Legs">
									<path d="M147.92,521.71l-9.55,44.53v64.38a4.73,4.73,0,0,0,4.65,4.82,4.67,4.67,0,0,0,4.65-4.82V567.25l9.55-44.53,9.38-44.53,3-14-9.21-1.86-12.42,59.4h0Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M153.92,625l-5.75-9.29h-9.29L133.3,625a11.43,11.43,0,0,0-1.69,6.17,12,12,0,0,0,12,12,12.13,12.13,0,0,0,12-12.17,14.12,14.12,0,0,0-1.69-6h0Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M170.48,429.78a8.88,8.88,0,0,0-17.74,0v49h17.74v-49Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<g>
										<path d="M278.63,630.62a4.73,4.73,0,0,0,4.65,4.82,4.67,4.67,0,0,0,4.65-4.82V477.1h-9.29V630.62Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M294.18,625l-5.75-9.29h-9.29L273.56,625a11.43,11.43,0,0,0-1.69,6.17,12,12,0,0,0,12,12,12.13,12.13,0,0,0,12-12.17,14.12,14.12,0,0,0-1.69-6h0Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M292.15,429.78a8.88,8.88,0,0,0-17.74,0v49h17.74v-49Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<g>
										<path d="M416,521.71l-12-59.57L395,464l2.87,14,9,44.53,8.79,44.53v63.37a4.73,4.73,0,0,0,4.65,4.82,4.67,4.67,0,0,0,4.65-4.82V566.07L416,521.71h0Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M431.05,625l-5.75-9.29H416L410.44,625a11.43,11.43,0,0,0-1.69,6.17,12,12,0,0,0,12,12,12.13,12.13,0,0,0,12-12.17,14.12,14.12,0,0,0-1.69-6h0Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M392.7,429.78a8.88,8.88,0,0,1,17.74,0v49H392.7v-49Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
								</g>
							</g>
							<g id="Hi-Hat">
								<g id="Hi-Hat-Stand-Top">
									<path d="M887.82,290.37V190.84a4.73,4.73,0,0,0-4.65-4.82,4.67,4.67,0,0,0-4.65,4.82v99.53h9.29Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M890.35,416.94a6.91,6.91,0,0,1-6.93,6.93H883a6.91,6.91,0,0,1-6.93-6.93V216.19a6.91,6.91,0,0,1,6.93-6.93h0.42a6.91,6.91,0,0,1,6.93,6.93V416.94h0Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M878.52,249h9.29v65.9h-9.29V249Z" transform="translate(-0.23)" fill="#bcece8"/>
									<path d="M895.08,227.85c0-.84-0.51-0.51-0.51-0.59v-0.42a6.23,6.23,0,0,0-6.51-6.59H879.2c-3.89,0-7.44,2.7-7.44,6.59v0.42c0,0.08.51-.25,0.51,0.59h22.81Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<g id="Hi-Hat-Top">
										<path d="M960.23,240.27l-27.88-.68c-19.43-.42-27.8-3.8-33.37-7.6v0.17a16.91,16.91,0,0,0-10.73-3.55h-10a17.15,17.15,0,0,0-10.82,3.55v-0.08c-5.58,3.8-14,7.1-33.46,7.52l-28.3.59a5.6,5.6,0,0,0-5.83,5.41v0.08c0,3.13,3,5.66,6.08,5.66H960.4c3.13,0,5-2.53,5-5.66v-0.08a5,5,0,0,0-5.15-5.32h0Z" transform="translate(-0.23)" fill="#fde74c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M875.14,234.61h15.21" transform="translate(-0.23)" fill="none" stroke="#fef5b7" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
									</g>
								</g>
								<g id="Hi-Hat-Bottom">
									<path d="M805.78,264.43l27.8,0.68c19.43,0.42,28.05,3.8,33.12,7.6,3.38,2.37,7.52,4.14,11.58,4.14h10a17.51,17.51,0,0,0,10.82-4V272.8c5.58-3.8,14-7.18,33.46-7.69l27.8-.68a5.24,5.24,0,0,0,5.32-5.49v-0.08c0-3.13-1.94-4.9-5-4.9H806.2c-3.13,0-6.08,1.77-6.08,4.9v0.08c-0.17,3.21,2.53,5.49,5.66,5.49h0Z" transform="translate(-0.23)" fill="#fde74c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M875.14,270.94h15.21" transform="translate(-0.23)" fill="none" stroke="#bead39" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" opacity="0.3"/>
								</g>
								<g id="Hi-Hat-Stand">
									<path d="M876,276.85h14.36V586.94H876V276.85Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<g>
										<path d="M945,647.77a7.14,7.14,0,0,1-10.22-.08l-56.36-56.36a7.17,7.17,0,1,1,10.14-10.14l56.36,56.36A7.14,7.14,0,0,1,945,647.77Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M938.34,645.07l-56.78-56.78" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<path d="M945.36,638l-10.14,10.14s5.41,9.13,6.76,10.48c4,4,10.05,3.63,14-.34s4.31-10.05.42-14C955.16,643,945.36,638,945.36,638Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<g>
										<path d="M821.83,647.52a7.14,7.14,0,0,1,.08-10.22l56.36-56.36a7.17,7.17,0,1,1,10.14,10.14l-56.36,56.36A7.14,7.14,0,0,1,821.83,647.52Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M828.76,645.07l54.75-54.84" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<path d="M831.55,647.86l-10.14-10.14s-9.13,5.41-10.48,6.76c-4,4-3.63,10.05.34,14s10.05,4.31,14,.42C826.48,657.66,831.55,647.86,831.55,647.86Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<path d="M872.19,585.92a11.41,11.41,0,1,1,11.41,11.41A11.36,11.36,0,0,1,872.19,585.92Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M885.62,583.14a3.39,3.39,0,1,0,.76,4.73A3.38,3.38,0,0,0,885.62,583.14Z" transform="translate(-0.23)" fill="#333"/>
									<g>
										<circle cx="896.54" cy="416.69" r="8.45" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M894.58,426.49a9.23,9.23,0,0,1-9.21,9.21h-4.31a9.23,9.23,0,0,1-9.21-9.21V407.82a9.23,9.23,0,0,1,9.21-9.21h4.31a9.23,9.23,0,0,1,9.21,9.21v18.67Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<path d="M872.27,276.85a1.2,1.2,0,0,0-.51-0.17v0.42a7.72,7.72,0,0,0,7.44,7.35h8.87c3.89,0,6.51-3.55,6.51-7.35v-0.42a1.2,1.2,0,0,1,.51.17H872.27Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
								</g>
							</g>
							<g id="Main-Kit">
								<g id="Toms">
									<g id="Tom-Rack">
										<path d="M478,215.85a8.51,8.51,0,0,1,8.45,8.62v85.34c0,5.07-16.9,5.07-16.9,0V224.47A8.51,8.51,0,0,1,478,215.85Zm36.33,94V224.47a8.45,8.45,0,1,1,16.9,0v85.34C531.26,314.54,514.36,314.54,514.36,309.81Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M540.22,309.81a9.27,9.27,0,0,1-9.29,9.29H470.09a9.29,9.29,0,0,1,0-18.59h60.83A9.27,9.27,0,0,1,540.22,309.81Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<g id="Tom-Left-All">
										<g id="Tom-Left-Drum">
											<path d="M259.2,146.74H445.93V302.2H259.2V146.74Z" transform="translate(-0.23)" fill="#eb495d" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M262.58,171.24h180" transform="translate(-0.23)" fill="none" stroke="#e61c35" stroke-miterlimit="10" stroke-width="8"/>
											<g>
												<path d="M265.11,197.43a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Zm187.57,0a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												<path d="M320.88,173.77v-11" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
												<path d="M327.64,197.43a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												<g>
													<path d="M383.4,173.77v-11" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
													<path d="M390.16,197.43a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												</g>
											</g>
											<path d="M251.59,146.74H452.68v17.74H251.59V146.74Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M449.3,159.41H255" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
											<g>
												<g>
													<path d="M452.68,268.4a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Zm-187.57,0a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													<path d="M383.4,275.16v11" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
													<path d="M390.16,268.4a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													<g>
														<path d="M320.88,275.16v11" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
														<path d="M327.64,268.4a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													</g>
												</g>
												<path d="M251.59,284.46H452.68V302.2H251.59V284.46Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
												<path d="M449.3,298H255" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
											</g>
										</g>
										<path d="M435.79,233.85a9.23,9.23,0,0,1-9.21,9.21h-4.31a9.23,9.23,0,0,1-9.21-9.21V215.17a9.23,9.23,0,0,1,9.21-9.21h4.31a9.23,9.23,0,0,1,9.21,9.21v18.67Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M432.83,237.14h-16a6.68,6.68,0,0,0,5.83,3.38H427A6.58,6.58,0,0,0,432.83,237.14Z" transform="translate(-0.23)" fill="#bcece8"/>
										<path d="M431.65,232.92h45.54c5.07,0,9-3.72,9-8.45A8.16,8.16,0,0,0,478,216H431.65A8.45,8.45,0,1,0,431.65,232.92Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M483.36,227H426.07a6,6,0,0,0,5.49,3.38h46A6.08,6.08,0,0,0,483.36,227Z" transform="translate(-0.23)" fill="#bcece8"/>
										<circle cx="477.8" cy="224.3" r="11.24" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M480.06,221.6a3.39,3.39,0,1,0,.76,4.73A3.38,3.38,0,0,0,480.06,221.6Z" transform="translate(-0.23)" fill="#333"/>
									</g>
									<g id="Tom-Right-All">
										<g id="Tom-Right-Drum">
											<path d="M555.76,146.74H742.49V302.2H555.76V146.74Z" transform="translate(-0.23)" fill="#eb495d" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M559.14,171.24h180" transform="translate(-0.23)" fill="none" stroke="#e61c35" stroke-miterlimit="10" stroke-width="8"/>
											<g>
												<path d="M561.68,197.43a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Zm187.57,0a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												<path d="M617.44,173.77v-11" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
												<path d="M624.2,197.43a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												<g>
													<path d="M680,173.77v-11" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
													<path d="M686.73,197.43a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
												</g>
											</g>
											<path d="M548.16,146.74H749.25v17.74H548.16V146.74Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M745.87,159.41H551.54" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
											<g>
												<g>
													<path d="M749.25,268.4a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Zm-187.57,0a6.76,6.76,0,0,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													<path d="M680,275.16v11" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
													<path d="M686.73,268.4a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,1,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													<g>
														<path d="M617.44,275.16v11" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
														<path d="M624.2,268.4a6.76,6.76,0,1,1-13.52,0v-16.9a6.76,6.76,0,0,1,13.52,0v16.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
													</g>
												</g>
												<path d="M548.16,284.46H749.25V302.2H548.16V284.46Z" transform="translate(-0.23)" fill="#f8fdfd" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
												<path d="M745.87,298H551.54" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
											</g>
										</g>
										<path d="M587.87,215.09a9.23,9.23,0,0,0-9.21-9.21h-4.31a9.23,9.23,0,0,0-9.21,9.21v18.67a9.23,9.23,0,0,0,9.21,9.21h4.31a9.23,9.23,0,0,0,9.21-9.21V215.09Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M568.78,237.14h16a6.68,6.68,0,0,1-5.83,3.38h-4.31A6.78,6.78,0,0,1,568.78,237.14Z" transform="translate(-0.23)" fill="#bcece8"/>
										<path d="M570,232.92H523.66a8.31,8.31,0,0,1-8.62-8.45,8.51,8.51,0,0,1,8.62-8.45H570A8.45,8.45,0,1,1,570,232.92Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M518.25,227h57.29a6,6,0,0,1-5.49,3.38H524a6.16,6.16,0,0,1-5.75-3.38h0Z" transform="translate(-0.23)" fill="#bcece8"/>
										<circle cx="523.34" cy="224.3" r="11.24" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M521.63,221.6a3.39,3.39,0,1,1-.76,4.73A3.38,3.38,0,0,1,521.63,221.6Z" transform="translate(-0.23)" fill="#333"/>
									</g>
								</g>
							</g>

              <g id="Kick">
									<g id="Kick-Stand">
										<path d="M314.29,460.45a8.89,8.89,0,0,1,17.74.84l-2.28,49L312,509.46Zm11.24,49.68L319,651.58a4.68,4.68,0,0,1-4.9,4.56,4.61,4.61,0,0,1-4.39-5l6.51-141.44Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M304.23,645.24l6.17-9,9.29,0.34,5.15,9.46c1,2.53,1.52,4.06,1.44,6.34a12,12,0,0,1-12.5,11.41,12.19,12.19,0,0,1-11.41-12.67A12.83,12.83,0,0,1,304.23,645.24Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<g>
											<path d="M686.81,460.45a8.89,8.89,0,0,0-17.74.84l2.28,49,17.74-.84Zm-11.24,49.68,6.51,141.44a4.68,4.68,0,0,0,4.9,4.56,4.61,4.61,0,0,0,4.39-5l-6.51-141.44Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
											<path d="M696.87,645.24l-6.17-9-9.29.34-5.15,9.46c-1,2.53-1.52,4.06-1.44,6.34a12,12,0,0,0,12.5,11.41,12.19,12.19,0,0,0,11.41-12.67,13.91,13.91,0,0,0-1.86-5.91h0Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										</g>
									</g>
									<g id="Kick-Drum">
										<circle cx="500.28" cy="489.77" r="177.43" fill="#eb495d" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<circle id="Inner-Drum-Wobble" cx="500.28" cy="489.77" r="170" fill="none"/>
										<circle id="Inner-Drum" cx="500.28" cy="489.77" r="162.73" fill="#fdfffc" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<g id="Drum-Logo-Wobble">
											<path d="M454,369.12l-3.63,16.81H451c6,0,10.31-7,10.31-12.67,0-4.06-2.28-7.6-7.94-7.6-11.74,0-19.52,6.59-19.52,17.57a9.43,9.43,0,0,0,1,4.9c-5,0-7.77-1.77-7.77-7,0-9.63,13.35-18.84,25.43-18.84,11.41,0,16.39,5.66,16.39,11.58,0,4.39-2.79,9.46-7.77,12.34,3.8,1.1,5,3.8,5,7.27,0,5.91-3.55,13.86-3.55,18.33a5,5,0,0,0,2.79,4.82,28.5,28.5,0,0,1-7.18,1.27c-4.73,0-5.66-2.45-5.66-4.82,0-4.82,3.8-13.52,3.8-19,0-2.87-1.1-4.9-4.31-4.9a11.75,11.75,0,0,0-2.28.25l-5.83,27.29H433.5l9.89-46Zm74.44,11.15a10.5,10.5,0,0,0-6.25,2.11L525.6,366l-10.73,1.44-8,37.6a17.54,17.54,0,0,0-.42,3.38,7.55,7.55,0,0,1-3.8,1.61c-2.87,0-3.63-1.18-3.63-2.79,0-.68.17-1.69,0.25-2.45l5.24-24.84H494.09l-5.24,24.84a14.42,14.42,0,0,0-.42,2.53c-1.77,1.44-3.63,2.7-5.15,2.7-2.87,0-3.63-1.1-3.63-2.7,0-.68.17-1.69,0.25-2.45L485.13,380H474.74l-5.24,24.84a21.76,21.76,0,0,0-.42,3.8c0,5.41,3.46,7.94,9,7.94,3.13,0,7-2.87,10.39-6.08,0.68,4.22,4,6.08,8.87,6.08,2.79,0,6.25-2.37,9.38-5.15,1.27,4,5.58,5.41,11.49,5.41,12.93,0,19.18-16,19.18-27.38C537.51,385.17,535.32,380.27,528.39,380.27Zm-8.53,31.35c-2.2,0-3.21-.51-3.21-2.7a23.67,23.67,0,0,1,.59-4l4.14-19.43a11.05,11.05,0,0,1,3.89-1c1.77,0,4.14,1,4.14,5.32,0,5.32-3.55,21.8-9.55,21.8h0Zm34.22-31.26-5.32,24.59a7.47,7.47,0,0,0-.34,2.28c0,1.61.76,2.7,3.63,2.7,1.69,0,3.63-1.27,5.49-2.87l5.66-26.7h10.48l-8.87,42c-2.2,10.31-8.36,12.34-13.18,12.34-4.39,0-8.53-3.13-8.53-7.86,0-6.76,5.66-8.87,12.5-10.81l1.1-5c-3.3,3-6.93,5.58-9.8,5.58-5.66,0-9-2.45-9-7.86a20.88,20.88,0,0,1,.42-3.72l5.07-24.59h10.65v-0.08ZM550,428.26c1.44,0,3.38-1.35,4.31-5.66l0.84-4.31c-4.56,1.52-8,3.63-8,7.52C547.06,426.83,548.41,428.26,550,428.26Zm-117.61-2.7H536.33" transform="translate(-0.23)" fill="none"/>
										</g>
										<g id="Codrops">
											<path d="M584.07,408.24a16.5,16.5,0,0,0-.17-1.94,20.94,20.94,0,0,1-.17-2.45c-0.08-.93-0.17-2.11-0.25-3.38s-0.17-3-.25-4.73-0.17-4-.34-6.51l-8.53,1.1c-0.93,2.87-1.86,5.66-3,8.45a70.62,70.62,0,0,1-4.06,8.53,3,3,0,0,0-.84.59,32.87,32.87,0,0,0,.76-4,37.66,37.66,0,0,0,.25-4.22,15.86,15.86,0,0,0-.51-4.31,6.31,6.31,0,0,0-1.52-2.79,5.72,5.72,0,0,0-2.2-1.52,7.43,7.43,0,0,0-2.79-.42,10.53,10.53,0,0,0-3.8.68,14.26,14.26,0,0,0-2.87,1.94l0.93-4.14h-8.28l-2.11,9.63-0.08-.08a11.83,11.83,0,0,1-2.37.51,9.75,9.75,0,0,1-2.2.08h-0.34l-0.51.34v-0.08c0-6.08-2.37-9.21-7.27-9.21a12.47,12.47,0,0,0-5.15,1,14.36,14.36,0,0,0-4,2.7c0-.17-0.08-0.34-0.08-0.51a3.52,3.52,0,0,0-.76-1.35,4.92,4.92,0,0,0-1.27-.93,3.78,3.78,0,0,0-1.69-.34,5,5,0,0,0-1.94.34,16,16,0,0,0-1.77.76,10.76,10.76,0,0,0-1.61,1.1l-1.52,1.27,0.76-3.55h-8.28l-3.89,18.5-0.76,2a13.29,13.29,0,0,1-1,1.61,6.66,6.66,0,0,1-1.27,1,3.16,3.16,0,0,1-1.52.42A3,3,0,0,1,494,414a2,2,0,0,1-.59-1.69,3.47,3.47,0,0,1,.08-0.93,3.59,3.59,0,0,1,.17-0.93l6.59-31-8.36,1.18-2.7,13.18v-0.25a2.73,2.73,0,0,0-1.27-2.11,5.91,5.91,0,0,0-3.63-.84,11.28,11.28,0,0,0-4.56.93A12.12,12.12,0,0,0,476,394a20.15,20.15,0,0,0-2.87,3.63,3.42,3.42,0,0,0-.42.76c-0.08,0-.17.08-0.25,0.08a12.12,12.12,0,0,1-2.37.59,9.75,9.75,0,0,1-2.2.08h-0.34l-0.42.34v-0.08c0-6.08-2.37-9.21-7.35-9.21a12.88,12.88,0,0,0-5.24,1,13.37,13.37,0,0,0-4.06,2.79,18.9,18.9,0,0,0-3,3.89,26.24,26.24,0,0,0-3.13,8.87,28.06,28.06,0,0,0-.34,3.46,13.83,13.83,0,0,1-4,3,13.4,13.4,0,0,1-6.25,1.52,8.15,8.15,0,0,1-3.46-.68,4.54,4.54,0,0,1-2.11-1.86,8.36,8.36,0,0,1-1.1-2.79,16.36,16.36,0,0,1-.25-3.63,51.42,51.42,0,0,1,.42-6.08,45.59,45.59,0,0,1,1.27-6.08,55.52,55.52,0,0,1,1.86-5.66,26.57,26.57,0,0,1,2.45-4.65,15.46,15.46,0,0,1,2.87-3.21,5.16,5.16,0,0,1,3.13-1.18,4.26,4.26,0,0,1,1.61.25,2.57,2.57,0,0,1,1.1.76,2.78,2.78,0,0,1,.59,1.1,6.57,6.57,0,0,1,.17,1.35,5.85,5.85,0,0,1-.25,1.69,6.35,6.35,0,0,1-.59,1.52,4.74,4.74,0,0,1-.84,1.27,4,4,0,0,1-1,.76,3.32,3.32,0,0,0,1.69,1.27,5.68,5.68,0,0,0,1.52.25,4,4,0,0,0,1.86-.42,3.16,3.16,0,0,0,1.27-1.1,3.76,3.76,0,0,0,.68-1.69,16.46,16.46,0,0,0,.17-2.11,7.84,7.84,0,0,0-.76-3.55,6.18,6.18,0,0,0-2-2.37,8.35,8.35,0,0,0-3-1.35,17.9,17.9,0,0,0-3.72-.42,14.35,14.35,0,0,0-5.15.84,15.21,15.21,0,0,0-4.31,2.37,19.71,19.71,0,0,0-3.46,3.55,28.38,28.38,0,0,0-2.7,4.31,41.16,41.16,0,0,0-2,4.82,36.39,36.39,0,0,0-1.35,5,47.5,47.5,0,0,0-.76,4.82,39.11,39.11,0,0,0-.25,4.31,24.79,24.79,0,0,0,.76,6.59,10,10,0,0,0,2.37,4.39,9.83,9.83,0,0,0,3.89,2.45,18.16,18.16,0,0,0,5.58.76,17,17,0,0,0,4.39-.59,19.79,19.79,0,0,0,4.65-1.86,17.32,17.32,0,0,0,4.22-3.3,14.68,14.68,0,0,0,1.1-1.27,7.14,7.14,0,0,0,.42,1.44,6.16,6.16,0,0,0,1.94,2.79,8.31,8.31,0,0,0,3,1.61,12.76,12.76,0,0,0,3.72.51,11.11,11.11,0,0,0,5-1.18,12.45,12.45,0,0,0,4.14-3.46,22,22,0,0,0,3-5.41,30,30,0,0,0,1.52-7.18,21.26,21.26,0,0,0,4.14-1.1,4.12,4.12,0,0,0-.25.59,29.23,29.23,0,0,0-1.18,4.48,25.54,25.54,0,0,0-.42,4.22,12.81,12.81,0,0,0,.68,4.31,8.62,8.62,0,0,0,1.69,2.87,5.9,5.9,0,0,0,2.45,1.61,8.23,8.23,0,0,0,2.87.51,9.65,9.65,0,0,0,2.79-.42,12.38,12.38,0,0,0,2.37-1.18,9.06,9.06,0,0,0,1.86-1.69,10.49,10.49,0,0,0,1.44-1.94,6.18,6.18,0,0,0,1.77,3.72,5.74,5.74,0,0,0,3.8,1.27,11.9,11.9,0,0,0,1.69-.08,9.46,9.46,0,0,0,1.94-.51,15.79,15.79,0,0,0,2.11-1,11.57,11.57,0,0,0,1.94-1.69l-0.68,3.3h8.28l4.56-21.8a14.91,14.91,0,0,1,1.94-1.61,3.72,3.72,0,0,1,2.2-.59,0.66,0.66,0,0,1,.59.25,1.61,1.61,0,0,1,.25.68,3,3,0,0,1,.17.93,4.12,4.12,0,0,0,.34.93,1.73,1.73,0,0,0,.68.68,2.37,2.37,0,0,0,1.27.25h0.34c-0.51,1-.93,2.11-1.35,3.21a22.28,22.28,0,0,0-1.1,4.39,21.76,21.76,0,0,0-.34,3.8,12.65,12.65,0,0,0,.68,4.22,6.16,6.16,0,0,0,1.94,2.79,8.31,8.31,0,0,0,3,1.61,12.76,12.76,0,0,0,3.72.51,11.11,11.11,0,0,0,5-1.18,12.45,12.45,0,0,0,4.14-3.46,22,22,0,0,0,3-5.41,30,30,0,0,0,1.52-7.18,21.24,21.24,0,0,0,4.82-1.35l-6.93,32.78,8.7-2.11,3-14a4.65,4.65,0,0,0,.59.76,3.75,3.75,0,0,0,.93.68,6.33,6.33,0,0,0,1.35.42,11.87,11.87,0,0,0,1.94.17,12.67,12.67,0,0,0,4.9-.93,11.6,11.6,0,0,0,3.72-2.53,11.9,11.9,0,0,0,2.28-3.13,16,16,0,0,0,.42,1.94,7.09,7.09,0,0,0,1.52,2.37,8.24,8.24,0,0,0,2.62,1.69,9.74,9.74,0,0,0,3.72.68c0.76,0,1.61-.08,2.53-0.17a14.94,14.94,0,0,0,2.62-.68,13.46,13.46,0,0,0,2.45-1.27,8.43,8.43,0,0,0,2-1.86,12.32,12.32,0,0,0,1.44-2.53,10.52,10.52,0,0,0,.51-3.38,8.93,8.93,0,0,0,.17-2h0Zm-122.94-9.8a3.5,3.5,0,0,0-.51,1.94,2.89,2.89,0,0,0,.34,1.52,1.58,1.58,0,0,0,1.18.84,35.75,35.75,0,0,1-1,4.73,19.79,19.79,0,0,1-1.61,3.8,9.07,9.07,0,0,1-1.94,2.53,3.36,3.36,0,0,1-2.11.93,5.88,5.88,0,0,1-1.35-.17,2.4,2.4,0,0,1-.93-0.68,3.19,3.19,0,0,1-.51-1.44,16.14,16.14,0,0,1-.17-2.37,22.27,22.27,0,0,1,.25-3.21,26.6,26.6,0,0,1,.76-3.55c0.34-1.18.76-2.37,1.18-3.46a25.68,25.68,0,0,1,1.61-3,11.65,11.65,0,0,1,1.77-2.11,3.19,3.19,0,0,1,2-.76,2.61,2.61,0,0,1,.93.17,1.33,1.33,0,0,1,.59.59,2.82,2.82,0,0,1,.42,1,7.58,7.58,0,0,1,.17,1.52,5,5,0,0,0-1.1,1.18h0Zm24.5,11v0.34a4.39,4.39,0,0,1-.93,2.11,7.57,7.57,0,0,1-1.27,1.52,3.59,3.59,0,0,1-1.44.84,4.2,4.2,0,0,1-1.35.25,3.79,3.79,0,0,1-.93-0.08,2,2,0,0,1-.93-0.51,4.78,4.78,0,0,1-.76-1.35,9.16,9.16,0,0,1-.34-2.53,20.1,20.1,0,0,1,.25-3,28.54,28.54,0,0,1,.76-3.46c0.34-1.18.76-2.28,1.18-3.38a19.34,19.34,0,0,1,1.61-3,9.47,9.47,0,0,1,1.94-2.11,4.09,4.09,0,0,1,2.28-.76,3.75,3.75,0,0,1,1.1.17,4.69,4.69,0,0,1,.68.51,1.7,1.7,0,0,1,.34.68,3.06,3.06,0,0,1,.25.59l-2.45,13.18h0Zm47.4-11a3.5,3.5,0,0,0-.51,1.94,2.89,2.89,0,0,0,.34,1.52,1.58,1.58,0,0,0,1.18.84,35.75,35.75,0,0,1-1,4.73,19.78,19.78,0,0,1-1.61,3.8,9.06,9.06,0,0,1-1.94,2.53,3.36,3.36,0,0,1-2.11.93,5.88,5.88,0,0,1-1.35-.17,2.4,2.4,0,0,1-.93-0.68,3.19,3.19,0,0,1-.51-1.44,16.14,16.14,0,0,1-.17-2.37,22.26,22.26,0,0,1,.25-3.21,26.59,26.59,0,0,1,.76-3.55c0.34-1.18.76-2.37,1.18-3.46a25.67,25.67,0,0,1,1.61-3,11.65,11.65,0,0,1,1.77-2.11,3.19,3.19,0,0,1,2-.76,2.61,2.61,0,0,1,.93.17,1.33,1.33,0,0,1,.59.59,2.82,2.82,0,0,1,.42,1,7.58,7.58,0,0,1,.17,1.52,5,5,0,0,0-1.1,1.18h0Zm26.36,4.14a23.61,23.61,0,0,1-.59,3.38,22.33,22.33,0,0,1-1,3.38,13.18,13.18,0,0,1-1.52,2.87,6.89,6.89,0,0,1-2.11,2,4.82,4.82,0,0,1-2.7.76,2.51,2.51,0,0,1-1.52-.42,1.77,1.77,0,0,1-.68-0.93l3.38-16.05a6.56,6.56,0,0,1,1.86-2.11,3.6,3.6,0,0,1,2-.68,3.79,3.79,0,0,1,.93.08,1.61,1.61,0,0,1,.93.59,5.49,5.49,0,0,1,.76,1.44,10.4,10.4,0,0,1,.34,2.62,12.44,12.44,0,0,1-.08,3h0Zm16,10.14a4.51,4.51,0,0,1-1.1,1.61,4.43,4.43,0,0,1-1.61.93,6.59,6.59,0,0,1-1.86.25,3.22,3.22,0,0,1-2.7-1,5,5,0,0,1-.76-3,1,1,0,0,0,.68.59,3.59,3.59,0,0,0,.93.17,1.8,1.8,0,0,0,1-.25,1.49,1.49,0,0,0,.76-0.68,2,2,0,0,0,.51-0.93,4.24,4.24,0,0,0,.17-1,1.65,1.65,0,0,0-.34-1.18,2.64,2.64,0,0,0-.93-0.76c0.93-1.86,1.86-3.63,2.62-5.41s1.44-3.55,2-5.41c0.08,1.44.25,2.79,0.34,3.89s0.17,2.11.25,3,0.17,1.61.25,2.2,0.08,1.18.17,1.69,0.08,1,.08,1.44v1.44a9.58,9.58,0,0,1-.51,2.53h0Z" transform="translate(-0.23)" fill="#333"/>
											<path d="M533,428.52H417.2m167.29,0h-33" transform="translate(-0.23)" fill="none" stroke="#333" stroke-linecap="round" stroke-miterlimit="10" stroke-width="5"/>
										</g>
										<path d="M319.19,481.07a8.87,8.87,0,1,0,0,17.74v7.86h16.9v-33.8h-16.9v8.2Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<path d="M318.17,490a1.69,1.69,0,1,0,1.69-1.69A1.69,1.69,0,0,0,318.17,490Z" transform="translate(-0.23)" fill="#333"/>
										<path d="M331,503.29v-27" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<path d="M402.58,641.94a8.84,8.84,0,1,0,15.29,8.87l6.84,4,8.45-14.62-29.23-16.9-8.45,14.62Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
										<path d="M409.59,647.77a1.71,1.71,0,0,0,2.28-.59,1.67,1.67,0,0,0-2.87-1.69A1.57,1.57,0,0,0,409.59,647.77Z" transform="translate(-0.23)" fill="#333"/>
										<path d="M427.84,642.87l-23.4-13.52" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<g>
											<path d="M583.39,650.73a8.84,8.84,0,0,0,15.29-8.87l6.76-3.89L597,623.35l-29.23,16.9,8.45,14.62,7.18-4.14h0Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M591.93,647.52a1.67,1.67,0,1,0-2.28-.59A1.68,1.68,0,0,0,591.93,647.52Z" transform="translate(-0.23)" fill="#333"/>
											<path d="M596.74,629.35l-23.49,13.52" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										</g>
										<g>
											<path d="M680.81,498.48a8.87,8.87,0,1,0,0-17.74v-7.86h-16.9v33.8h16.9v-8.2Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M682.93,489.44a1.69,1.69,0,1,0-1.69,1.69A1.69,1.69,0,0,0,682.93,489.44Z" transform="translate(-0.23)" fill="#333"/>
											<path d="M669,476.25v27" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										</g>
										<g>
											<path d="M598.52,337.43a8.84,8.84,0,0,0-15.29-8.87l-6.76-3.89L568,339.29l29.23,16.9,8.45-14.62-7.18-4.14h0Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M591.5,331.69a1.71,1.71,0,0,0-2.28.59A1.67,1.67,0,1,0,592.1,334,1.66,1.66,0,0,0,591.5,331.69Z" transform="translate(-0.23)" fill="#333"/>
											<path d="M573.42,336.67l23.4,13.52" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										</g>
										<g>
											<path d="M417.7,328.82a8.84,8.84,0,1,0-15.29,8.87l-6.84,4L404,356.28l29.23-16.9-8.45-14.62Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
											<path d="M409.09,331.94a1.68,1.68,0,0,0-.59,2.28,1.67,1.67,0,0,0,2.87-1.69A1.64,1.64,0,0,0,409.09,331.94Z" transform="translate(-0.23)" fill="#333"/>
											<path d="M404.27,350.19l23.49-13.52" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										</g>
									</g>
								</g>
							</g>
              
              <g id="Crash">
								<g id="Crash-Stand-Top">
									<path d="M173.78,121.64l17.15-47.15a4.64,4.64,0,1,0-8.7-3.21l-17.15,47.15Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M188.48,88.61a7,7,0,0,0-4.14-9l-0.42-.17a7,7,0,0,0-9,4.14L119.87,235.11l13.52,4.9Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M157.81,118.6a0.3,0.3,0,0,1-.08.17l-0.17.42a7,7,0,0,0,4.14,9l8.36,3a7,7,0,0,0,9-4.14l0.17-.42c0-.08,0-0.17.08-0.17l-21.46-7.86h0Zm30.92-18.42a0.3,0.3,0,0,1,.08-0.17l0.17-.42a7,7,0,0,0-4.14-9l-8.36-3a7,7,0,0,0-9,4.14l-0.17.42c0,0.08,0,.17-0.08.17l21.46,7.86h0Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<g id="Crash-Cymbol">
										<path d="M286.91,151.47l-41.15-15.8c-28.64-11-39.63-19.26-46.3-26.61-2.79-2.87-8.28-8-14.28-10.22l-7.35-2.7h-0.17s-5.58-2-7.35-2.7c-6-2.2-13.6-1.77-17.49-1.35-9.89,1.27-23.66.59-52.64-9.38L58.53,68.33c-4.56-1.69-9-.25-10.22,3.3l-0.08.08c-1.27,3.55.93,7.27,5.58,9l114.4,41.65h0.17L282.77,164c4.56,1.69,8.7.25,10.05-3.3l0.08-.08c1-3.55-1.44-7.44-6-9.13h0Z" transform="translate(-0.23)" fill="#fde74c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M185.86,105.42l-21.71-7.86" transform="translate(-0.23)" fill="none" stroke="#fef5b7" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
									</g>
								</g>
                </g>
              <g id="Crash-Stand">
									<path d="M118.94,238H133.3V583.56H118.94V238Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<g>
										<path d="M188,645.24a7.14,7.14,0,0,1-10.22-.08L121.39,588.8a7.17,7.17,0,1,1,10.14-10.14L187.89,635A7.14,7.14,0,0,1,188,645.24Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M181.3,642.53l-56.78-56.78" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<path d="M188.31,635.44l-10.14,10.14s5.41,9.13,6.76,10.48c4,4,10.05,3.63,14-.34s4.31-10.05.42-14C198.11,640.51,188.31,635.44,188.31,635.44Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<g>
										<path d="M64.78,645a7.14,7.14,0,0,1,.08-10.22l56.36-56.36a7.17,7.17,0,1,1,10.14,10.14L75,644.9A7.14,7.14,0,0,1,64.78,645Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M71.71,642.53l54.75-54.84" transform="translate(-0.23)" fill="none" stroke="#bcece8" stroke-miterlimit="10" stroke-width="4"/>
										<path d="M74.5,645.32L64.36,635.18s-9.13,5.41-10.48,6.76c-4,4-3.63,10.05.34,14s10.05,4.31,14,.42C69.43,655.12,74.5,645.32,74.5,645.32Z" transform="translate(-0.23)" fill="#5c5c5c" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<path d="M115.14,583.39a11.41,11.41,0,1,1,11.41,11.41A11.36,11.36,0,0,1,115.14,583.39Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									<path d="M128.57,580.6a3.39,3.39,0,1,0,.76,4.73A3.38,3.38,0,0,0,128.57,580.6Z" transform="translate(-0.23)" fill="#333"/>
									<g>
										<circle cx="139.5" cy="413.31" r="8.45" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M137.53,423.11a9.23,9.23,0,0,1-9.21,9.21H124a9.23,9.23,0,0,1-9.21-9.21V404.44a9.23,9.23,0,0,1,9.21-9.21h4.31a9.23,9.23,0,0,1,9.21,9.21v18.67Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
									</g>
									<g>
										<path d="M115,237.82a11.41,11.41,0,1,1,11.41,11.41A11.36,11.36,0,0,1,115,237.82Z" transform="translate(-0.23)" fill="#eefaf9" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"/>
										<path d="M128.4,235a3.39,3.39,0,1,0,.76,4.73A3.38,3.38,0,0,0,128.4,235Z" transform="translate(-0.23)" fill="#333"/>
									</g>
                  </g>

                
              {/* Additional SVG elements can be added here */}
            
          </svg>
        </div>
      </div>
      <footer className="demo-footer">
        <div className="container-btns">
          <button
            className="btn btn-tooltip btn-sequencer"
            id="sequencer-visible-btn"
            aria-label="Toggle sequencer"
            onClick={() => setSequencerVisible(!sequencerVisible)}
          >
            <i className="fa fa-th"></i>
          </button>
          <button
            className="btn btn-tooltip btn-keys"
            id="keys-btn"
            aria-label="Toggle keyboard legend"
            onClick={() => setIsKeyMappingOpen(!isKeyMappingOpen)}
          >
            <i className="fa fa-keyboard-o"></i>
          </button>
        </div>
      </footer>
      {isKeyMappingOpen && (
        <div className="popupKeyMapping">
          <button className="closeButton" onClick={() => setIsKeyMappingOpen(false)}>
            ✖
          </button>
          <h3>Key Mapping</h3>
          <KeyMapping soundMap={keyMappings} updateSoundMap={setKeyMappings} />
        </div>
      )}
      <audio id="Crash-Audio" ref={crashAudioRef} preload="auto">
        <source src="/crash.mp3" type="audio/mp3" />
      </audio>
      <audio id="Small-Rack-Tom-Audio" ref={smallTomAudioRef} preload="auto">
        <source src="/tom-1.mp3" type="audio/mp3" />
      </audio>
      <audio id="Big-Rack-Tom-Audio" ref={bigTomAudioRef} preload="auto">
        <source src="/tom-2.mp3" type="audio/mp3" />
      </audio>
      <audio id="Floor-Tom-Audio" ref={floorTomAudioRef} preload="auto">
        <source src="/tom-3.mp3" type="audio/mp3" />
      </audio>
      <audio id="Snare-Audio" ref={snareAudioRef} preload="auto">
        <source src="/snare.mp3" type="audio/mp3" />
      </audio>
      <audio id="Kick-Audio" ref={kickAudioRef} preload="auto">
        <source src="/kick-bass.mp3" type="audio/mp3" />
      </audio>
      <audio id="Hi-Hat-Closed-Audio" ref={hiHatClosedAudioRef} preload="auto">
        <source src="/tom-4.mp3" type="audio/mp3" />
      </audio>
    </div>
  );
};

export default SVGDrumKit;
