import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let player = null;
let isStarting = false;
let soundAvailable = true;

/**
 * Initializes global audio settings once during app startup.
 * Ensures alarms can override hardware mute and play in background.
 */
export const initializeAudio = async () => {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: "doNotMix",
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
  } catch (error) {
    console.error("Audio: Failed to initialize global settings:", error);
  }
};

export const startAlarmSound = async () => {
  try {
    if (player || isStarting) return;
    if (!soundAvailable) return;
    isStarting = true;

    let source;
    try {
      source = require("../../assets/sounds/alarm_neon.mp3");
    } catch (_error) {
      soundAvailable = false;
      return;
    }

    player = createAudioPlayer(source);
    player.loop = true;
    player.volume = 1.0;
    player.play();
  } catch (error) {
    console.error("Failed to start alarm sound:", error);
  } finally {
    isStarting = false;
  }
};

export const stopAlarmSound = async () => {
  try {
    if (player) {
      player.pause();
      await player.seekTo(0);
      player.remove();
      player = null;
    }
  } catch (error) {
    console.error("Failed to stop alarm sound:", error);
  }
};
