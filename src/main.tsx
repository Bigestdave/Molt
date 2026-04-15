import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmiConfig';
import App from './App';
import XLayerLanding from './pages/XLayerLanding';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// Domain-based routing: show X Layer landing on xlayer.moltagent.live
const isXLayerDomain = window.location.hostname.includes('xlayer');

createRoot(document.getElementById('root')!).render(
  isXLayerDomain ? (
    <XLayerLanding />
  ) : (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#4ade80',
            accentColorForeground: '#06070a',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
);
