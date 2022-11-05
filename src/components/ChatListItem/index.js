import React, { useState, useEffect } from "react"
import { Text, View, Image, StyleSheet, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { API, graphqlOperation } from "aws-amplify"
import { onUpdateChatRoom } from "../../graphql/subscriptions"

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, authUserId }) => {
  const navigation = useNavigation()
  const [chatRoom, setChatRoom] = useState(chat)

  // Loop through the chat.users.items and find a user that is not us (Authenticated user)

  const userIndex = chat.users.items.findIndex((userAccount) => {
    return userAccount.user.id !== authUserId
  })

  const user = chatRoom.users.items[userIndex].user

  const imageFix = user?.image?.includes("http")
    ? user?.image
    : "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/lukas.jpeg"

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateChatRoom, { filter: { id: { eq: chat.id } } })
    ).subscribe({
      next: ({ value }) => {
        setChatRoom((cr) => ({ ...(cr || {}), ...value.data.onUpdateChatRoom }))
      },
      error: (err) => {
        console.log(err)
      },
    })

    return () => subscription.unsubscribe()
  }, [chat])

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Chat", { id: chatRoom.id, name: user?.name })
      }
      style={styles.container}
    >
      <Image source={{ uri: imageFix }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {chatRoom.name || user?.name}
          </Text>
          {chatRoom.LastMessage?.text && (
            <Text style={styles.subTitle}>
              {dayjs(chatRoom.LastMessage?.createdAt).fromNow(true)}
            </Text>
          )}
        </View>

        <Text numberOfLines={2} style={styles.subTitle}>
          {chatRoom.LastMessage?.text}
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

