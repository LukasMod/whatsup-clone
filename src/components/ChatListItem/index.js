import { Text, View, Image, StyleSheet, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, authUserId }) => {
  const navigation = useNavigation()

  // Loop through the chat.users.items and find a user that is not us (Authenticated user)

  const userIndex = chat.users.items.findIndex((userAccount) => {
    return userAccount.user.id !== authUserId
  })

  const user = chat.users.items[userIndex].user

  const imageFix = user?.image?.includes("http")
    ? user?.image
    : "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/lukas.jpeg"

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Chat", { id: chat.id, name: user?.name })
      }
      style={styles.container}
    >
      <Image source={{ uri: imageFix }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={styles.subTitle}>
            {dayjs(chat.lastMessage?.createdAt).fromNow(true)}
          </Text>
        </View>

        <Text numberOfLines={2} style={styles.subTitle}>
          {chat.lastMessage?.text}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 5,
    height: 70,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  content: {
    flex: 1,

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "lightgray",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  name: {
    flex: 1,
    fontWeight: "bold",
  },
  subTitle: {
    color: "gray",
  },
})

export default ChatListItem

