import { useEffect, useState } from "react";
import { Text } from "react-native";
import { powersync } from "@/powersync/system";

export const PowerSyncStatus = () => {
  const [connected, setConnected] = useState(powersync.connected);
  const [hasSynced, setHasSynced] = useState(
    powersync.currentStatus?.hasSynced || false
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(
    powersync.currentStatus.lastSyncedAt || "Unknown"
  );

  useEffect(() => {
    console.log(powersync.currentStatus);
    return powersync.registerListener({
      statusChanged: (status) => {
        setConnected(status.connected);
      },
    });
  }, [powersync]);

  useEffect(() => {
    // Register listener for changes made to the powersync status
    return powersync.registerListener({
      statusChanged: (status) => {
        setHasSynced(!!status.hasSynced);
      },
    });
  }, [powersync]);

  useEffect(() => {
    return powersync.registerListener({
      statusChanged(status) {
        if (status.lastSyncedAt)
          setLastSyncedAt(status.lastSyncedAt?.toString());
      },
    });
  });

  return (
    <>
      <Text>PowerSync Status: {connected ? "Yes" : "No"}</Text>
      <Text>
        PowerSync Sync Status: {hasSynced ? "Sync complete" : "No Sync Yet"}
      </Text>
      <Text>Last Sync: {lastSyncedAt.toString()}</Text>
    </>
  );
};
