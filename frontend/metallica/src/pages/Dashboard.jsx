import React, { useEffect, useState, useMemo } from "react";
import styles from "../styles/Dashboard.module.css";
import BottomPlayer from "../components/BottomPlayer";
import Sidenav from "../components/sidenav";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function Dashboard() {
  const [recordings, setRecordings] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [sortOption, setSortOption] = useState("dateDesc"); // default sort
  const user=localStorage.getItem('loggedInUser');
  useEffect(() => {
    // Fetch recordings from the DB instead of local storage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User not logged in!");
      return;
    }
    fetch(`https://deploy-metallica-api.vercel.app/audio/user-audios/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch recordings");
        }
        return res.json();
      })
      .then((data) => {
        setRecordings(data);
      })
      .catch((err) => {
        console.error("Error fetching recordings:", err);
      });
  }, []);

  const discardRecording = (index) => {
    const track = recordings[index];
    // Call backend DELETE API to remove the audio file
    fetch(
      `https://deploy-metallica-api.vercel.app/audio/${track.filename}?userId=${localStorage.getItem(
        "userId"
      )}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete recording from DB");
        }
        return res.json();
      })
      .then(() => {
        // Remove the track from UI after successful deletion
        const updated = recordings.filter((_, i) => i !== index);
        setRecordings(updated);
        // Clear activeTrack if it's the one being discarded
        if (activeTrack && activeTrack.filename === track.filename) {
          setActiveTrack(null);
        }
      })
      .catch((err) => {
        console.error("Error deleting recording:", err);
      });
  };

  // Use useMemo for sorting recordings based on the sortOption
  const sortedRecordings = useMemo(() => {
    return [...recordings].sort((a, b) => {
      if (sortOption === "alphabetical") {
        const titleA = (a.title || a.filename || "Recording").toLowerCase();
        const titleB = (b.title || b.filename || "Recording").toLowerCase();
        return titleA.localeCompare(titleB);
      } else if (sortOption === "dateAsc") {
        // Oldest first using uploadDate
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      } else {
        // dateDesc: newest first using uploadDate
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });
  }, [recordings, sortOption]);

  return (
    <>
      <Sidenav />
      <div className={styles.dashboardContainer}>
        <header className={styles.headerSection}>
          <div className={styles.headerImage}>
            <img
              src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
              alt="Liked Songs"
            />
          </div>
          <div className={styles.headerText}>
            <span className={styles.playlistLabel}>Playlist</span>
            <h1 className={styles.playlistTitle}>{user}'s Songs</h1>
            <div className={styles.playlistSubtitle}>
              <span className={styles.username}>You</span>
              <span className={styles.separator}>•</span>
              <span>{recordings.length} songs</span>
            </div>
          </div>
        </header>

        <div className={styles.actionButtons}>
          <button className={styles.playButton}></button>
          <button className={styles.shuffleButton}></button>
          <button className={styles.downloadButton}></button>
          {/* MUI Sort Options with custom styling */}
          <div className={styles.sortContainer}>
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 1,
                minWidth: 150,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <InputLabel
                id="sort-select-label"
                sx={{ color: "#fff", top: -12, fontSize: 21 }}
              >
                Sort by
              </InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortOption}
                label="Sort by"
                onChange={(e) => setSortOption(e.target.value)}
                sx={{ color: "#000", backgroundColor: "#fff" }}
              >
                <MenuItem value="dateDesc">Date (Newest First)</MenuItem>
                <MenuItem value="dateAsc">Date (Oldest First)</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <section className={styles.trackList}>
          <div className={`${styles.trackRow} ${styles.headerRow}`}>
            <span className={styles.headerHash}>#</span>
            <span className={styles.headerTitle}>Title & Description</span>
            <span className={styles.headerAlbum}>Album</span>
            <span className={styles.headerDate}>Date</span>
            <span className={styles.headerAudio}>Audio</span>
          </div>
          {/* Enable scrolling on this container */}
          <div
            className={styles.trackListBody}
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {sortedRecordings.map((track, idx) => (
              <div
                key={idx}
                className={styles.trackRow}
                onClick={() =>
                  setActiveTrack({
                    ...track,
                    src: `https://deploy-metallica-api.vercel.app/audio/${track.filename}`,
                  })
                }
                style={{ cursor: "pointer" }}
              >
                <span className={styles.trackHash}>{idx + 1}</span>
                <span className={styles.trackTitle}>
                  {track?.title ||
                    (track?.filename
                      ? track.filename.replace(/\.[^/.]+$/, "")
                      : "No Track Selected")}
                  {track.description && (
                    <span className={styles.trackDescription}>
                      {track.description}
                    </span>
                  )}
                </span>
                <span className={styles.trackAlbum}>
                  {track.album || "N/A"}
                </span>
                <div className={styles.dateDiscardCell}>
                  <span className={styles.trackDate}>
                    {track.uploadDate
                      ? new Date(track.uploadDate).toLocaleDateString()
                      : "Unknown date"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      discardRecording(idx);
                    }}
                    className={styles.discardButton}
                  >
                    Discard
                  </button>
                </div>
                <div className={styles.audioColumn}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTrack({
                        ...track,
                        src: `https://deploy-metallica-api.vercel.app/audio/${track.filename}`,
                      });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#1db954",
                      fontSize: "1.2rem",
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {activeTrack && (
          <BottomPlayer
            track={activeTrack}
            onClose={() => setActiveTrack(null)}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;
