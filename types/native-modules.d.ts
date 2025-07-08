declare module "react-native" {
  interface NativeModulesStatic {
    RNUserDefaults: {
      setSharedData: (suiteName: string, key: string, value: string) => Promise<boolean>;
    };
  }
}
