import { EthProvider } from "./contexts/EthContext";
import { useEffect, useState } from "react";
import Component from "./components/Component";
import "./App.css";

const connect = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return true;
    } catch (error) {
      console.error(error);
    }
    return false;
  }
};

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      const connected = await connect();
      setConnected(connected);
    };
    check();
  }, []);

  return (
    <EthProvider>
      <div className="container flex bg-gray-900 text-white font-mono items-center justify-center">
        {connected ? (
          <Component />
        ) : (
          <button
            onClick={() => {
              connect().then((connected) => {
                setConnected(connected);
              });
            }}
          >
            Connect
          </button>
        )}
      </div>
    </EthProvider>
  );
}

export default App;
