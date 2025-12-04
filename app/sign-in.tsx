import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { styles } from "@/styles/signIn";
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

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();
  const isLoading = useNavigationLoading();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Animation values
  const mushroom1Y = useSharedValue(0);
  const mushroom1Rotate = useSharedValue(0);
  const mushroom2Y = useSharedValue(0);
  const mushroom2Rotate = useSharedValue(0);
  const flowerY = useSharedValue(0);
  const flowerRotate = useSharedValue(0);
  const plateY = useSharedValue(0);
  const plateRotate = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const buttonShine = useSharedValue(0);
  const logoTextRotate = useSharedValue(0);

  // Hide navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log(
        "User already authenticated, redirecting from sign-in to tabs..."
      );
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, authLoading]);

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

    // Flower floating and rotating
    flowerY.value = withRepeat(withTiming(-10, { duration: 3200 }), -1, true);
    flowerRotate.value = withRepeat(
      withTiming(15, { duration: 5000 }),
      -1,
      true
    );

    // Plate floating and rotating
    plateY.value = withRepeat(withTiming(-8, { duration: 3100 }), -1, true);
    plateRotate.value = withRepeat(
      withTiming(12, { duration: 4700 }),
      -1,
      true
    );

    // Form fade in and slide up
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));

    // Button shine animation
    buttonShine.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);

    // Logo text - no animation (static)
    // logoTextRotate.value = withRepeat(
    //   withTiming(360, { duration: 20000 }),
    //   -1,
    //   false
    // );
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

  const plateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: plateY.value },
      { rotate: `${plateRotate.value}deg` },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonShineStyle = useAnimatedStyle(() => {
    const progress = buttonShine.value;
    return {
      left: `${(progress - 1) * 200}%`,
      opacity: progress > 0.5 ? (1 - progress) * 0.5 : progress * 0.5,
    };
  });

  // const logoTextAnimatedStyle = useAnimatedStyle(() => ({
  //   transform: [{ rotate: `${logoTextRotate.value}deg` }],
  // }));

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setShowRegisterPrompt(false);

    try {
      await login(email, password);
      // Navigation is handled by AuthContext after successful login
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMsg =
        error?.message || "Failed to sign in. Please check your credentials.";
      setErrorMessage(errorMsg);
      Alert.alert("Sign In Failed", errorMsg);
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

        {/* Plate Decorative Element */}
        <Animated.View style={[styles.plateContainer, plateAnimatedStyle]}>
          <Image
            source={require("@/assets/images/platte.png")}
            style={styles.plate}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 80 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
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
                Your Dish, Your Dash
              </ThemedText>
              <View style={styles.welcomeLine} />
            </View>

            {/* Static Text Under Welcome */}
            <View style={styles.subtitleContainer}>
              <ThemedText style={styles.subtitleText}>
                dash through the dishes
              </ThemedText>
            </View>

            {/* Form Container */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="restaurant-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setShowRegisterPrompt(false);
                    }}
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
                    name="chef-hat"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="fast-food-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setShowRegisterPrompt(false);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
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

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>

              {errorMessage && (
                <View style={styles.registerPrompt}>
                  <ThemedText style={styles.registerPromptText}>
                    {errorMessage}{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push("/sign-up")}>
                    <ThemedText style={styles.registerLink}>
                      Register here
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                activeOpacity={0.9}
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                disabled={isSubmitting}
              >
                <Animated.View
                  style={[styles.buttonShineOverlay, buttonShineStyle]}
                />
                <View style={styles.buttonContent}>
                  <ThemedText style={styles.primaryButtonText}>
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </ThemedText>
                  {!isSubmitting && (
                    <View style={styles.buttonArrowContainer}>
                      <Ionicons name="restaurant" size={18} color="#0d2818" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Don't have account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/sign-up")}>
                  <ThemedText style={styles.footerLink}>Register</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
