import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const ringtoneSources = {
  'Bright Morning': require('../../../../assets/sounds/ringtone.mp3'),
  'Soft Chime': require('../../../../assets/sounds/cincin.mp3'),
  'Classic Ring': require('../../../../assets/sounds/iphone.mp3'),
};

let player;
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  });
  audioModeReady = true;
}

function getPlayer() {
  if (!player) {
    player = createAudioPlayer(null, {
      keepAudioSessionActive: false,
      updateInterval: 250,
    });
  }

  return player;
}

export async function playRingtonePreview(label) {
  const source = ringtoneSources[label] ?? ringtoneSources['Bright Morning'];
  await ensureAudioMode();

  const audioPlayer = getPlayer();
  audioPlayer.pause();
  audioPlayer.replace(source);
  audioPlayer.loop = false;
  audioPlayer.volume = 1;
  audioPlayer.play();
}

export async function stopRingtonePreview() {
  if (!player) {
    return;
  }

  try {
    player.pause();
    await player.seekTo(0);
  } catch {
    // Preview stopping should never block alarm editing.
  }
}
