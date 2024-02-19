"use client";

import { useState, useEffect, useRef } from "react";
import { Methods } from "@/api/rpcspec";
import Editor from "@monaco-editor/react";
import {
  MAINNET_RPC_URL,
  GOERLI_RPC_URL,
  SEPOLIA_RPC_URL,
  CURL_HEADER,
  DEFAULT_CURL_REQUEST,
  DEFAULT_STARKNET_JS_REQUEST,
  DEFAULT_STARKNET_GO_REQUEST,
  DEFAULT_STARKNET_RS_REQUEST,
  DEFAULT_RAW_REQUEST,
  DEFAULT_RAW_RESPONSE,
  DEFAULT_DECODED_RESPONSE,
} from "./constant";
import { selector } from "starknet";
import {
  isUrlFromNethermindDomain,
  extractRpcUrl,
  extractNodeUrl,
  formatStarknetRsParamsBlockId,
  formatStarknetRsParamsInvokeTransaction,
  formatStarknetRsParamsDeclareTransaction,
  formatStarknetRsParamsDeployAccountTransaction,
  formatStarknetRsParamsTransactions,
  formatStarknetRsParamsSimulationFlags,
} from "./utils";

const formatName = (name: string) => {
  // Make first letter uppercase
  name = name.charAt(0).toUpperCase() + name.slice(1);
  // turn _ into space
  return name.replace(/_/g, " ");
};

const Builder = () => {
  const transformParamsToArray = (params: any) => {
    const transformParam = (param: any): any => {
      if (param.description !== undefined || param.placeholder !== undefined) {
        if (param.oneOf) {
          return {
            description: param.description,
            index: param.index,
            value: param.oneOf.map((option: any) => ({
              name: option.name,
              placeholder: option.placeholder,
              pattern: option.pattern,
              enum: option.enum,
              fields: option.fields,
            })),
          };
        } else {
          return {
            description: param.description,
            placeholder: param.placeholder,
          };
        }
      } else if (
        param.placeholder === undefined &&
        param.description === undefined
      ) {
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

  const [method, setMethod] = useState(Methods[0]);
  const [paramsArray, setParamsArray] = useState(
    Methods[0].params ? transformParamsToArray(Methods[0].params) : []
  );

  const [rpcUrl, setRpcUrl] = useState(MAINNET_RPC_URL);
  const [useCustomRpcUrl, setUseCustomRpcUrl] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const [requestTab, setRequestTab] = useState("raw");
  const [starknetJs, setStarknetJs] = useState(DEFAULT_STARKNET_JS_REQUEST);
  const [starknetGo, setStarknetGo] = useState(DEFAULT_STARKNET_GO_REQUEST);
  const [starknetRs, setStarknetRs] = useState(DEFAULT_STARKNET_RS_REQUEST);
  const [curlRequest, setCurlRequest] = useState(DEFAULT_CURL_REQUEST);
  const [rawRequest, setRawRequest] = useState(DEFAULT_RAW_REQUEST);

  const [responseTab, setResponseTab] = useState("raw");
  const [response, setResponse] = useState(DEFAULT_RAW_RESPONSE);
  const [decodedResponse, setDecodedResponse] = useState(
    DEFAULT_DECODED_RESPONSE
  );
  const copyToClipboard = (type: string) => {
    if (type == "request") {
      navigator.clipboard.writeText(
        requestTab == "raw"
          ? rawRequest
          : requestTab == "curl"
          ? curlRequest
          : requestTab === "starknetJs"
          ? starknetJs
          : requestTab === "starknetGo"
          ? starknetGo
          : starknetRs
      );
    } else {
      navigator.clipboard.writeText(response);
    }
  };

  const getRpcUrl = (rpcUrl: string) => {
    if (isUrlFromNethermindDomain(rpcUrl) && apiKey) {
      return `${rpcUrl}?apikey=${apiKey}`;
    }
    return rpcUrl;
  };

  const updateRpcUrl = (newRpcUrl: string, oldRpcUrl: string) => {
    // remove everything before the first \
    let dataPart = curlRequest.split("\\")[1];
    let urlPart = `curl --location '${newRpcUrl}' \\`;

    let newCurlRequest = urlPart + dataPart;
    setCurlRequest(newCurlRequest);

    // Replace oldRpcUrl with newRpcUrl
    newRpcUrl = getRpcUrl(newRpcUrl);

    const extractedRpcUrl = extractNodeUrl(starknetJs);
    if (extractedRpcUrl) {
      // update the nodeUrl in starknet.js
      let newStarknetJs = starknetJs.replace(oldRpcUrl, newRpcUrl);
      setStarknetJs(newStarknetJs);

      // update the nodeUrl in starknet.go
      let newStarknetGo = starknetGo.replace(oldRpcUrl, newRpcUrl);
      setStarknetGo(newStarknetGo);

      // update the nodeUrl in starknet.rs
      let newStarknetRs = starknetRs.replace(oldRpcUrl, newRpcUrl);
      setStarknetRs(newStarknetRs);

      // update all methods as well
      Methods.forEach((method) => {
        let newStarknetJs = method.starknetJs.replace(
          extractedRpcUrl,
          newRpcUrl
        );
        method.starknetJs = newStarknetJs;

        let newStarknetGo = method.starknetGo.replace(
          extractedRpcUrl,
          newRpcUrl
        );
        method.starknetGo = newStarknetGo;

        let newStarknetRs = method.starknetRs.replace(
          extractedRpcUrl,
          newRpcUrl
        );
        method.starknetRs = newStarknetRs;
      });
      return newCurlRequest;
    }
  };

  interface ParamsObject {
    [key: string]: any;
  }

  const constructParamsArray = (latestParamsArray: any) => {
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
        if (selectedOption.enum) {
          return placeholder;
        } else if (selectedOption.fields) {
          const [type, version] = placeholder.split(" ");
          return Object.entries(selectedOption.fields).reduce(
            (acc: ParamsObject, [key, value]) => {
              const { placeholder } = value as { placeholder: string };
              acc[key] = placeholder;
              return acc;
            },
            { type, version: `0x${version.charAt(1)}` }
          );
        } else {
          return { [selectedOption.name]: placeholder };
        }
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

  const sendRequest = async () => {
    setisLoading(true);
    const requestRpcUrl = getRpcUrl(rpcUrl);
    await fetch(requestRpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rawRequest,
    })
      .then(async (response) => {
        const json = await response.json();
        setResponse(JSON.stringify(json, null, 2));
      })
      .catch((error) => {
        setResponse(JSON.stringify({ error: error.message }, null, 2));
      })
      .finally(async () => {
        setisLoading(false);
      });
  };

  const getCustomRpcUrl = () => {
    // get custom rpc url from local storage
    const customRpcUrl = localStorage.getItem("customRpcUrl");
    if (customRpcUrl) {
      setRpcUrl(customRpcUrl);
      setUseCustomRpcUrl(true);
    }
  };

  useEffect(() => {
    getCustomRpcUrl();
  }, []);

  useEffect(() => {
    const responseJSON = JSON.parse(response);
    const decodedResponseJSON = responseJSON.result
      ? { result: responseJSON.result }
      : { error: responseJSON.error };
    setDecodedResponse(JSON.stringify(decodedResponseJSON, null, 2));
  }, [response]);

  useEffect(() => {
    const updateStarknetJsParams = (currentParamsObj: {
      [key: string]: any;
    }) => {
      const regexPattern = /provider\.(\w+)\(([^)]*)\)/;
      const codeSnippet = method.starknetJs;

      const updatedCode = codeSnippet.replace(
        regexPattern,
        (match, methodName, params) => {
          const values = Object.entries(currentParamsObj).flatMap(
            ([key, value]) => {
              if (typeof value === "object" && !Array.isArray(value)) {
                // If value is an object, return its stringified values
                return Object.values(value).map((val) =>
                  typeof val === "string" ? `"${val}"` : val
                );
              } else if (typeof value === "string") {
                // If value is a string, return it with quotes
                return `"${value}"`;
              }
              return value; // Return other types (like numbers) as is
            }
          );

          let stringifiedParams = values.join(", ");
          return `provider.${methodName}(${stringifiedParams})`;
        }
      );

      return updatedCode;
    };

    const updateStarknetGoParams = (currentParamsObj: {
      [key: string]: any;
    }) => {
      return method.starknetGo; // TODO: Implement this
    };

    const updateStarknetRsParams = (currentParamsObj: {
      [key: string]: any;
    }) => {
      const regexPattern = /provider\s*\.(\w+)\(\s*([\s\S]*)\s*\)\s*\.await;/;
      const codeSnippet = method.starknetRs;

      const updatedCode = codeSnippet.replace(
        regexPattern,
        (match, methodName, params) => {
          const values = Object.entries(currentParamsObj).flatMap(
            ([key, value]) => {
              if (key === "block_id") {
                return formatStarknetRsParamsBlockId(value);
              } else if (key === "invoke_transaction") {
                return formatStarknetRsParamsInvokeTransaction(value);
              } else if (key === "declare_transaction") {
                return formatStarknetRsParamsDeclareTransaction(value);
              } else if (key === "deploy_account_transaction") {
                return formatStarknetRsParamsDeployAccountTransaction(value);
              } else if (key === "transactions") {
                return formatStarknetRsParamsTransactions(value);
              } else if (key === "simulation_flags") {
                return formatStarknetRsParamsSimulationFlags(value);
              } else if (typeof value === "object" && !Array.isArray(value)) {
                // If value is an object, return its stringified values
                return Object.values(value).map((val) => {
                  if (typeof val === "string") {
                    if (val.startsWith("0x")) {
                      return `felt!("${val}")`;
                    }
                    return `"${val}"`;
                  }
                  return val;
                });
              } else if (typeof value === "string") {
                if (value.startsWith("0x")) {
                  return `felt!("${value}")`;
                }
                // If value is a string, return it with quotes
                return `"${value}"`;
              }
              return value; // Return other types (like numbers) as is
            }
          );

          let stringifiedParams = values.join(", ");
          return `provider
    .${methodName}(${stringifiedParams})
    .await;`;
        }
      );

      return updatedCode;
    };

    const updateMethod = (methodName: string, latestParamsArray: any) => {
      const params = constructParamsArray(latestParamsArray);
      const jsonObject = {
        jsonrpc: "2.0",
        method: methodName,
        params,
        id: 1,
      };
      const jsonDataString = JSON.stringify(jsonObject, null, 4);
      setRawRequest(jsonDataString);

      const oldRpcUrl = extractRpcUrl(curlRequest);
      // replace the old rpc url with the new one in the curl request
      if (oldRpcUrl) {
        updateRpcUrl(rpcUrl, oldRpcUrl);
      }

      let newRpcUrl = getRpcUrl(rpcUrl);
      const curlPart = `curl --location '${newRpcUrl}' \\\n`;
      const curlCommand = `${curlPart}${CURL_HEADER}\n--data '${jsonDataString}'`;
      setCurlRequest(curlCommand);

      const newStarknetJsRequest = updateStarknetJsParams(params);
      setStarknetJs(newStarknetJsRequest);

      const newStarknetGoRequest = updateStarknetGoParams(params);
      setStarknetGo(newStarknetGoRequest);

      const newStarknetRsRequest = updateStarknetRsParams(params);
      setStarknetRs(newStarknetRsRequest);
    };

    updateMethod(method.name, paramsArray);
  }, [method, paramsArray, rpcUrl, apiKey]);

  /** --------------------------------ENSURE INPUT FOCUS-------------------------------- */

  // Initialize a refs map
  const inputRefs = useRef({});
  const [inputFocused, setInputFocused] = useState(false);
  const [focusKey, setFocusKey] = useState("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState<
    number | null
  >();

  // Function to create a unique identifier for each input
  const createRefKey = (index: number, subKey: string | number = "") =>
    `${index}-${subKey}`;

  // Function to focus an input
  const focusInput = (key: string) => {
    setTimeout(() => {
      const inputElement = (
        inputRefs.current as { [key: string]: HTMLInputElement }
      )[key];
      if (inputElement) {
        inputElement.focus();

        if (
          currentCursorPosition !== undefined &&
          currentCursorPosition !== null
        ) {
          // Restore the cursor position after the component re-renders
          inputElement.selectionStart = currentCursorPosition;
          inputElement.selectionEnd = currentCursorPosition;
        }
      }
    }, 0);
  };

  useEffect(() => {
    if (inputFocused) {
      focusInput(focusKey);
      setInputFocused(false); // Reset the trigger
    }
  }, [inputFocused, focusKey]);

  /** --------------------------------ENSURE INPUT FOCUS-------------------------------- */

  const handlePlaceholderChange = (
    placeholder: string | number | Array<string | number>,
    newValue: any
  ) => {
    if (typeof placeholder === "number") {
      return newValue === "0x" ? 0 : parseInt(newValue);
    } else if (Array.isArray(placeholder)) {
      return newValue.split(",");
    }
    return newValue;
  };

  const handleOrdinaryParamChange = (
    value: string | number | Array<string | number>,
    index: number,
    key?: string | number,
    cursorPosition?: number
  ) => {
    setCurrentCursorPosition(cursorPosition);

    setParamsArray((prevParamsArray) => {
      const updatedParamsArray = structuredClone(prevParamsArray);
      if (key === undefined) {
        let placeholder = updatedParamsArray[index]?.value?.placeholder;
        placeholder = handlePlaceholderChange(placeholder, value);
        updatedParamsArray[index].value.placeholder = placeholder;
      } else {
        let placeholder = updatedParamsArray[index]?.value[key]?.placeholder;
        placeholder = handlePlaceholderChange(placeholder, value);
        updatedParamsArray[index].value[key].placeholder = placeholder;
      }
      return updatedParamsArray;
    });

    setFocusKey(createRefKey(index, key));
    setInputFocused(true);
  };

  const handleObjectParamChange = (
    value: string | number | Array<string | number>,
    index: number,
    key: string,
    subKey?: number | string,
    selectedIdx?: number,
    cursorPosition?: number
  ) => {
    setCurrentCursorPosition(cursorPosition);

    setParamsArray((prevParamsArray) => {
      const updatedParamsArray = structuredClone(prevParamsArray);

      if (subKey === undefined) {
        if (selectedIdx === undefined) {
          let placeholder = updatedParamsArray[index]?.value[key]?.placeholder;

          placeholder = handlePlaceholderChange(placeholder, value);

          updatedParamsArray[index].value[key].placeholder = placeholder;

          return updatedParamsArray;
        } else {
          let placeholder =
            updatedParamsArray[index]?.value.value[selectedIdx].fields[key]
              ?.placeholder;

          placeholder = handlePlaceholderChange(placeholder, value);

          updatedParamsArray[index].value.value[selectedIdx].fields[
            key
          ].placeholder = placeholder;

          return updatedParamsArray;
        }
      } else {
        if (selectedIdx === undefined) {
          let placeholder =
            updatedParamsArray[index]?.value[subKey][key]?.placeholder;

          placeholder = handlePlaceholderChange(placeholder, value);

          updatedParamsArray[index].value[subKey][key].placeholder =
            placeholder;

          return updatedParamsArray;
        } else {
          let placeholder =
            updatedParamsArray[index]?.value[subKey].value[selectedIdx].fields[
              key
            ]?.placeholder;

          placeholder = handlePlaceholderChange(placeholder, value);

          updatedParamsArray[index].value[subKey].value[selectedIdx].fields[
            key
          ].placeholder = placeholder;

          return updatedParamsArray;
        }
      }
    });

    setFocusKey(createRefKey(index, key));
    setInputFocused(true);
  };

  const FormatInputField = ({
    param,
    index,
    subKey,
    selectedIdx,
  }: {
    param: any;
    index: number;
    subKey?: string | number;
    selectedIdx?: number;
  }) => {
    const setRef = (el: any, index: number, subKey: string | number = "") => {
      if (el) {
        (inputRefs.current as { [key: string]: HTMLInputElement })[
          createRefKey(index, subKey)
        ] = el;
      }
    };

    return (
      <>
        {
          // check if param.value is not an array and also doesn't have a description
          // That means it is an object
          !param.description ? (
            Object.entries(param).map(([key, value]: any) => (
              <div key={key}>
                <p className="mt-3">{formatName(key)}</p>
                <p className="mt-3 text-xs">{value.description}</p>
                {Array.isArray(value.placeholder) ? (
                  <textarea
                    ref={(el) => setRef(el, index, key)}
                    value={value.placeholder?.join(",")}
                    onChange={(e) => {
                      handleObjectParamChange(
                        e.target.value || "0x",
                        index,
                        key,
                        subKey,
                        selectedIdx,
                        e.target.selectionStart
                      );
                    }}
                    className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                  />
                ) : (
                  <div>
                    {value.placeholder === undefined ? (
                      <FormatInputField
                        param={value}
                        index={index}
                        subKey={key}
                      />
                    ) : (
                      <input
                        ref={(el) => setRef(el, index, key)}
                        value={value.placeholder}
                        onChange={(e) => {
                          handleObjectParamChange(
                            e.target.value || "0x",
                            index,
                            key,
                            subKey,
                            selectedIdx
                          );
                        }}
                        className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              {param.value?.length > 0 ? (
                <div>
                  <select
                    value={param.value[param.index].name}
                    onChange={(e) => {
                      setParamsArray((prevParamsArray) => {
                        const updatedParamsArray =
                          structuredClone(prevParamsArray);

                        if (subKey === undefined) {
                          updatedParamsArray[index].value.index =
                            e.target.selectedIndex;
                        } else {
                          updatedParamsArray[index].value[subKey].index =
                            e.target.selectedIndex;
                        }

                        return updatedParamsArray;
                      });
                    }}
                    className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                  >
                    {
                      // @ts-ignore
                      param.value?.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.name}
                        </option>
                      ))
                    }
                  </select>
                  {param.value[param.index].enum ? (
                    <select
                      onChange={(e) => {
                        setParamsArray((prevParamsArray) => {
                          const updatedParamsArray =
                            structuredClone(prevParamsArray);
                          let selectedIndex =
                            updatedParamsArray[index].value.index;
                          if (subKey === undefined) {
                            let value: string | number =
                              updatedParamsArray[index].value?.value[
                                selectedIndex
                              ].placeholder;

                            value =
                              typeof value === "number"
                                ? parseInt(e.target.value)
                                : e.target.value;

                            updatedParamsArray[index].value.value[
                              selectedIndex
                            ].placeholder = value;
                          } else {
                            selectedIndex =
                              updatedParamsArray[index]?.value[subKey]?.index;
                            let value: string | number =
                              updatedParamsArray[index]?.value[subKey]?.value[
                                selectedIndex
                              ].placeholder;

                            value =
                              typeof value === "number"
                                ? parseInt(e.target.value)
                                : e.target.value;

                            updatedParamsArray[index].value[subKey].value[
                              selectedIndex
                            ].placeholder = value;
                          }

                          return updatedParamsArray;
                        });
                      }}
                      className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      value={param.value[param.index]?.placeholder}
                    >
                      {param.value[param.index].enum.map(
                        (option: string, index: number) => (
                          <option key={index} value={option}>
                            {option.toUpperCase()}
                          </option>
                        )
                      )}
                    </select>
                  ) : param.value[param.index].fields ? (
                    <FormatInputField
                      param={param.value[param.index].fields}
                      index={index}
                      subKey={subKey}
                      selectedIdx={param.index}
                    />
                  ) : (
                    <input
                      ref={(el) => setRef(el, index, subKey)}
                      onChange={(e) => {
                        setCurrentCursorPosition(e.target.selectionStart);

                        setParamsArray((prevParamsArray) => {
                          const updatedParamsArray =
                            structuredClone(prevParamsArray);

                          let selectedIndex =
                            updatedParamsArray[index].value.index;
                          if (subKey === undefined) {
                            let value: string | number =
                              updatedParamsArray[index].value?.value[
                                selectedIndex
                              ].placeholder;

                            value =
                              typeof value === "number"
                                ? parseInt(e.target.value)
                                : e.target.value;

                            updatedParamsArray[index].value.value[
                              selectedIndex
                            ].placeholder = value;
                          } else {
                            selectedIndex =
                              updatedParamsArray[index]?.value[subKey]?.index;
                            let value: string | number =
                              updatedParamsArray[index]?.value[subKey]?.value[
                                selectedIndex
                              ].placeholder;

                            value =
                              typeof value === "number"
                                ? parseInt(e.target.value)
                                : e.target.value;

                            updatedParamsArray[index].value[subKey].value[
                              selectedIndex
                            ].placeholder = value;
                          }

                          return updatedParamsArray;
                        });

                        setFocusKey(createRefKey(index, subKey));
                        setInputFocused(true);
                      }}
                      className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      value={
                        Array.isArray(param.value[param.index]?.placeholder)
                          ? param.value[param.index]?.placeholder?.join(",")
                          : param.value[param.index]?.placeholder
                      }
                    />
                  )}
                </div>
              ) : (
                <div>
                  {Array.isArray(param.placeholder) ? (
                    <textarea
                      ref={(el) => setRef(el, index, subKey)}
                      onChange={(e) => {
                        handleOrdinaryParamChange(
                          e.target.value || "0x",
                          index,
                          subKey,
                          e.target.selectionStart
                        );
                      }}
                      className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      value={param.placeholder?.join(",")}
                    />
                  ) : (
                    <input
                      ref={(el) => setRef(el, index, subKey)}
                      onChange={(e) => {
                        handleOrdinaryParamChange(
                          e.target.value || "0x",
                          index,
                          subKey
                        );
                      }}
                      className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      value={param.placeholder}
                    />
                  )}
                </div>
              )}
            </>
          )
        }
      </>
    );
  };

  return (
    <>
      <div className="lg:flex lg:m-5 md:m-3 bg-gray-bg text-sm">
        <div className="sm:w-full lg:w-1/3 p-3">
          <h2 className="my-2 text-lg">Configure Request</h2>
          <div className="my-5">
            {useCustomRpcUrl ? (
              <div>
                <input
                  onChange={(e) => {
                    let oldRpcUrl = rpcUrl;
                    let newRpcUrl = e.target.value;

                    // store custom rpc url in local storage
                    localStorage.setItem("customRpcUrl", newRpcUrl);

                    setRpcUrl(newRpcUrl);
                    updateRpcUrl(newRpcUrl, oldRpcUrl);
                  }}
                  className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full"
                  value={rpcUrl}
                />
                <p
                  onClick={() => {
                    setUseCustomRpcUrl(!useCustomRpcUrl);
                    setRpcUrl(MAINNET_RPC_URL);
                  }}
                  className="text-sm my-3 text-[#ff4b00] cursor-pointer"
                >
                  Use default RPC URL
                </p>
              </div>
            ) : (
              <div>
                <select
                  onChange={(e) => {
                    let oldRpcUrl = rpcUrl;
                    setRpcUrl(e.target.value);
                    updateRpcUrl(e.target.value, oldRpcUrl);
                  }}
                  className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full"
                >
                  <option value={MAINNET_RPC_URL}>Mainnet</option>
                  <option value={GOERLI_RPC_URL}>Goerli</option>
                  <option value={SEPOLIA_RPC_URL}>Sepolia</option>
                </select>
                <p
                  onClick={() => {
                    getCustomRpcUrl();
                    setUseCustomRpcUrl(!useCustomRpcUrl);
                  }}
                  className="text-sm my-3 text-[#ff4b00] cursor-pointer"
                >
                  Use custom RPC URL
                </p>
              </div>
            )}
            {isUrlFromNethermindDomain(rpcUrl) && (
              <div>
                <input
                  onChange={(e) => {
                    const newApiKey = e.target.value;
                    setApiKey(newApiKey);
                  }}
                  className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                  placeholder="API Key"
                  type="password"
                />

                <p className="text-sm my-3 text-[#ff4b00] cursor-pointer">
                  <a
                    href="https://voyager.online/?signin=true&utm_campaign=rpc-request-builder"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Free API Key
                  </a>
                </p>
              </div>
            )}
            <select
              onChange={(e) => {
                const index = parseInt(e.target.value);
                const latestParamsArray = Methods[index].params
                  ? transformParamsToArray(Methods[index].params)
                  : [];

                setMethod(Methods[index]);
                setParamsArray(latestParamsArray);
              }}
              className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
            >
              {Methods.map((method, index) => (
                <option key={method.name} value={index}>
                  {method.name}
                </option>
              ))}
            </select>
            {
              // Loops through all parameters and renders them
              paramsArray.map((param, index) => (
                <div key={index}>
                  <p className="mt-3">{formatName(param.name)}</p>
                  <p className="mt-3 text-xs">{param.value?.description}</p>
                  {Array.isArray(param.value) ? (
                    <>
                      {param.value.map((option: any, ind: number) => (
                        <div className="mt-3" key={ind}>
                          <p>Option {ind}</p>
                          <FormatInputField
                            param={option}
                            index={index}
                            subKey={ind}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setParamsArray((prevParamsArray) => {
                            const updatedParamsArray =
                              structuredClone(prevParamsArray);
                            updatedParamsArray[index].value.push(
                              structuredClone(
                                updatedParamsArray[index].value[0]
                              )
                            );
                            return updatedParamsArray;
                          });
                        }}
                        className="bg-[#3e3e43] text-white rounded-sm p-2 w-full mt-2"
                      >
                        Add another option
                      </button>
                    </>
                  ) : (
                    <>
                      <FormatInputField param={param.value} index={index} />
                    </>
                  )}
                </div>
              ))
            }
            <button
              onClick={() => {
                sendRequest();
              }}
              className="bg-[#3e3e43] text-white rounded-sm p-2 w-1/2 mt-2"
              disabled={isLoading}
            >
              Send Request
            </button>
          </div>
        </div>
        <div className="lg:w-2/3">
          <div>
            <h2 className="p-3 mt-3 text-lg">Request Preview</h2>
            <div className="lg:m-5 md:m-3 bg-[#232326] rounded">
              <ul className="flex">
                <li
                  onClick={() => setRequestTab("raw")}
                  className="p-3 cursor-pointer"
                >
                  Raw
                </li>
                <li
                  onClick={() => setRequestTab("curl")}
                  className="p-3 cursor-pointer"
                >
                  cURL
                </li>
                {method.starknetJs && (
                  <li
                    onClick={() => setRequestTab("starknetJs")}
                    className="p-3 cursor-pointer"
                  >
                    starknet.js
                  </li>
                )}
                {method.starknetGo && (
                  <li
                    onClick={() => setRequestTab("starknetGo")}
                    className="p-3 cursor-pointer"
                  >
                    starknet.go
                  </li>
                )}
                {method.starknetRs && (
                  <li
                    onClick={() => setRequestTab("starknetRs")}
                    className="p-3 cursor-pointer"
                  >
                    starknet.rs
                  </li>
                )}
              </ul>
              <div className="bg-[#1e1e1e]">
                <button
                  onClick={() => copyToClipboard("request")}
                  className="p-3 float-right"
                >
                  Copy
                </button>
                {requestTab == "raw" && (
                  <Editor
                    height="30vh"
                    language="json"
                    theme="vs-dark"
                    value={rawRequest}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
                {requestTab == "curl" && (
                  <Editor
                    height="30vh"
                    language="shell"
                    theme="vs-dark"
                    value={curlRequest}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
                {requestTab == "starknetJs" && (
                  <Editor
                    height="50vh"
                    language="javascript"
                    theme="vs-dark"
                    value={starknetJs}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
                {requestTab == "starknetGo" && (
                  <Editor
                    height="50vh"
                    language="go"
                    theme="vs-dark"
                    value={starknetGo}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
                {requestTab == "starknetRs" && (
                  <Editor
                    height="50vh"
                    language="rust"
                    theme="vs-dark"
                    value={starknetRs}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <h2 className="p-3 text-lg">Response Preview</h2>
            <div className="lg:m-5 md:m-3 bg-[#232326] rounded">
              <ul className="flex">
                <li
                  onClick={() => setResponseTab("raw")}
                  className="p-3 cursor-pointer"
                >
                  Raw
                </li>
                <li
                  onClick={() => setResponseTab("decoded")}
                  className="p-3 cursor-pointer"
                >
                  Decoded
                </li>
              </ul>
              <div className="bg-[#1e1e1e]">
                <button
                  onClick={() => copyToClipboard("response")}
                  className="p-3 float-right"
                >
                  Copy
                </button>
                {responseTab == "raw" && (
                  <Editor
                    height="30vh"
                    language="json"
                    theme="vs-dark"
                    value={isLoading ? "Loading..." : response}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
                {responseTab == "decoded" && (
                  <Editor
                    height="30vh"
                    language="json"
                    theme="vs-dark"
                    value={isLoading ? "Loading..." : decodedResponse}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      scrollbar: {
                        horizontal: "hidden",
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Builder;
