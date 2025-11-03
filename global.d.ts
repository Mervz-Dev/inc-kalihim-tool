export {};

declare global {
  var __authCallback: (() => void) | undefined;
}
