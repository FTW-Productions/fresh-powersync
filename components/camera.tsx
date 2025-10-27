import React, { useState, useEffect } from "react";
import { Button, Image, View, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Define the shape of the props
interface CameraComponentProps {
  passLocalImageToParent: (data: string) => void;
}

export function PhotoSelector({
  passLocalImageToParent,
}: CameraComponentProps) {
  const [image, setImage] = useState("");
  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [pickerStatus, requestLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const selectPhoto = async () => {
    if (pickerStatus && pickerStatus.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
      });

      if (!result.canceled) {
        // Set for local component display
        setImage(result.assets[0].uri);

        // Pass it up to parent component for saving later
        passLocalImageToParent(result.assets[0].uri);
      }
    } else {
      requestLibraryPermission();
      console.error("Image Picker Permissions not granted");
    }
  };
  const takePhoto = async () => {
    if (cameraStatus && cameraStatus.granted) {
      console.log(cameraStatus);
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        cameraType: ImagePicker.CameraType.back,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Set for local component display
        setImage(result.assets[0].uri);

        // Pass it up to parent component for saving later
        passLocalImageToParent(result.assets[0].uri);
      }
    } else {
      requestCameraPermission();
      console.error("Camera Permissions not granted.");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Take a Photo" onPress={takePhoto} />
      <Button title="Select a Photo" onPress={selectPhoto} />
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
    </View>
  );
}
