export const listChatRooms = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      ChatRooms {
        items {
          chatRoom {
            id
            updatedAt
            _deleted
            users {
              items {
                user {
                  id
                  image
                  name
                }
              }
            }
            LastMessage {
              id
              text
              createdAt
            }
          }
        }
      }
    }
  }
`

