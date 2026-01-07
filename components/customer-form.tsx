import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { Text, TextInput, Button } from "react-native";
import { createCustomer } from "@/db/queries/customers";
import { createAttachment } from "@/db/queries/attachments";
import { Attachment, Customer } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { PhotoSelector } from "./camera";

export const CustomerForm = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localImage, setLocalImage] = useState("");

  const handleImageSelection = (localImageLocation: string) => {
    setLocalImage(localImageLocation);
  };

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

      let newAttachmentId = "";

      // Did they attach an image?
      if (localImage.length > 0) {
        const newAttachment: Attachment = {
          id: uuidv7(),
          local_path: localImage,
          path: null,
          created_at: new Date().getTime(),
          created_by: session?.user.id!,
        };

        const result = await createAttachment(newAttachment);
        if (result?.length !== 1) {
          setErrorMessage("Adding new attachment issue detected");
          throw new Error();
        }
        newAttachmentId = newAttachment.id!;
      }

      const newCustomer: Customer = {
        id: uuidv7(),
        name,
        phone,
        attachment_id: newAttachmentId.length > 0 ? newAttachmentId : null,
        created_at: new Date().getTime(),
        created_by: session?.user.id!,
      };

      const result = await createCustomer(newCustomer);
      if (result.length === 1) {
        setErrorMessage("");
        navigation.goBack();
      } else setErrorMessage("Adding new customer issue detected");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding new customer");
    }
  };

  return (
    <>
      <Text>Customer Form</Text>
      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Phone" onChangeText={setPhone} />
      <Text>{errorMessage}</Text>
      <Button onPress={() => navigation.navigate("RoomPlanCapture")}
        title="Scan The Room" />
      <PhotoSelector passLocalImageToParent={handleImageSelection} />
      <Button onPress={handleAddCustomer} title="Add Customer" />
      <Button onPress={() => navigation.goBack()} title="Go Back" />
    </>
  );
};
