import { useState } from "react"
import { View, StyleSheet, TextInput, Image, FlatList } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { API, Auth, graphqlOperation, Storage } from "aws-amplify"
import { createMessage, updateChatRoom } from "../../graphql/mutations"
import * as ImagePicker from "expo-image-picker"

import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"

const InputBox = ({ chatRoom }) => {
  const [text, setText] = useState("")
  const [images, setImages] = useState([])

  const onSend = async () => {
    if (text || images.length) {
      const authUser = await Auth.currentAuthenticatedUser()

      const newMessage = {
        chatroomID: chatRoom.id,
        text,
        userID: authUser.attributes.sub,
      }

      if (images.length) {
        newMessage.images = await Promise.all(images.map(uploadFile))
        setImages([])
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
        setImages(result.selected.map((asset) => asset.uri))
      } else {
        setImages([result.uri])
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
      {!!images.length && (
        <View style={styles.attachmentsContainer}>
          <FlatList
            data={images}
            horizontal
            renderItem={({ item }) => {
              return (
                <>
                  <Image
                    source={{ uri: item }}
                    style={styles.selectedImage}
                    resizeMode="contain"
                    horizontal
                  />
                  <MaterialIcons
                    name="highlight-remove"
                    onPress={() =>
                      setImages((existingImages) =>
                        existingImages.filter((img) => img !== item)
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

