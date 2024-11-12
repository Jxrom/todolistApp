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
import LottieView from "lottie-react-native";

type Todo = {
  id: string;
  text: string;
  completed?: boolean;
};

export default function Index() {
  const currentDate = new Date();
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const textInputRef = useRef<TextInput>(null);
  const fullMonthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
  });
  const [deleteButtonModalVisible, setDeleteButtonModalVisible] =
    useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(""); // For the selected todo ID
  const [completedTodos, setCompletedTodos] = useState<string[]>([]); // Track completed todos by id

  // Experimental
  const [todosExp, setTodosExp] = useState([]);
  const [input, setInput] = useState("");

  const [loaded, error] = useFonts({
    Inter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      loadTodos();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Experimental
  // Function to load todos from AsyncStorage
  const loadTodos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@todos");
      if (jsonValue != null) {
        setTodos(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  // Function to save todos to AsyncStorage
  const saveTodos = async (newTodos: Todo[]) => {
    try {
      const jsonValue = JSON.stringify(newTodos);
      await AsyncStorage.setItem("@todos", jsonValue);
    } catch (error) {
      console.error("Failed to save todos:", error);
    }
  };

  // Add a new todo
  const addTodo = () => {
    if (input.trim() === "") return;
    const newTodo = { id: Date.now().toString(), text: input };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // Save updated todos
    setInput(""); // Clear input
    setModalVisible(false);
  };

  // Remove a todo
  const removeTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // Save updated todos
  };

  // Button Function
  const handleAddButton = () => {
    //console.log("Add Button is Pressed!");
    setModalVisible(true);
  };

  // Update handleDeleteButton to set the selected ID for deletion
  const handleDeleteButton = (id: string) => {
    setSelectedTodoId(id); // Store the selected ID
    setDeleteButtonModalVisible(true);
  };

  // Modify confirmDelete to use the selected ID
  const confirmDelete = () => {
    const updatedTodos = todos.filter((todo) => todo.id !== selectedTodoId);
    setTodos(updatedTodos); // Update the state
    saveTodos(updatedTodos); // Save updated todos
    setDeleteButtonModalVisible(false);
  };

  // Toggle the completed status of a todo
  const toggleCompletion = (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // Save updated todos
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.today}>Whats cookin' today?</Text>
      {/* Lottie animation */}
      <LottieView
        source={require("../assets/animations/fireAnimation.json")} // Path to your Lottie JSON file
        autoPlay // Automatically play the animation
        loop // Loop the animation
        style={{
          width: 80,
          height: 80,
          position: "absolute",
          top: 5,
          right: 10,
        }}
      />
      <Text style={styles.currentDate}>
        {fullMonthName} {currentDate.getDate()}, {currentDate.getFullYear()}
      </Text>

      <View style={styles.listContainer}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoListView}>
              <TouchableOpacity
                onPress={() => toggleCompletion(item.id)} // Toggle completion on press
                onLongPress={() => handleDeleteButton(item.id)}
                style={styles.flatListButtonView}
              >
                <Text
                  style={[
                    styles.todoListText,
                    item.completed && styles.strikethrough, // Apply strikethrough if completed
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
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
              //onChangeText={(newText) => setText(newText)}
              //defaultValue={text}
              value={input}
              onChangeText={setInput}
              ref={textInputRef}
            />
            <TouchableOpacity
              style={styles.buttonClose}
              //onPress={handleCheckButton}
              onPress={addTodo}
            >
              <Image
                source={require("./../assets/buttonImages/checkButton.png")}
                style={styles.buttonSettingImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for delete button*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteButtonModalVisible}
        onRequestClose={() => {
          setDeleteButtonModalVisible(!deleteButtonModalVisible);
        }}
      >
        <View style={styles.deleteButtonCenteredView}>
          <View style={styles.deleteButtonModalView}>
            <Text style={styles.deleteButtonModalText}>Delete Task?</Text>
            <View style={styles.confirmationDeleteView}>
              <Pressable
                style={[styles.deleteButton, styles.deleteButtonClose]}
                onPress={() =>
                  setDeleteButtonModalVisible(!deleteButtonModalVisible)
                }
              >
                <Text style={styles.deleteButtonTextStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, styles.deleteButtonClose]}
                onPress={confirmDelete} // Calls confirmDelete without arguments
              >
                <Text style={styles.deleteButtonTextStyle}>Delete</Text>
              </Pressable>
            </View>
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
    marginTop: 30,
  },
  today: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 22,
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
    backgroundColor: "#ccaa66",
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
    paddingBottom: 90, // Ensure space at the bottom for the add button
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  // Delete Button Modal
  deleteButtonCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonModalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
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
  },
  deleteButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  deleteButtonClose: {
    backgroundColor: "#2196F3",
  },
  deleteButtonTextStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  deleteButtonModalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  confirmationDeleteView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  todoListView: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the left
    margin: 5,
  },
  todoListText: {
    padding: 10,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "#ccaa66",
    height: 65, // Fixed height for consistency
    justifyContent: "center", // Center the text vertically
    textAlignVertical: "center", // Ensure text is vertically centered
    fontFamily: "Inter_400Regular",
    paddingLeft: 20,
  },
  flatListButtonView: {
    width: "98%",
    alignItems: "flex-start",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});
