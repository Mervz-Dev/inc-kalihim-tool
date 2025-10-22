import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  index: undefined;
  purok: {
    purok: string;
  };
  "absent-viewer": {
    purok: string;
  };
  "attendance-viewer": {
    purok: string;
  };
  "percent-generator": {
    groupCount: string;
    purok: string;
  };
  settings: undefined;
};

export type RootNavigationProps = NavigationProp<RootStackParamList>;
