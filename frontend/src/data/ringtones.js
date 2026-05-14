export const RINGTONE_OPTIONS = [
  { label: "Cincin", value: "cincin" },
  { label: "iPhone", value: "iphone" },
  { label: "Ringtone", value: "ringtone" },
  { label: "Silent", value: "Silent" },
];

export const DEFAULT_RINGTONE = "ringtone";

export const RINGTONE_SOURCES = {
  cincin: require("../../assets/sounds/cincin.mp3"),
  iphone: require("../../assets/sounds/iphone.mp3"),
  ringtone: require("../../assets/sounds/ringtone.mp3"),
};

export const getRingtoneLabel = (value) => {
  return RINGTONE_OPTIONS.find((option) => option.value === value)?.label || "Ringtone";
};