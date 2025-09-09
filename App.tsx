import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  CameraView,
  CameraCapturedPicture,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | null
  >(null);

  const [image, setImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back"); // ✅ ใช้ string
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState<boolean>(false);
  const cameraRef = useRef<React.ComponentRef<typeof CameraView>>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermissions();
  }, []);

  if (!cameraPermission || hasMediaLibraryPermission === null) {
    return (
      <View style={styles.centerScreen}>
        <Text style={{ color: "#000" }}>กำลังขอสิทธิ์การใช้งาน...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || hasMediaLibraryPermission === false) {
    return (
      <View style={styles.centerScreen}>
        <Text style={{ color: "#000", marginBottom: 20 }}>
          กรุณาอนุญาตให้แอปเข้าถึงกล้องและคลังรูปภาพ
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
          <Text style={{ color: "#fff" }}>อนุญาต</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 📸 ถ่ายรูป
  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        const options = {
          quality: 1,
          base64: false,
          exif: false,
          flashMode: flash,
        };
        const newPhoto: CameraCapturedPicture =
          await cameraRef.current.takePictureAsync(options);
        setImage(newPhoto.uri);
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  };

  // 🔄 ถ่ายใหม่
  const retakePicture = () => {
    setImage(null);
  };

  // 💾 บันทึก
  const savePicture = async () => {
    if (image) {
      try {
        if (Platform.OS === "android") {
          alert(
            "Expo Go บน Android ยังไม่สามารถบันทึกรูปได้ ❌\nกรุณาสร้าง Development Build"
          );
          return;
        }
        await MediaLibrary.saveToLibraryAsync(image);
        alert("บันทึกรูปภาพเรียบร้อยแล้ว");
      } catch (error) {
        console.log("Error saving picture:", error);
      }
    }
  };

  // 🔃 สลับกล้อง
  const toggleCamera = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  // 💡 สลับแฟลช
  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  // 🔦 เปิด/ปิดไฟฉาย
  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  // 👉 ยังไม่ได้ถ่าย → แสดงกล้อง
  if (!image) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flash}
          enableTorch={torch}
        />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
            <Ionicons
              name={flash === "off" ? "flash-off" : "flash"}
              size={32}
              color={flash === "off" ? "#fff" : "#ffd700"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Feather name="camera" size={36} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
            <MaterialIcons name="flip-camera-ios" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTorch}>
            <Ionicons
              name={torch ? "flashlight" : "flashlight-outline"}
              size={32}
              color={torch ? "#ffd700" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 👉 ถ่ายแล้ว → แสดง preview
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.previewImage} />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.iconButton} onPress={retakePicture}>
          <Ionicons name="refresh" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={savePicture}>
          <Ionicons name="download" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  camera: { flex: 1, width: "100%" },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  permissionButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 14 },
  previewImage: { flex: 1, width: "100%", resizeMode: "contain" },
});
