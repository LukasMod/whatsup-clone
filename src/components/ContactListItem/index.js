import { Text, Image, StyleSheet, Pressable, View } from "react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { AntDesign, FontAwesome } from "@expo/vector-icons"

dayjs.extend(relativeTime)

const ContactListItem = ({
  user,
  onPress = () => {},
  selectable = false,
  isSelected = false,
}) => {
  //FIXME:
  const imageFix = user.image?.includes("http")
    ? user.image
    : "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/lukas.jpeg"

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
      {selectable &&
        (isSelected ? (
          <AntDesign name="checkcircle" size={24} color="royalblue" />
        ) : (
          <FontAwesome name="circle-thin" size={24} color="lightgray" />
        ))}
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
    marginRight: 10,
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

