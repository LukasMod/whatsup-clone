import { useEffect, useState } from "react"
import {
  ImageBackground,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import Message from "../../components/Message"
import InputBox from "../../components/InputBox"

import bg from "../../../assets/images/BG.png"

import { API, graphqlOperation } from "aws-amplify"
import { getChatRoom } from "../../graphql/queries"
import { listMessagesByChatRoom } from "./ChatScreenQueries"
import { onCreateMessage, onUpdateChatRoom } from "../../graphql/subscriptions"
import { Feather } from "@expo/vector-icons"

const ChatScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()

  const [chatRoom, setChatRoom] = useState(null)
  const [messages, setMessages] = useState([])

  const chatroomID = route?.params?.id

  //fetch chat room
  useEffect(() => {
    API.graphql(graphqlOperation(getChatRoom, { id: chatroomID })).then(
      (result) => {
        setChatRoom(result.data?.getChatRoom)
      }
    )

    const subscription = API.graphql(
      graphqlOperation(onUpdateChatRoom, { filter: { id: { eq: chatroomID } } })
    ).subscribe({
      next: ({ value }) => {
        setChatRoom((cr) => ({ ...(cr || {}), ...value.data.onUpdateChatRoom }))
      },
      error: (err) => {
        console.log(err)
      },
    })
    return () => subscription.unsubscribe()
  }, [chatroomID])

  //fetch chat messages
  useEffect(() => {
    API.graphql(
      graphqlOperation(listMessagesByChatRoom, {
        chatroomID,
        sortDirection: "DESC",
      })
    ).then((result) => {
      setMessages(result.data?.listMessagesByChatRoom?.items)
    })

    // subscribe to new messages

    const subscription = API.graphql(
      graphqlOperation(onCreateMessage, {
        filter: { chatroomID: { eq: chatroomID } },
      })
    ).subscribe({
      next: ({ value }) => {
        setMessages((m) => [value.data.onCreateMessage, ...m])
      },
      error: (err) => {
        console.log(err)
      },
    })

    return () => subscription.unsubscribe()
  }, [chatroomID])

  useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
      headerRight: () => (
        <Feather
          name="more-vertical"
          size={24}
          color="black"
          onPress={() => navigation.navigate("Group Info", { id: chatroomID })}
        />
      ),
    })
  }, [route.params.name])


  if (!chatRoom) {
    return <ActivityIndicator style={styles.loader} />
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 90}
      style={styles.bg}
    >
      <ImageBackground source={bg} style={styles.bg}>
        <FlatList
          data={messages}
          renderItem={({ item }) => <Message message={item} />}
          style={styles.list}
          inverted
        />
        <InputBox chatRoom={chatRoom} />
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  list: {
    padding: 10,
  },
  loader: {
    alignSelf: "center",
    flex: 1,
  },
})

export default ChatScreen
