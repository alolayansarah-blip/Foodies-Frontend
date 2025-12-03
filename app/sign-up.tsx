import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { styles } from "@/styles/signUp";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();
  const isLoading = useNavigationLoading();
  const { register } = useAuth();

  // Animation values
  const mushroom1Y = useSharedValue(0);
  const mushroom1Rotate = useSharedValue(0);
  const mushroom2Y = useSharedValue(0);
  const mushroom2Rotate = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);

  // Hide navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Start animations
  useEffect(() => {
    // Mushroom 1 floating and rotating
    mushroom1Y.value = withRepeat(
      withTiming(-15, { duration: 3000 }),
      -1,
      true
    );
    mushroom1Rotate.value = withRepeat(
      withTiming(10, { duration: 4000 }),
      -1,
      true
    );

    // Mushroom 2 floating and rotating
    mushroom2Y.value = withRepeat(
      withTiming(-12, { duration: 3500 }),
      -1,
      true
    );
    mushroom2Rotate.value = withRepeat(
      withTiming(-8, { duration: 4500 }),
      -1,
      true
    );

    // Form fade in and slide up
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  // Animated styles
  const mushroom1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mushroom1Y.value },
      { rotate: `${mushroom1Rotate.value}deg` },
    ],
  }));

  const mushroom2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mushroom2Y.value },
      { rotate: `${mushroom2Rotate.value}deg` },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await register(name, email, password);
      // Navigation is handled by AuthContext after successful registration
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMsg =
        error?.message || "Failed to create account. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Sign Up Failed", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        {/* Mushroom Decorative Element */}
        <Animated.View
          style={[styles.mushroomContainer1, mushroom1AnimatedStyle]}
        >
          <Image
            source={require("@/assets/images/mashroom.png")}
            style={styles.mushroom}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.View
          style={[styles.mushroomContainer2, mushroom2AnimatedStyle]}
        >
          <Image
            source={require("@/assets/images/mashroom.png")}
            style={styles.mushroom}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Back Button Header */}
            <TouchableOpacity
              style={[styles.backButton, { top: 10 }]}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>

            {/* Logo with Creative Frame */}
            <View style={styles.logoContainer}>
              <View style={styles.logoFrame}>
                <Image
                  source={require("@/assets/images/logo2.png")}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
            </View>

            {/* Welcome Text with Creative Typography */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeLine} />
              <ThemedText style={styles.welcomeText}>
                Create Your Account
              </ThemedText>
              <View style={styles.welcomeLine} />
            </View>

            {/* Form Container */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Name</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: "#080808" }]}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="lock-check-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>
                    Confirm Password
                  </ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: "#080808" }]}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {errorMessage && (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.errorText}>
                    {errorMessage}
                  </ThemedText>
                </View>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                activeOpacity={0.85}
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                disabled={isSubmitting}
              >
                <View style={styles.buttonContent}>
                  <ThemedText style={styles.primaryButtonText}>
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </ThemedText>
                  {!isSubmitting && (
                    <View style={styles.buttonArrowContainer}>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#1a4d2e"
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Already have account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/sign-in")}>
                  <ThemedText style={styles.footerLink}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
