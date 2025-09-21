import React from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

interface PdfViewerProps {
  uri: string;
}

export const PdfViewer = ({ uri }: PdfViewerProps) => {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri }}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" />}
      />
    </View>
  );
};
