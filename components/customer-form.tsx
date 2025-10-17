import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { Text, TextInput, Button } from "react-native";
import { createCustomer } from "@/db/queries/customers";
import { Customer } from "@/db/schema";
import { supabase } from "@/lib/supabase";

export const CustomerForm = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddCustomer = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session || error) {
        console.error("No session available.");
        setErrorMessage("No user logged in.");
        throw new Error("Invalid session");
      }

      const newCustomer: Customer = {
        id: uuidv7(),
        name,
        phone,
        created_at: new Date().getTime(),
        created_by: session?.user.id!,
      };

      const result = await createCustomer(newCustomer);
      if (result.length === 1) {
        setErrorMessage("");
        navigation.goBack();
      } else setErrorMessage("Adding new customer issue detected");
    } catch (error) {
      setErrorMessage("Error adding new customer");
    }
  };

  return (
    <>
      <Text>Customer Form</Text>
      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Phone" onChangeText={setPhone} />
      <Button onPress={handleAddCustomer} title="Add Customer" />
      <Button onPress={() => navigation.goBack()} title="Go Back" />
    </>
  );
};
