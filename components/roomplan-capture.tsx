import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoomPlanView, useRoomPlanView, ExportType } from "expo-roomplan";

export function RoomPlanCapture() {
  const [overlay, setOverlay] = useState(false);
  const { viewProps, controls, state } = useRoomPlanView({
    scanName: "HookRoom",
    exportType: ExportType.Parametric,
    exportOnFinish: true,
    sendFileLoc: true,
    autoCloseOnTerminalStatus: true,
    onStatus: (e) => console.log("status", e.nativeEvent),
    onPreview: () => console.log("preview"),
    onExported:  async (event) => {
    const { jsonUrl } = event.nativeEvent;
      // Read and process the JSON
      console.log(jsonUrl)
    },
  });

  useEffect(() => {
    if (overlay && !state.isRunning) setOverlay(false);
  }, [overlay, state.isRunning]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable
        onPress={() => {
          setOverlay(true);
          controls.start();
        }}
      >
        <Text>Open Scanner</Text>
      </Pressable>
      {overlay && (
        <View style={StyleSheet.absoluteFill}>
          <RoomPlanView style={StyleSheet.absoluteFill} {...viewProps} />
          <SafeAreaView
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={() => {
                controls.cancel();
                setOverlay(false);
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={controls.finishScan}>
              <Text>Finish</Text>
            </Pressable>
            <Pressable onPress={controls.addRoom}>
              <Text>Add Room</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}