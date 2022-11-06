import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Auth } from "aws-amplify"
import { S3Image } from "aws-amplify-react-native"

dayjs.extend(relativeTime)

const Message = ({ message }) => {
  const [isMe, setIsMe] = useState(false)

  useEffect(() => {
    const isMyMessage = async () => {
      const authUser = await Auth.currentAuthenticatedUser()

      setIsMe(message.userID === authUser.attributes.sub)
    }

    isMyMessage()
  })

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
          <S3Image imgKey={message.images[0]} style={styles.image} />
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

