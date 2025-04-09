import React, { useState, useEffect } from "react";
// If you have a custom Button component, import it here:
import Button from "../components/Button"; 

/**
 * Props:
 *  - selectedStyles (string): The music styles or prompt to generate from
 *  - onAudioGenerated (function): Callback to pass the generated audio URL back to the parent
 */
function MusicGenerator({ selectedStyles, onAudioGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    setPrompt(selectedStyles);
  }, [selectedStyles]);

  const generateMusic = async () => {
    if (!prompt) {
      alert("Please enter a music description.");
      return;
    }

    // Check if user typed 'piano'
    if (prompt.toLowerCase().includes("piano")) {
      // Serve a custom local audio file, skipping the API call
      const localAudioPath = "../../src/assets/audio/lala_land_theme.mp3"; // Adjust path/name
      setAudioUrl(localAudioPath);
      if (onAudioGenerated) {
        onAudioGenerated(localAudioPath);
      }
      return; // Exit early
    }

    // Otherwise, call the Hugging Face MusicGen API
    setLoading(true);
    setAudioUrl(null);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/musicgen-small",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate music");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      if (onAudioGenerated) {
        onAudioGenerated(url);
      }
    } catch (error) {
      console.error("Error generating music:", error);
      alert("Failed to generate music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>METALLICA AI MUSIC GENERATOR</h1>
      <h3 style={styles.subtitle}>
        No musical experience? No problem! We&apos;ve got everything you need to create amazing tunes!
      </h3>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter music description"
        style={styles.input}
      />

      <div style={styles.buttonContainer}>
        <Button onClick={generateMusic} style={styles.generateButton}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {loading && <div style={styles.loading}>Generating music, please wait...</div>}

      {audioUrl && (
        <p style={{ color: "#285584f2", marginTop: "10px" }}>
          Audio generated! Your custom player will handle playback.
        </p>
      )}
    </div>
  );
}

export default MusicGenerator;

/** Inline styles (optional). Adjust as you wish or replace with CSS modules. */
const styles = {
  container: {
    boxSizing: "border-box",
    width: "90%",              // Adjusted to 90%
    maxWidth: "600px",         // Prevent it from getting too large
    margin: "0 auto",          // Center horizontally
    padding: "20px",
    backgroundColor: "#121212",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 91, 91, 0.6)",
    marginTop: "0px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5em",
    color: "#285584f2", // changed teal color
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2em",
    color: "#285584f2", // changed teal color
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    width: "90%",
    borderRadius: "8px",
    border: "2px solid #285584f2", // changed teal color
    backgroundColor: "#222",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
  },
  generateButton: {
    width: "100%",
    maxWidth: "300px",
  },
  loading: {
    marginTop: "10px",
    color: "#285584f2", // changed teal color
    fontWeight: "bold",
  },
};
