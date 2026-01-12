To test Apple's RoomPlan API, we need to get the build onto a device because the iOS simulator does not support camera usage. Historically, we would juse use Expo Go to easily put the build on a device with out any need to install certs, etc. Unfortunately, 
PowerSync's SQLite adapters [do not play well with Expo Go](https://docs.powersync.com/client-sdk-references/react-native-and-expo/expo-go-support#moving-beyond-expo-go).

This means we need to create and install development builds using Expo. In the end, it takes _slightly_ longer, but works just fine.

I don't know if we can do this without EAS (Expo's Cloud Services) or not. I think we might be able to, and I might just be doing that. There are some [iOS specific steps](https://docs.expo.dev/develop/development-builds/share-with-your-team/#ios-only-instructions) we need to take. [Provisioning the device](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/#provisioning-profile) is a step we have to take.

But I just found this: (https://expo.dev/orbit)