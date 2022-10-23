import { useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { createMessage } from "../../graphql/mutations"

const InputBox = ({ chatroomID }) => {
  const [text, setText] = useState("")

  const onSend = async () => {
    console.warn("Sending a new message: ", text)

    const authUser = await Auth.currentAuthenticatedUser()

    const newMessage = {
      chatroomID,
      text,
      userID: authUser.attributes.sub,
    }

    await API.graphql(
      graphqlOperation(createMessage, {
        input: newMessage,
      })
    )

    setText("")
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Icon */}
      <AntDesign name="plus" size={20} color="royalblue" />

      {/* Text Input */}
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.input}
        placeholder="Type your message..."
      />

      {/* Icon */}
      <MaterialIcons
        onPress={onSend}
        style={styles.send}
        name="send"
        size={16}
        color="white"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "whitesmoke",
    padding: 5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    padding: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,

    borderRadius: 50,
    borderColor: "lightgray",
    borderWidth: StyleSheet.hairlineWidth,
  },
  send: {
    backgroundColor: "royalblue",
    padding: 7,
    borderRadius: 15,
    overflow: "hidden",
  },
})

export default InputBox

