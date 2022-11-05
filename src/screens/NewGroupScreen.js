import React, { useState, useEffect } from "react"
import { FlatList, View, TextInput, StyleSheet, Button } from "react-native"
import ContactListItem from "../components/ContactListItem"
import { API, graphqlOperation, Auth } from "aws-amplify"
import { listUsers } from "../graphql/queries"
import { createChatRoom, createUserChatRoom } from "../graphql/mutations"
import { useNavigation } from "@react-navigation/native"

const ContactsScreen = () => {
  const [users, setUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [name, setName] = useState("")

  const navigation = useNavigation()

  useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items)
    })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Create"
          disabled={!name || selectedUserIds.length < 1}
          onPress={onCreateGroupPress}
        />
      ),
    })
  }, [name, selectedUserIds])

  console.log(
    "TEST ",
    selectedUserIds.length,
    !name || selectedUserIds.length < 1
  )

  const onCreateGroupPress = async () => {
    // create a new chatRoom

    const newChatRoomData = await API.graphql(
      graphqlOperation(createChatRoom, { input: {} })
    )

    if (!newChatRoomData.data?.createChatRoom) {
      return
    }
    const newChatRoom = newChatRoomData.data?.createChatRoom

    //Add the selected users to the chatRoom

    await Promise.all(
      selectedUserIds.map((userID) =>
        API.graphql(
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: newChatRoom.id, userID },
          })
        )
      )
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

  const onContactPress = (id) => {
    setSelectedUserIds((userIds) => {
      if (userIds.includes(id)) {
        // remove id from selected
        return [...userIds].filter((uid) => uid !== id)
      } else {
        // add id to selected
        return [...userIds, id]
      }
    })
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Group name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <ContactListItem
            user={item}
            selectable
            onPress={() => onContactPress(item.id)}
            isSelected={selectedUserIds.includes(item.id)}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgray",
    padding: 10,
    margin: 10,
  },
})

export default ContactsScreen

