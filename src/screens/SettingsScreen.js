import { StyleSheet, Text, View, Button } from "react-native"
import React from "react"
import { Auth } from "aws-amplify"

const SettingsScreen = () => {
  const onPress = () => Auth.signOut()

  return (
    <View style={styles.container}>
      <Button title="Sign Out" onPress={onPress} />
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

