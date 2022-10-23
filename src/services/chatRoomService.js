import { API, graphqlOperation, Auth } from "aws-amplify"

export const getCommonChatRoomWithUser = async (userID) => {
  // get all chart rooms of user 1
  const authUser = await Auth.currentAuthenticatedUser()

  const response = await API.graphql(
    graphqlOperation(listChatRooms, { id: authUser.attributes.sub })
  )

  const chatRooms =
    response.data?.getUser?.ChatRooms?.items.filter(
      (item) => !item.chatRoom._deleted
    ) || []

  const chatRoom = chatRooms.find((item) =>
    item.chatRoom.users.items.some((userItem) => userItem.user.id === userID)
  )

  //TODO: remove chat rooms with more than 2 users

  // get the common chat rooms
  return chatRoom
}

export const listChatRooms = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      ChatRooms {
        items {
          chatRoom {
            id
            _deleted
            users {
              items {
                user {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

