import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";

const index = () => {
  //if user is logged in, redirect to home screen
  //otherwise, redirect to sign in screen
  return <Redirect href="/sign-in" />;
};

export default index;

const styles = StyleSheet.create({});
