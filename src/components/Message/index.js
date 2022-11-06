import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Auth, Storage } from "aws-amplify"
import ImageView from "react-native-image-viewing"

dayjs.extend(relativeTime)

const Message = ({ message }) => {
  const [isMe, setIsMe] = useState(false)
  const [imageSources, setImageSources] = useState([])
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const { width } = useWindowDimensions()

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

  const imageContainerWidth = width * 0.8 - 30

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
      {!!imageSources.length && (
        <View style={[{ width: imageContainerWidth }, styles.images]}>
          {imageSources.map((imageSource) => {
            return (
              <Pressable
                onPress={() => setImageViewerVisible(true)}
                key={imageSource.uri}
                style={[
                  styles.imageContainer,
                  imageSources.length === 1 && styles.imageContainerSingle,
                ]}
              >
                <Image source={imageSource} style={styles.image} />
              </Pressable>
            )
          })}
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
  images: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainer: {
    width: "45%",
    borderColor: "white",
    margin: 2,
    borderRadius: 5,
    borderWidth: 2,
    aspectRatio: 1,
  },
  imageContainerSingle: {
    flex: 1,
  },
  image: {
    flex: 1,
    borderRadius: 5,
  },
})

export default Message

