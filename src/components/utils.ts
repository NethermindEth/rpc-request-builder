import { selector } from "starknet";

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

export const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
};


export  const transformParamsToArray = (params: any) => {
  const transformParam = (param: any): any => {
    if (param.description || param.placeholder) {
      if (param.oneOf) {
        return {
          description: param.description,
          index: param.index,
          value: param.oneOf.map((option: any) => ({
            name: option.name,
            placeholder: option.placeholder,
            pattern: option.pattern,
            enum: option.enum,
          })),
        };
      } else {
        return {
          description: param.description,
          placeholder: param.placeholder,
        };
      }
    } else if (!param.placeholder && !param.description) {
      let params = {};
      for (const [key, value] of Object.entries(param)) {
        params = {
          ...params,
          [key]: {
            ...transformParam(value),
            name: key,
          },
        };
      }

      return params;
    }
    return {};
  };

  return params
    ? Object.entries(params).flatMap(([name, value]) => {
        if (Array.isArray(value)) {
          let values = value.map((param: any) => {
            return transformParam(param);
          });

          return { name, value: values };
        }
        return { name, value: transformParam(value) };
      })
    : [];
};

interface ParamsObject {
  [key: string]: any;
}

export const constructParamsArray = (latestParamsArray: any) => {
  if (latestParamsArray.length === 0) {
    return [];
  }

  const processPlaceholder = (latestParams: any, isEntryPoint: boolean) => {
    let placeholder = latestParams.placeholder;
    if (isEntryPoint) {
      placeholder = selector.getSelectorFromName(placeholder);
    }
    return placeholder;
  };

  const constructParams = (latestParams: any, isEntryPoint: boolean): any => {
    if (!latestParams.description) {
      return Object.entries(latestParams).reduce(
        (acc: ParamsObject, [key, value]) => {
          acc[key] = Array.isArray(value)
            ? value.map((val) =>
                constructParams(val, key === "entry_point_selector")
              )
            : constructParams(value, key === "entry_point_selector");
          return acc;
        },
        {}
      );
    } else if (latestParams?.value?.length > 0) {
      const selectedOption = latestParams.value[latestParams.index];
      const placeholder = processPlaceholder(selectedOption, isEntryPoint);
      return selectedOption.enum
        ? placeholder
        : { [selectedOption.name]: placeholder };
    } else {
      return processPlaceholder(latestParams, isEntryPoint);
    }
  };

  return latestParamsArray.reduce(
    (accumulator: any, param: { value: any[]; name: string }) => {
      if (Array.isArray(param.value)) {
        accumulator[param.name] = param.value.map((val: any) =>
          constructParams(val, val.name === "entry_point_selector")
        );
      } else {
        accumulator[param.name] = constructParams(
          param.value,
          param.name === "entry_point_selector"
        );
      }

      return accumulator;
    },
    {}
  );
};
