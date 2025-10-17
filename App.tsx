import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Auth } from "@/components/auth";
import { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { CustomerList } from "@/components/customer-list";
import { CustomerForm } from "@/components/customer-form";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/db/migrations/migrations";
import { dbForMigrations } from "@/db";
import { setupPowerSync } from "./powersync/system";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const { success, error } = useMigrations(dbForMigrations, migrations);

  // Handle auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Once we have a successful migration, setup PowerSync
  useEffect(() => {
    const setup = async () => {
      await setupPowerSync();
    };
    if (!!success) {
      setup()
        .catch((error) => console.error("Error setting up PowerSync: ", error))
        .then(() => console.debug("PowerSync setup complete"));
    }
  }, [success]);

  // Handle migration errors
  if (error) {
    console.error("Migration Error: ", error.message, error.cause, error.stack);
    return (
      <View>
        <Text>Migration Error: {error.message}</Text>
      </View>
    );
  }

  // Navigation when not logged in
  const AuthStack = createNativeStackNavigator();
  function AuthNavigator() {
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen name="SignIn" component={Auth} />
      </AuthStack.Navigator>
    );
  }

  // Navigation when logged in
  const AppStack = createNativeStackNavigator();
  function AppNavigator() {
    return (
      <AppStack.Navigator>
        <AppStack.Screen name="CustomerList" component={CustomerList} />
        <AppStack.Screen name="CustomerForm" component={CustomerForm} />
      </AppStack.Navigator>
    );
  }

  // Decide which navigation we should show
  function RootNavigator({ session }: { session: Session | null }) {
    return (
      <NavigationContainer>
        {!session || !session.user ? <AuthNavigator /> : <AppNavigator />}
        <StatusBar style="auto" />
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator session={session} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
