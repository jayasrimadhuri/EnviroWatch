import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../../config";
import { LinearGradient } from "expo-linear-gradient";

const Posts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [district, setDistrict] = useState("");

  // Mock data for the dropdowns
  const districts = [
    { label: "Select District", value: "" },
    { label: "ADILABAD", value: "ADILABAD" },
    { label: "BHADRADRI KOTHAGUDEM", value: "BHADRADRI_KOTHAGUDEM" },
    { label: "HANUMAKONDA", value: "HANUMAKONDA" },
    { label: "HYDERABAD", value: "HYDERABAD" },
    { label: "JAGTIAL", value: "JAGTIAL" },
    { label: "JANGOAN", value: "JANGOAN" },
    { label: "JAYASHANKAR BHOOPALPALLY", value: "JAYASHANKAR_BHOOPALPALLY" },
    { label: "JOGULAMBA GADWAL", value: "JOGULAMBA GADWAL" },
    { label: "KAMAREDDY", value: "KAMAREDDY" },
    { label: "KARIMNAGAR", value: "KARIMNAGAR" },
    { label: "KHAMMAM", value: "KHAMMAM" },
    { label: "KOMARAM BHEEM ASIFABAD", value: "KOMARAM_BHEEM_ASIFABAD" },
    { label: "MAHABUBABAD", value: "MAHABUBABAD" },
    { label: "MAHABUBNAGAR", value: "MAHABUBNAGAR" },
    { label: "MANCHERIAL", value: "MANCHERIAL" },
    { label: "MEDAK", value: "MEDAK" },
    { label: "MEDCHAL-MALKAJGIRI", value: "MEDCHAL-MALKAJGIRI" },
    { label: "MULUG", value: "MULUG" },
    { label: "NAGARKURNOOL", value: "NAGARKURNOOL" },
    { label: "NALGONDA", value: "NALGONDA" },
    { label: "NARAYANPET", value: "NARAYANPET" },
    { label: "NIRMAL", value: "NIRMAL" },
    { label: "NIZAMABAD", value: "NIZAMABAD" },
    { label: "PEDDAPALLI", value: "PEDDAPALLI" },
    { label: "RAJANNA SIRCILLA", value: "RAJANNA_SIRCILLA" },
    { label: "RANGAREDDY", value: "RANGAREDDY" },
    { label: "SANGAREDDY", value: "SANGAREDDY" },
    { label: "SIDDIPET", value: "SIDDIPET" },
    { label: "SURYAPET", value: "SURYAPET" },
    { label: "VIKARABAD", value: "VIKARABAD" },
    { label: "WANAPARTHY", value: "WANAPARTHY" },
    { label: "WARANGAL", value: "WARANGAL" },
    { label: "YADADRI BHUVANAGIRI", value: "YADADRI_BHUVANAGIRI" },

  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const captureImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadMedia = async () => {
    if (!title || !description || !location || !image || !district) {
      Alert.alert("Missing fields", "Please fill all the fields");
      return;
    }

    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf("/") + 1);
      const ref = firebase.storage().ref().child(filename);
      await ref.put(blob);

      const downloadURL = await ref.getDownloadURL();

      const response = await axios.post(
        "https://ngo-mauve-mu.vercel.app/api/data",
        {
          title,
          description,
          location,
          image: downloadURL,
          district,
        }
      );
      if (response.status === 201) {
        Alert.alert("Success", "Data saved successfully");
        setTitle("");
        setDescription("");
        setLocation("");
        setImage(null);
        setDistrict("");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDistrictChange = (selectedDistrict) => {
    setDistrict(selectedDistrict);
  };

  const isFormComplete = title && description && location && image && district;

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient
        colors={["#fff1e6", "#fff1e6", "#fff1e6"]}
        style={styles.gradient}
      >
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#ffffff"
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#ffffff"
        />
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder="Street/Colony"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#ffffff"
          />
        </View>
        <Picker
          selectedValue={district}
          style={styles.picker}
          onValueChange={handleDistrictChange}
        >
          {districts.map((district) => (
            <Picker.Item
              key={district.value}
              label={district.label}
              value={district.value}
            />
          ))}
        </Picker>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick an Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton} onPress={captureImage}>
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!isFormComplete || uploading) && styles.buttonDisabled,
          ]}
          onPress={uploadMedia}
          disabled={!isFormComplete || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Enter</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff1e6", 
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    height:"100%",
    justifyContent: "center",
    backgroundColor:"#fff1e6",
  },
  input: {
    height: 50,
    borderColor: "transparent",
    backgroundColor: "#b07d62",
    borderWidth: 1,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    color: "#ffffff",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width:360,
  },
  locationInput: {
    flex: 1,
    marginRight: 10,
  },
  locationButton: {
    padding: 10,
    backgroundColor: "#b07d62",
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#b07d62",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  uploadButton: {
    marginTop: 20,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#b07d62",
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: "gray",
  },
  picker: {
    height: 50,
    backgroundColor: "#b07d62",
    color: "#ffffff",
    marginBottom: 16,
    borderRadius: 10,
  },
});

export default Posts;
