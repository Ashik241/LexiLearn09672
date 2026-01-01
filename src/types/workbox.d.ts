export {};

declare global {
  interface Window {
    workbox?: {
      addEventListener: (
        event: 'waiting' | string,
        callback: (event: any) => void
      ) => void;
      register: () => void;
      messageSW: (data: { type: string }) => void;
    };
  }
}
