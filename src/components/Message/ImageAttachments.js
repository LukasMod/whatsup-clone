import { StyleSheet, Pressable, Image } from "react-native"
import React, { useState } from "react"
import ImageView from "react-native-image-viewing"

const ImageAttachments = ({ attachments }) => {
  const [imageViewerVisible, setImageViewerVisible] = useState(false)

  return (
    <>
      {attachments.map((attachment) => {
        return (
          <Pressable
            onPress={() => setImageViewerVisible(true)}
            key={attachment.id}
            style={[
              styles.imageContainer,
              attachments.length === 1 && styles.imageContainerSingle,
            ]}
          >
            <Image source={{ uri: attachment.uri }} style={styles.image} />
          </Pressable>
        )
      })}

      <ImageView
        images={attachments.map(({ uri }) => ({ uri }))}
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </>
  )
}

export default ImageAttachments

const styles = StyleSheet.create({
  images: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainer: {
    width: "45%",
    borderColor: "white",
    margin: 2,
    borderRadius: 5,
    borderWidth: 2,
    aspectRatio: 1,
  },
  imageContainerSingle: {
    flex: 1,
  },
  image: {
    flex: 1,
    borderRadius: 5,
  },
})

