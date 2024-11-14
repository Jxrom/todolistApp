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
import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Todo = {
  id: string;
  text: string;
  completed?: boolean;
  time?: string;
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

  // For datetimepicker
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
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
    const newTodo = {
      id: Date.now().toString(),
      text: input,
      time: selectedTime,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // Save updated todos
    setInput(""); // Clear input
    setModalVisible(false);
    setSelectedTime(""); // Reset the selected time
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

  const onTimeChange = (event, time) => {
    setShowPicker(false);
    if (time) {
      const formattedTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSelectedTime(formattedTime);
      console.log(selectedTime);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.today}>Today</Text>
          <Text style={styles.currentDate}>
            {fullMonthName} {currentDate.getDate()}, {currentDate.getFullYear()}
          </Text>
        </View>
        {/* Lottie animation */}
        <LottieView
          source={require("../assets/animations/fireAnimation.json")} // Path to your Lottie JSON file
          autoPlay // Automatically play the animation
          loop // Loop the animation
          style={{
            width: 80,
            height: 80,
            position: "absolute",
            right: 5,
            top: 15,
          }}
        />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoListView}>
              <TouchableOpacity
                onPress={() => toggleCompletion(item.id)}
                onLongPress={() => handleDeleteButton(item.id)}
                style={styles.flatListButtonView}
              >
                <Text
                  style={[
                    styles.todoListText,
                    item.completed && styles.strikethrough,
                  ]}
                >
                  {item.text}
                </Text>
                {item.time && (
                  <Text style={styles.todoTimeText}>{item.time}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No tasks yet</Text>
            </View>
          }
        />
      </View>
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
            <TextInput
              style={styles.textInput}
              placeholder="Input your new task here"
              //onChangeText={(newText) => setText(newText)}
              //defaultValue={text}
              value={input}
              onChangeText={setInput}
              ref={textInputRef}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                //onPress={handleCheckButton}
                onPress={() => setShowPicker(true)}
                style={styles.buttonAlarm}
              >
                <Image
                  style={styles.buttonSettingImage}
                  source={require("./../assets/buttonImages/setHour.png")}
                />
                {showPicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCheck}
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
    backgroundColor: "#23191A",
    marginTop: 90,
  },
  today: {
    fontSize: 22,
    fontFamily: "Inter_400Regular",
    color: "white",
  },
  currentDate: {
    fontFamily: "Inter_400Regular",
    color: "white",
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
    backgroundColor: "#4B332C",
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
  buttonCheck: {},
  buttonAlarm: {},
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
    marginTop: 10,
    paddingBottom: 50, // Ensure space at the bottom for the add button
    backgroundColor: "#23191A",
    borderRadius: 10,
    padding: 10,
    marginBottom: 150,
    marginHorizontal: 10,
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
    backgroundColor: "#4B332C",
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
    backgroundColor: "#463436",
    height: 65, // Fixed height for consistency
    justifyContent: "center", // Center the text vertically
    textAlignVertical: "center", // Ensure text is vertically centered
    fontFamily: "Inter_400Regular",
    paddingLeft: 20,
    color: "white",
  },
  flatListButtonView: {
    width: "98%",
    alignItems: "flex-start",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  headerContainer: {
    backgroundColor: "#4B332C",
    borderWidth: 1,
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingHorizontal: 110,
  },
  emptyListText: {
    fontSize: 18,
    color: "gray",
    fontFamily: "Inter_400Regular",
  },
  buttonContainer: {
    padding: 10,
    position: "absolute",
    flexDirection: "row",
    top: 30,
    right: 20,
  },
  todoTimeText: {
    fontSize: 14,
    color: "lightgray",
    fontFamily: "Inter_400Regular",
    position: "absolute",
    right: 10,
    top: 5,
  },
});
