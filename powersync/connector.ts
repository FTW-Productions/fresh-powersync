import {
  PowerSyncBackendConnector,
  AbstractPowerSyncDatabase,
  UpdateType,
} from "@powersync/react-native";
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { createCustomer } from "@/services/customers";

export class Connector implements PowerSyncBackendConnector {
  supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = supabase;
  }
  /**
   * Implement fetchCredentials to obtain a JWT from your authentication service.
   * See https://docs.powersync.com/installation/authentication-setup
   * If you're using Supabase or Firebase, you can re-use the JWT from those clients, see:
   * https://docs.powersync.com/installation/authentication-setup/supabase-auth
   * https://docs.powersync.com/installation/authentication-setup/firebase-auth
   */
  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!session || error) {
      console.error("No session available, returning null.");
      return null;
    }

    console.debug("Session expires at: ", session.expires_at);
    return {
      // The PowerSync instance URL or self-hosted endpoint
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL,
      /**
       * To get started quickly, use a development token, see:
       * Authentication Setup https://docs.powersync.com/installation/authentication-setup/development-tokens) to get up and running quickly
       */
      token: session.access_token ?? "",
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
    };
  }

  /**
   * Implement uploadData to send local changes to your backend service.
   * You can omit this method if you only want to sync data from the database to the client
   * See example implementation here:https://docs.powersync.com/client-sdk-references/react-native-and-expo#3-integrate-with-your-backend
   */
  async uploadData(database: AbstractPowerSyncDatabase) {
    /**
     * For batched crud transactions, use data.getCrudBatch(n);
     * https://powersync-ja.github.io/powersync-js/react-native-sdk/classes/SqliteBucketStorage#getcrudbatch
     */
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    for (const op of transaction.crud) {
      // The data that needs to be changed in the remote db
      const record = { ...op.opData, id: op.id };
      switch (op.op) {
        case UpdateType.PUT:
          // TODO: Instruct your backend API to CREATE a record
          console.log("Insert record: ", record);
          console.log(op.opData);
          switch (op.table) {
            case "customers":
              const newCustomer = {
                id: op.id,
                name: op.opData!.name,
                phone: op.opData!.phone,
                created_by: op.opData!.created_by,
                created_at: op.opData!.created_at,
              };
              await createCustomer(newCustomer);
              break;
          }
          break;
        case UpdateType.PATCH:
          // TODO: Instruct your backend API to PATCH a record
          console.log("Update record: ", op.opData);
          break;
        case UpdateType.DELETE:
          //TODO: Instruct your backend API to DELETE a record
          console.log("Delete record: ", op.opData);
          break;
      }
    }

    // Completes the transaction and moves onto the next one
    await transaction.complete();
  }
}
