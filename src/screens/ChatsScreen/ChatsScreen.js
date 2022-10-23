import { FlatList } from "react-native"
import ChatListItem from "../../components/ChatListItem"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { listChatRooms } from "./queries"
import { useEffect, useState } from "react"

const ChatsScreen = () => {
  const [chatRooms, setChatRooms] = useState([])
  const [authUserId, setAuthUserId] = useState("")

  useEffect(() => {
    const fetchChatRooms = async () => {
      const authUser = await Auth.currentAuthenticatedUser()
      setAuthUserId(authUser.attributes.sub)
      const response = await API.graphql(
        graphqlOperation(listChatRooms, { id: authUser.attributes.sub })
      )
      setChatRooms(response.data.getUser.ChatRooms.items)
    }

    fetchChatRooms()
  }, [])

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <ChatListItem chat={item.chatRoom} authUserId={authUserId} />
      )}
      style={{ backgroundColor: "white" }}
    />
  )
}

export default ChatsScreen

