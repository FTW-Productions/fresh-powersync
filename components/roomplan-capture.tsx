import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoomPlanView, useRoomPlanView, ExportType } from "expo-roomplan";
import { File } from "expo-file-system";
import { transformRoomPlanData, SimplifiedRoomData } from "@/lib/roomplan-transform";

interface RoomPlanCaptureProps {
  roomId?: string;
  onScanComplete?: (roomId: string | undefined, roomData: SimplifiedRoomData) => void;
  onScanError?: (error: Error) => void;
}

export function RoomPlanCapture({ roomId, onScanComplete, onScanError }: RoomPlanCaptureProps) {
  const [overlay, setOverlay] = useState(false);
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  const { viewProps, controls } = useRoomPlanView({
    scanName: "RoomScan",
    exportType: ExportType.Parametric,
    exportOnFinish: true,
    sendFileLoc: true,
    autoCloseOnTerminalStatus: false,
    onStatus: (e) => {
      console.log("RoomPlan status:", JSON.stringify(e.nativeEvent, null, 2));
    },
    onPreview: () => console.log("RoomPlan preview displayed"),
    onExported: async (event) => {
      const { jsonUrl } = event.nativeEvent;
      if (jsonUrl) {
        try {
          const file = new File(jsonUrl);
          const jsonContent = await file.text();
          const rawData = JSON.parse(jsonContent);
          console.log("Raw room scan data:", JSON.stringify(rawData, null, 2));

          const transformedData = transformRoomPlanData(rawData);
          console.log("Transformed room data:", JSON.stringify(transformedData, null, 2));

          onScanComplete?.(roomId, transformedData);
        } catch (error) {
          console.error("Failed to read room scan JSON:", error);
          onScanError?.(error instanceof Error ? error : new Error(String(error)));
        }
      }
      setOverlay(false);
      controls.reset();
    },
  });

  // Cleanup: cancel scan if component unmounts while scanning
  // Using ref to avoid unstable dependency on controls object
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        controls.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenScanner = () => {
    controls.reset();
    setOverlay(true);
    controls.start();
  };

  const handleCancel = () => {
    controls.cancel();
    setOverlay(false);
    controls.reset();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable onPress={handleOpenScanner}>
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
            <Pressable onPress={handleCancel}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={controls.finishScan}>
              <Text>Finish</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}