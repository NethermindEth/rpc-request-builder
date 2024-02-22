export const isUrlFromNethermindDomain = (url: string) => {
  try {
    // Parse the URL using the URL constructor
    const parsedUrl = new URL(url);

    // Check if the hostname matches 'rpc.nethermind.io' or 'free-rpc.nethermind.io'
    return (
      parsedUrl.hostname === "rpc.nethermind.io" ||
      parsedUrl.hostname === "free-rpc.nethermind.io"
    );
  } catch (e) {
    // If an error occurs (e.g., invalid URL), return false
    console.error((e as Error).message);
    return false;
  }
};

export const extractRpcUrl = (curlCommand: string) => {
  const rpcUrlPattern = /--location\s+'([^']+)'/;
  const match = curlCommand.match(rpcUrlPattern);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};

export const extractNodeUrl = (starknetJsCode: string) => {
  const regex = /nodeUrl: "(.*?)"/;
  const match = regex.exec(starknetJsCode);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};


export const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

