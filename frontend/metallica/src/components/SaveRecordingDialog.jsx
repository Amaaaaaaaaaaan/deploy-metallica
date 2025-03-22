import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SaveRecordingDialog.module.css";

const SaveRecordingDialog = ({ recordingUrl, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Show toast only once on mount
  // useEffect(() => {
  //   toast.info("Recording started");
  // }, []);

  // Fetch the audio blob from the recording URL
  const fetchAudioBlob = async (url) => {
    const response = await fetch(url);
    return await response.blob();
  };

  const handleSave = async () => {
    if (!recordingUrl) {
      toast.error("No recording available!");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not logged in!");
      return;
    }

    setUploading(true);

    try {
      // Fetch the blob and convert it into a File object with a custom filename.
      const audioBlob = await fetchAudioBlob(recordingUrl);
      const fileName = `${Date.now()}-recording.webm`; // adjust extension if needed
      const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });

      // Debug log: Check that the file name is set correctly.
      console.log("Audio File Name:", audioFile.name);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("title", title.trim() || "Untitled Recording");
      formData.append("description", description.trim());
      formData.append("userId", userId);

      // Update the URL below to match your backend route.
      const response = await fetch("https://deploy-metallica-api.vercel.app/audio/upload-audio", {
        method: "POST",
        body: formData,
      });

      // Try to parse JSON, or throw an error if not JSON.
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error("Server did not return JSON: " + text);
      }

      if (response.ok) {
        toast.success("Audio saved successfully!");
      } else {
        toast.error(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to save recording!");
    } finally {
      setUploading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Save Your Recording</h2>
        <audio controls src={recordingUrl} className={styles.audioPreview} />
        <div className={styles.inputGroup}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
          />
        </div>
        <div className={styles.buttonRow}>
          <button onClick={handleSave} className={styles.saveButton} disabled={uploading}>
            {uploading ? "Saving..." : "Save Recording"}
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>,
    document.body
  );
};

export default SaveRecordingDialog;
