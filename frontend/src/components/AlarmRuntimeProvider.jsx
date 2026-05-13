import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { activeAlarmIdAtom, alarmsAtom, wakeSessionAtom } from "../atoms/alarmAtoms";
import { initializeApp } from "../services/runtime/initApp";
import { handleUrl } from "../services/runtime/handleDeepLink";

export const AlarmRuntimeProvider = ({ children }) => {
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);
  const setWakeSession = useSetAtom(wakeSessionAtom);

  const stateRef = useRef({ alarms, setActiveAlarmId, setWakeSession });

  useEffect(() => {
    stateRef.current = { alarms, setActiveAlarmId, setWakeSession };
  }, [alarms, setActiveAlarmId, setWakeSession]);

  useEffect(() => {
    initializeApp({ setAlarms, state: stateRef.current });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url, stateRef.current);
    });

    return () => subscription.remove();
  }, [setAlarms, setActiveAlarmId, setWakeSession]);

  return children;
};
