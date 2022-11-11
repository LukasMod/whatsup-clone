import React from "react"
import { Video } from "expo-av"

const VideoAttachments = ({ width, attachments }) => {

  return (
    <>
      {attachments.map((attachment) => (
        <Video
          useNativeControls
          source={{
            uri: attachment.uri,
          }}
          shouldPlay={false}
          style={{
            width,
            height: (attachment.height * width) / attachment.width,
          }}
          resizeMode="contain"
          key={attachment.id}
        />
      ))}
    </>
  )
}

export default VideoAttachments

