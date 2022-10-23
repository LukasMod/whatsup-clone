import { useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { createMessage, updateChatRoom } from "../../graphql/mutations"

const InputBox = ({ chatRoom }) => {
  const [text, setText] = useState("")

  const onSend = async () => {
    const authUser = await Auth.currentAuthenticatedUser()

    const newMessage = {
      chatroomID: chatRoom.id,
      text,
      userID: authUser.attributes.sub,
    }

    const newMessageData = await API.graphql(
      graphqlOperation(createMessage, {
        input: newMessage,
      })
    )

    setText("")

    // set the new message as the lastMessage of the chatRoom

    await API.graphql(
      graphqlOperation(updateChatRoom, {
        input: {
          _version: chatRoom._version,
          chatRoomLastMessageId: newMessageData.data.createMessage.id,
          id: chatRoom.id,
        },
      })
    )
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

