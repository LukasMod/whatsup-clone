import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, Pressable } from "react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Auth, Storage } from "aws-amplify"
import ImageView from "react-native-image-viewing"

dayjs.extend(relativeTime)

const Message = ({ message }) => {
  const [isMe, setIsMe] = useState(false)
  const [imageSources, setImageSources] = useState([])
  const [imageViewerVisible, setImageViewerVisible] = useState(false)

  useEffect(() => {
    const isMyMessage = async () => {
      const authUser = await Auth.currentAuthenticatedUser()

      setIsMe(message.userID === authUser.attributes.sub)
    }

    isMyMessage()
  }, [])

  useEffect(() => {
    const downloadImages = async () => {
      if (message.images?.length) {
        const imageUrls = await Promise.all(message.images.map(Storage.get))
        setImageSources(imageUrls.map((uri) => ({ uri })))
      }
    }
    downloadImages()
  }, [message.images])

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? "#DCF8C5" : "white",
          alignSelf: isMe ? "flex-end" : "flex-start",
        },
      ]}
    >
      {message.images?.length && (
        <View style={styles.imageContainer}>
          <Pressable onPress={() => setImageViewerVisible(true)}>
            <Image source={imageSources[0]} style={styles.image} />
          </Pressable>
          <ImageView
            images={imageSources}
            imageIndex={0}
            visible={imageViewerVisible}
            onRequestClose={() => setImageViewerVisible(false)}
          />
        </View>
      )}

      <Text>{message.text}</Text>
      <Text style={styles.time}>{dayjs(message.createdAt).fromNow(true)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",

    // Shadows
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  time: {
    color: "gray",
    alignSelf: "flex-end",
  },
  imageContainer: {
    width: 200,
    height: 100,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
})

export default Message

