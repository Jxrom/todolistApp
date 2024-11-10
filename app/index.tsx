import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// initial to dos
const initialTodos = [
  {
    title: "Do some laundry",
    date: "November 8, 2024",
    id: "1",
  },
  {
    title: "Do homework",
    date: "November 10, 2024",
    id: "2",
  },
  {
    title: "Do some cooking",
    date: "November 11, 2024",
    id: "3",
  },
];

export default function Index() {
  const currentDate = new Date();
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState(initialTodos); // State for storing todos
  const textInputRef = useRef<TextInput>(null);
  const fullMonthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
  });

  type ItemProps = { title: string };

  const [loaded, error] = useFonts({
    Inter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Button Function
  const handleAddButton = () => {
    //console.log("Add Button is Pressed!");
    setModalVisible(true);
  };

  const handleCheckButton = () => {
    const newTodo = {
      title: text,
      date: `${fullMonthName} ${currentDate.getDate()}, ${currentDate.getFullYear()}`,
      id: `${Date.now()}-${Math.random()}`, // Generates a unique ID
    };

    setTodos([...todos, newTodo]); // Update state with new todo
    setText(""); // Clear the input
    setModalVisible(false); // Close modal
  };

  // Remove Todo by Title
  const handleDeleteButton = (title: string) => {
    const updatedTodos = todos.filter((todo) => todo.title !== title);
    setTodos(updatedTodos); // Update the state with the filtered todos
    console.log(updatedTodos);
  };

  const Item = ({ title }: ItemProps) => (
    <View style={styles.item}>
      <TouchableOpacity onLongPress={() => handleDeleteButton(title)}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.today}>Today</Text>
      <Text style={styles.currentDate}>
        {fullMonthName} {currentDate.getDate()}, {currentDate.getFullYear()}
      </Text>

      <View style={styles.listContainer}>
        <FlatList
          data={todos}
          renderItem={({ item }) => <Item title={item.title} />}
          keyExtractor={(item) => item.id}
        />
      </View>

      <TouchableOpacity style={styles.buttonSettingPosition}>
        <Image
          source={require("./../assets/buttonImages/settingButton.png")}
          style={styles.buttonSettingImage}
        />
      </TouchableOpacity>
      <View style={styles.horizontalLine}></View>
      <TouchableOpacity
        style={styles.addButtonPosition}
        onPress={handleAddButton}
      >
        <Image
          source={require("./../assets/buttonImages/addButton.png")}
          style={styles.addButtonImage}
        />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal has been Closed");
          setModalVisible(!modalVisible);
        }}
        onShow={() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View></View>
            <TextInput
              style={styles.textInput}
              placeholder="Input your new task here"
              onChangeText={(newText) => setText(newText)}
              defaultValue={text}
              ref={textInputRef}
            />
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={handleCheckButton}
            >
              <Image
                source={require("./../assets/buttonImages/checkButton.png")}
                style={styles.buttonSettingImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  today: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 24,
    fontFamily: "Inter_400Regular",
  },
  currentDate: {
    position: "absolute",
    top: 50,
    left: 15,
    fontFamily: "Inter_400Regular",
  },
  buttonSettingImage: {
    width: 40,
    height: 40,
  },
  buttonSettingPosition: {
    position: "absolute",
    top: 20,
    right: 10,
  },
  horizontalLine: {
    position: "absolute",
    top: 80,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    width: "95%",
    marginVertical: 10,
  },
  addButtonImage: {
    width: 70,
    height: 70,
  },
  addButtonPosition: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#95D2CD",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "white",
    position: "absolute",
    top: 40,
    right: 30,
  },
  textInput: {
    height: 60,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    padding: 10,
    fontFamily: "Inter_400Regular",
  },
  item: {
    backgroundColor: "#95D2CD",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 80,
  },
  title: {
    fontSize: 16,
  },
  listContainer: {
    marginTop: 100,
  },
});
