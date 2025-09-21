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
};

export type RootNavigationProps = NavigationProp<RootStackParamList>;
