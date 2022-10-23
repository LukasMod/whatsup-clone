import { Text, Image, StyleSheet, Pressable, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { createUserChatRoom, createChatRoom } from "../../graphql/mutations"
import { getCommonChatRoomWithUser } from "../../services/chatRoomService"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const ContactListItem = ({ user }) => {
  const navigation = useNavigation()
  //FIXME:
  const imageFix = user.image?.includes("http")
    ? user.image
    : "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/lukas.jpeg"

  const onPress = async () => {
    //check if we already have a chatRoom with user

    const existingChatRoom = await getCommonChatRoomWithUser(user.id)
    if (existingChatRoom) {
      navigation.navigate("Chat", { id: existingChatRoom.id })
      return
    }

    // create a new chatRoom

    const newChatRoomData = await API.graphql(
      graphqlOperation(createChatRoom, { input: {} })
    )

    if (!newChatRoomData.data?.createChatRoom) {
      return
    }
    const newChatRoom = newChatRoomData.data?.createChatRoom

    //Add the clicked user to the chatRoom
    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: { chatRoomID: newChatRoom.id, userID: user.id },
      })
    )

    //Add the auth user to the chatRoom
    const authUser = await Auth.currentAuthenticatedUser()
    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: { chatRoomID: newChatRoom.id, userID: authUser.attributes.sub },
      })
    )

    // navigate to the newly created chatRoom
    navigation.navigate("Chat", { id: newChatRoom.id })
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: imageFix }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>

        <Text numberOfLines={2} style={styles.subTitle}>
          {user.status}
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
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  name: {
    fontWeight: "bold",
  },
  subTitle: {
    color: "gray",
  },
})

export default ContactListItem

