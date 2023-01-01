import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Fontisto, FontAwesome5 } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const CATEGORY_KEY = "@category";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  //hashmap으로 하기 위해 array를 사용안함.
  useEffect(() => {
    loadToDos();
    getCategory();
  }, []);

  const changeCategory = () => {
    setWorking((prev) => !prev);
    saveCategory();
  };

  const onChangeText = (payload) => {
    setText(payload);
  };

  const saveToDos = async (toSave) => {
    //AsyncStorage.setItem(key,value)가 들어간다.
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (e) {
      alert("SAVING ERROR - Please ReLoading");
    }
  };

  const saveCategory = async () => {
    await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(working));
  };

  const getCategory = async () => {
    const prevCategory = await AsyncStorage.getItem(CATEGORY_KEY);
    setWorking(JSON.parse(prevCategory));
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    //save todo
    //등록시키기
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isComplete: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To_DO", "Are you sure?", [
      {
        text: "Cancel",
      },
      {
        text: "I'm Sure",
        //오직IOS에서만 가능한 Style방식이다. -> destructive I'm Sure의 색깔을 빨갛게 변경한다.
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          //여기에서 Object를 만들고
          delete newToDos[key];
          //해당하는 Object의 key를 newToDos에 들어가서 삭제하고
          setToDos(newToDos);
          //다시 state를 업데이트하고 이후 newToDos를 해줘서
          await saveToDos(newToDos);
          //저장한다.
        },
      },
    ]);
    return;
  };

  const toDoComplete = (key) => {
    let newToDos = { ...toDos };
    newToDos[key].isComplete = !newToDos[key].isComplete;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editToDo = (key) => {
    if (Platform.OS === "web") {
      const val = prompt("How Do you want Change This Text?");
      let newToDos = { ...toDos };
      newToDos[key].text = val;
      setToDos(newToDos);
      saveToDos(newToDos);
    } else {
      Alert.prompt(
        "Change ToDo",
        "How Do you want Change This Text?",
        (val) => {
          let newToDos = { ...toDos };
          newToDos[key].text = val;
          setToDos(newToDos);
          saveToDos(newToDos);
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar style="auto" /> */}
      <View style={styles.header}>
        <TouchableOpacity onPress={changeCategory}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : "#3A3D40" }}
          >
            JAVASCRIPT
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={changeCategory}>
          <Text
            style={{ ...styles.btnText, color: !working ? "white" : "#3A3D40" }}
          >
            REACT
          </Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        onSubmitEditing={addTodo}
        value={text}
        autoCapitalize={"sentences"}
        onChangeText={onChangeText}
        returnKeyType="done"
        style={styles.input}
        placeholder={working ? "Add ToDo_JS" : "Add ToDo_React"}
      />
      
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            
            <View key={key} style={styles.toDo}>
              <Text
                style={
                  toDos[key].isComplete
                    ? {
                        ...styles.toDoText,
                        textDecorationLine: "line-through",
                        textDecorationStyle: "double",
                        textDecorationColor: "red",
                      }
                    : styles.toDoText
                }
              >
                {toDos[key].text}
              </Text>
              <View style={styles.btnWrap}>
                <TouchableOpacity onPress={() => editToDo(key)}>
                  <FontAwesome5
                    name="edit"
                    size={20}
                    color="#616161"
                    style={{ marginLeft: 20 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toDoComplete(key);
                  }}
                >
                  <Fontisto
                    name={
                      toDos[key].isComplete
                        ? "checkbox-active"
                        : "checkbox-passive"
                    }
                    size={20}
                    color="#616161"
                    style={{ marginLeft: 20 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteToDo(key);
                  }}
                >
                  <Fontisto
                    name="trash"
                    size={20}
                    color="#616161"
                    style={{ marginLeft: 20 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  btnText: {
    fontSize: 30,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: "#1a1a1a",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  btnWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
});
