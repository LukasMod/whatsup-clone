import { useState, useEffect } from "react"
import { FlatList, Pressable, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import ContactListItem from "../components/ContactListItem"
import { API, graphqlOperation, Auth } from "aws-amplify"
import { listUsers } from "../graphql/queries"
import { createUserChatRoom, createChatRoom } from "../graphql/mutations"
import { getCommonChatRoomWithUser } from "../services/chatRoomService"

const ContactsScreen = () => {
  const [users, setUsers] = useState([])
  const navigation = useNavigation()

  useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items)
    })
  }, [])

  const createAChatRoomWithTheUser = async (user) => {
    //check if we already have a chatRoom with user

    const existingChatRoom = await getCommonChatRoomWithUser(user.id)
    if (existingChatRoom) {
      navigation.navigate("Chat", { id: existingChatRoom.chatRoom.id })
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
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <ContactListItem
          user={item}
          onPress={() => createAChatRoomWithTheUser(item)}
        />
      )}
      style={{ backgroundColor: "white" }}
      ListHeaderComponent={() => (
        <Pressable
          onPress={() => {
            navigation.navigate("New Group")
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            paddingHorizontal: 20,
          }}
        >
          <MaterialIcons
            name="group"
            size={24}
            color="royalblue"
            style={{
              marginRight: 20,
              backgroundColor: "gainsboro",
              padding: 7,
              borderRadius: 20,
              overflow: "hidden",
            }}
          />
          <Text style={{ color: "royalblue", fontSize: 16 }}>New Group</Text>
        </Pressable>
      )}
    />
  )
}

export default ContactsScreen

