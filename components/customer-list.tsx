import React, { useState } from "react";
import { Text, FlatList, Button } from "react-native";
import { supabase } from "@/lib/supabase";
import { getCustomersByCreatedId } from "@/db/queries/customers";
import { Session } from "@supabase/supabase-js";
import { type Customer } from "@/db/schema";
import { PowerSyncStatus } from "./powersync-status";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export const CustomerList = () => {
  const navigation = useNavigation();
  const [session, setSession] = useState<Session | null>(null);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            setError(error);
            setLoading(false);
            return;
          }

          setSession(data?.session ?? null);

          if (data?.session?.user) {
            try {
              const fetched = await getCustomersByCreatedId(
                data.session.user.id
              );
              setCustomers(fetched);
            } catch (err) {
              setError(err);
            }
          }
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading customers: {error.message}</Text>;
  if (!session) return <Text>No session</Text>;

  return (
    <>
      <PowerSyncStatus />
      <Text>Customer List for user id {session.user.id}</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <SafeAreaView>
            <Text>Name: {item.name}</Text>
            <Text>Phone: {item.phone}</Text>
          </SafeAreaView>
        )}
      />
      <Button
        onPress={() => navigation.navigate("CustomerForm")}
        title="Add Customer"
      />
    </>
  );
};
