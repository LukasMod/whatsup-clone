import { useState } from "react"
import { View, StyleSheet, TextInput, Image } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { createMessage, updateChatRoom } from "../../graphql/mutations"
import * as ImagePicker from "expo-image-picker"

const InputBox = ({ chatRoom }) => {
  const [text, setText] = useState("")
  const [image, setImage] = useState(null)

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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    })

    console.log(result)

    if (!result.cancelled) {
      setImage(result.uri)
    }
  }

  return (
    <>
      {image && (
        <View style={styles.attachmentsContainer}>
          <Image
            source={{ uri: image }}
            style={styles.selectedImage}
            resizeMode="contain"
          />
          <MaterialIcons
            name="highlight-remove"
            onPress={() => setImage(null)}
            size={20}
            color="gray"
            style={styles.removeSelectedImage}
          />
        </View>
      )}
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        {/* Icon */}
        <AntDesign
          name="plus"
          size={20}
          color="royalblue"
          onPress={pickImage}
        />

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
    </>
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
  attachmentsContainer: {
    alignItems: "flex-end",
  },
  selectedImage: {
    height: 100,
    width: 200,
    margin: 5,
  },
  removeSelectedImage: {
    position: "absolute",
    right: 10,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
})

export default InputBox

