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

import ImageAttachments from "./ImageAttachments"
import VideoAttachments from "./VideoAttachments"

dayjs.extend(relativeTime)

const Message = ({ message }) => {
  const [isMe, setIsMe] = useState(false)
  const [downloadedAttachments, setDownloadedAttachments] = useState([])

  const { width } = useWindowDimensions()

  useEffect(() => {
    const isMyMessage = async () => {
      const authUser = await Auth.currentAuthenticatedUser()

      setIsMe(message.userID === authUser.attributes.sub)
    }

    isMyMessage()
  }, [])

  useEffect(() => {
    const downloadAttachments = async () => {
      if (message.Attachments?.items?.length) {
        const downloadAttachments = await Promise.all(
          message.Attachments.items.map((attachment) =>
            Storage.get(attachment.storageKey).then((uri) => ({
              ...attachment,
              uri,
            }))
          )
        )

        setDownloadedAttachments(downloadAttachments)
      }
    }

    downloadAttachments()
  }, [message.Attachments.items])

  const imageContainerWidth = width * 0.8 - 30
  const imageAttachments = downloadedAttachments.filter(
    (at) => at.type === "IMAGE"
  )
  const videoAttachments = downloadedAttachments.filter(
    (at) => at.type === "VIDEO"
  )

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
      {!!downloadedAttachments.length && (
        <View style={[{ width: imageContainerWidth }, styles.images]}>
          <ImageAttachments attachments={imageAttachments} />
          <VideoAttachments
            attachments={videoAttachments}
            width={imageContainerWidth}
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

