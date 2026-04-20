import "react-native-url-polyfill/auto"; // required by @supabase/supabase-js in RN
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
