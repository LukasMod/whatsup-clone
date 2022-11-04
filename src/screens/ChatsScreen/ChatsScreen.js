import { FlatList } from "react-native"
import ChatListItem from "../../components/ChatListItem"
import { API, Auth, graphqlOperation } from "aws-amplify"
import { listChatRooms } from "./queries"
import { useEffect, useState } from "react"

const ChatsScreen = () => {
  const [chatRooms, setChatRooms] = useState([])
  const [authUserId, setAuthUserId] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchChatRooms = async () => {
    setLoading(true)

    const authUser = await Auth.currentAuthenticatedUser()
    setAuthUserId(authUser.attributes.sub)
    const response = await API.graphql(
      graphqlOperation(listChatRooms, { id: authUser.attributes.sub })
    )

    const rooms =
      response.data.getUser.ChatRooms.items.filter(
        (item) => !item.chatRoom._deleted
      ) || []

    const sortedRooms = rooms.sort(
      (room1, room2) =>
        new Date(room2.chatRoom.updatedAt) - new Date(room1.chatRoom.updatedAt)
    )

    setChatRooms(sortedRooms)
    setLoading(false)
  }

  useEffect(() => {
    fetchChatRooms()
  }, [])

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <ChatListItem chat={item.chatRoom} authUserId={authUserId} />
      )}
      style={{ backgroundColor: "white" }}
      refreshing={loading}
      onRefresh={fetchChatRooms}
    />
  )
}

export default ChatsScreen

