import { useState } from "react"
import { View, StyleSheet, TextInput, Image, FlatList } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { API, Auth, graphqlOperation, Storage } from "aws-amplify"
import {
  createAttachment,
  createMessage,
  updateChatRoom,
} from "../../graphql/mutations"
import * as ImagePicker from "expo-image-picker"

import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"

const InputBox = ({ chatRoom }) => {
  const [text, setText] = useState("")
  const [files, setFiles] = useState([])

  const onSend = async () => {
    if (text || files.length) {
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

      // create attachments
      await Promise.all(
        files.map((img) =>
          addAttachment(img, newMessageData.data.createMessage.id)
        )
      )

      setFiles([])

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
  }

  const addAttachment = async (file, messageID) => {
    const newAttachment = {
      storageKey: await uploadFile(file.uri),
      type: "IMAGE", // TODO: videos
      width: file.width,
      height: file.height,
      duration: file.duration,
      messageID,
      chatroomID: chatRoom.id,
    }


    return API.graphql(
      graphqlOperation(createAttachment, { input: newAttachment })
    )
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    })

    if (!result.cancelled) {
      if (result.selected) {
        //user selected multiple files
        setFiles(result.selected)
      } else {
        setFiles([result])
      }
    }
  }

  const uploadFile = async (fileUri) => {
    try {
      const response = await fetch(fileUri)
      const blob = await response.blob()
      const key = `${uuidv4()}.png`
      await Storage.put(key, blob, {
        contentType: "image/png", // contentType is optional
      })
      return key
    } catch (err) {
      console.log("Error uploading file:", err)
    }
  }

  return (
    <>
      {!!files.length && (
        <View style={styles.attachmentsContainer}>
          <FlatList
            data={files}
            horizontal
            renderItem={({ item }) => {
              return (
                <>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.selectedImage}
                    resizeMode="contain"
                    horizontal
                  />
                  <MaterialIcons
                    name="highlight-remove"
                    onPress={() =>
                      setFiles((existingFiles) =>
                        existingFiles.filter((file) => file.uri !== item.uri)
                      )
                    }
                    size={20}
                    color="gray"
                    style={styles.removeSelectedImage}
                  />
                </>
              )
            }}
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
    width: 180,
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

