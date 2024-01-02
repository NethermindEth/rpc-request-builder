"use client";

import { useState, useEffect } from "react";
import { Methods } from "@/api/rpcspec";
import Editor from "@monaco-editor/react";
import {
  MAINNET_RPC_URL,
  GOERLI_RPC_URL,
  SEPOLIA_RPC_URL,
  DEFAULT_CURL_REQUEST,
  DEFAULT_STARKNET_JS_REQUEST,
  DEFAULT_RAW_REQUEST,
  DEFAULT_RAW_RESPONSE,
  DEFAULT_DECODED_RESPONSE,
} from "./constant";
import { selector } from "starknet";

const formatName = (name: string) => {
  // Make first letter uppercase
  name = name.charAt(0).toUpperCase() + name.slice(1);
  // turn _ into space
  return name.replace(/_/g, " ");
};

const Builder = () => {
  const transformParamsToArray = (params: any) => {
    const transformParam = (param: any) => {
      if (param.description) {
        if (param.oneOf) {
          return {
            description: param.description,
            placeholder: param.placeholder,
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
            value: [],
          };
        }
      } else if (!param.placeholder && !param.description) {
        let params = [];
        for (const [key, value] of Object.entries(param)) {
          params.push({
            name: key,
            value: {
              description: (value as any).description,
              placeholder: (value as any).placeholder,
              value: [],
            },
          });
        }

        return params;
      }
      return {};
    };

    return params
      ? Object.entries(params).flatMap(([name, value]) => {
          if (Array.isArray(value)) {
            return value.map((param: any) => ({
              name,
              value: transformParam(param),
            }));
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

  const [requestTab, setRequestTab] = useState("raw");
  const [starknetJs, setStarknetJs] = useState(DEFAULT_STARKNET_JS_REQUEST);
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
          : starknetJs
      );
    } else {
      navigator.clipboard.writeText(response);
    }
  };

  const updateRpcUrl = (newRpcUrl: string, oldRpcUrl: string) => {
    // remove everything before the first \
    let dataPart = curlRequest.split("\\")[1];
    let urlPart = `curl --location '${newRpcUrl}' \\`;

    let newCurlRequest = urlPart + dataPart;
    setCurlRequest(newCurlRequest);

    // Replace oldRpcUrl with newRpcUrl
    let newStarknetJs = starknetJs.replace(oldRpcUrl, newRpcUrl);
    setStarknetJs(newStarknetJs);

    // update all methods as well
    Methods.forEach((method) => {
      let newStarknetJs = method.starknetJs.replace(oldRpcUrl, newRpcUrl);
      method.starknetJs = newStarknetJs;
    });
    return newCurlRequest;
  };

  const constructParams = (latestParamsArray: any) => {
    let params: any = [];
    latestParamsArray.forEach((param: any) => {
      if (Array.isArray(param.value)) {
        let p = {};
        param.value.forEach((val: any) => {
          let placeholder = val.value?.placeholder;
          if (val.name == "entry_point_selector") {
            placeholder = selector.getSelectorFromName(placeholder);
          }

          p = {
            ...p,
            [val.name]: placeholder,
          };
        });
        params.push(p);
      } else if (param.value?.value?.length > 0) {
        const selectedOption = param.value?.value[param?.value?.index];
        const isEnum = selectedOption.enum ? true : false;
        if (isEnum) {
          params.push(selectedOption.placeholder);
        } else {
          let placeholder = selectedOption.placeholder;
          if (selectedOption.name == "entry_point_selector") {
            placeholder = selector.getSelectorFromName(placeholder);
          }

          const p = {
            [selectedOption.name]: placeholder,
          };
          params.push(p);
        }
      } else {
        params.push(param.value?.placeholder);
      }
    });

    return params;
  };

  const sendRequest = async () => {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rawRequest,
    });
    const json = await response.json();
    setResponse(JSON.stringify(json, null, 2));
  };

  useEffect(() => {
    const responseJSON = JSON.parse(response);
    const decodedResponseJSON = responseJSON.result
      ? { result: responseJSON.result }
      : { error: responseJSON.error };
    setDecodedResponse(JSON.stringify(decodedResponseJSON, null, 2));
  }, [response]);

  useEffect(() => {
    const updateStarknetJsParams = (currentParamsArray: Array<any>) => {
      const regexPattern = /provider\.(\w+)\(([^)]*)\)/;
      const codeSnippet = method.starknetJs;

      // TODO: Modify this so it can support starknet.js for methods with nested params
      const updatedCode = codeSnippet.replace(
        regexPattern,
        (match, methodName, params) => {
          const values = currentParamsArray.map((item) => {
            // Check if the item is an object
            if (item && typeof item === "object" && !Array.isArray(item)) {
              const objectItem = Object.values(item)[0];
              if (typeof objectItem === "string") {
                return `"${Object.values(item)}"`;
              } else if (typeof objectItem === "number") {
                return Object.values(item);
              }
              return item;
            } else {
              if (item && typeof item === "string") {
                return `"${item}"`;
              }
              return item;
            }
          });

          let stringifiedParams = values.join(", ");

          return `provider.${methodName}(${stringifiedParams})`;
        }
      );

      return updatedCode;
    };

    const updateMethod = (methodName: string, latestParamsArray: any) => {
      const params = constructParams(latestParamsArray);
      const jsonObject = {
        jsonrpc: "2.0",
        method: methodName,
        params,
        id: 1,
      };
      const jsonDataString = JSON.stringify(jsonObject, null, 4);

      const curlPart = `curl --location '${rpcUrl}' \\\n`;
      const curlCommand = `${curlPart}--data '${jsonDataString}'`;
      const newStarknetJsParams = updateStarknetJsParams(params);
      setRawRequest(jsonDataString);
      setCurlRequest(curlCommand);
      setStarknetJs(newStarknetJsParams);
    };

    updateMethod(method.name, paramsArray);
  }, [method, paramsArray, rpcUrl]);

  return (
    <>
      <div className="lg:flex m-5 bg-gray-bg text-sm">
        <div className="w-1/3 p-3">
          <h2 className="my-2 text-lg">Configure Request</h2>
          <div className="my-5">
            {useCustomRpcUrl ? (
              <div>
                <input
                  onChange={(e) => {
                    let oldRpcUrl = rpcUrl;
                    setRpcUrl(e.target.value);
                    updateRpcUrl(e.target.value, oldRpcUrl);
                  }}
                  className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full"
                  value={rpcUrl}
                />
                <p
                  onClick={() => setUseCustomRpcUrl(!useCustomRpcUrl)}
                  className="text-xs my-3 text-cyan-400 cursor-pointer"
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
                  onClick={() => setUseCustomRpcUrl(!useCustomRpcUrl)}
                  className="text-xs my-3 text-cyan-400 cursor-pointer"
                >
                  Use custom RPC URL
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
                  {
                    // some parameters have sub-parameters. Render the description if it doesn't
                    !Array.isArray(param.value) && (
                      <p className="mt-3">{param.value?.description}</p>
                    )
                  }
                  {Array.isArray(param.value) ? (
                    // sub-parameters are rendered here
                    <div>
                      {param.value.map((val, ind) => {
                        return (
                          <div key={ind}>
                            <p className="mt-3">{formatName(val.name)}</p>
                            <p className="mt-3">{val.value?.description}</p>
                            <input
                              onChange={(e) => {
                                setParamsArray((prevParamsArray) => {
                                  const updatedParamsArray = JSON.parse(
                                    JSON.stringify(prevParamsArray)
                                  );

                                  // Reference to the specific placeholder
                                  let placeholder =
                                    updatedParamsArray[index].value[ind].value
                                      .placeholder;

                                  // Check the type and update the placeholder accordingly
                                  if (typeof placeholder === "number") {
                                    placeholder = parseInt(e.target.value);
                                  } else if (Array.isArray(placeholder)) {
                                    placeholder = e.target.value.split(",");
                                  } else {
                                    placeholder = e.target.value;
                                  }

                                  // Update the placeholder in the deep structure
                                  updatedParamsArray[index].value[
                                    ind
                                  ].value.placeholder = placeholder;

                                  return updatedParamsArray;
                                });
                              }}
                              className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                              value={
                                Array.isArray(val.value?.placeholder)
                                  ? val.value?.placeholder.join(",")
                                  : val.value?.placeholder
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : param.value?.value?.length > 0 ? (
                    <div>
                      <select
                        defaultValue={param.value?.value[0].name}
                        onChange={(e) => {
                          setParamsArray((prevParamsArray) => {
                            const updatedParamsArray = [...prevParamsArray];
                            (
                              updatedParamsArray[index].value as { index: any }
                            ).index = e.target.selectedIndex;
                            return updatedParamsArray;
                          });
                        }}
                        className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                      >
                        {
                          // @ts-ignore
                          param.value?.value?.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.name}
                            </option>
                          ))
                        }
                      </select>
                      <input
                        onChange={(e) => {
                          setParamsArray((prevParamsArray) => {
                            const updatedParamsArray = JSON.parse(
                              JSON.stringify(prevParamsArray)
                            );
                            const selectedIndex =
                              updatedParamsArray[index].value.index;
                            let value: string | number =
                              updatedParamsArray[index].value?.value[
                                selectedIndex
                              ].placeholder;
                            if (typeof value == "number") {
                              value = parseInt(e.target.value);
                            } else {
                              value = e.target.value;
                            }
                            updatedParamsArray[index].value.value[
                              selectedIndex
                            ].placeholder = value;

                            return updatedParamsArray;
                          });
                        }}
                        className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                        value={
                          Array.isArray(
                            param.value?.value[param?.value?.index]?.placeholder
                          )
                            ? param.value?.value[
                                param?.value?.index
                              ]?.placeholder?.join(",")
                            : param.value?.value[param?.value?.index]
                                ?.placeholder
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      {Array.isArray(param.value?.placeholder) ? (
                        <>
                          {param.value?.placeholder?.map(
                            (placeholder, index) => (
                              <input
                                key={index}
                                onChange={(e) => {
                                  setParamsArray((prevParamsArray) => {
                                    const updatedParamsArray = JSON.parse(
                                      JSON.stringify(prevParamsArray)
                                    );
                                    let value: string | number =
                                      updatedParamsArray[index].value
                                        .placeholder;
                                    if (typeof value == "number") {
                                      value = parseInt(e.target.value);
                                    } else {
                                      value = e.target.value;
                                    }

                                    updatedParamsArray[
                                      index
                                    ].value.placeholder = value;

                                    return updatedParamsArray;
                                  });
                                }}
                                className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                                value={
                                  Array.isArray(placeholder)
                                    ? placeholder.join(",")
                                    : placeholder
                                }
                              />
                            )
                          )}
                        </>
                      ) : (
                        <input // TODO: Remove duplicate code
                          onChange={(e) => {
                            setParamsArray((prevParamsArray) => {
                              const updatedParamsArray = JSON.parse(
                                JSON.stringify(prevParamsArray)
                              );
                              let value: string | number =
                                updatedParamsArray[index].value.placeholder;
                              if (typeof value == "number") {
                                value = parseInt(e.target.value);
                              } else {
                                value = e.target.value;
                              }

                              updatedParamsArray[index].value.placeholder =
                                value;

                              return updatedParamsArray;
                            });
                          }}
                          className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                          value={
                            Array.isArray(param.value?.placeholder)
                              ? param.value?.placeholder.join(",")
                              : param.value?.placeholder
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            }

            <button
              onClick={() => {
                sendRequest();
              }}
              className="bg-[#3e3e43] text-white rounded-sm p-2 w-1/2 mt-2"
            >
              Send Request
            </button>
          </div>
        </div>
        <div className="w-2/3">
          <div>
            <h2 className="p-3 text-lg">Request Preview</h2>
            <div className="m-5 bg-[#232326] rounded">
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
                {requestTab == "starknetJs" && (
                  <Editor
                    height="30vh"
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
              </div>
            </div>
          </div>
          <div>
            <h2 className="p-3 text-lg">Response Preview</h2>
            <div className="m-5 bg-[#232326] rounded">
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
                    value={response}
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
                    value={decodedResponse}
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

const InputField = ({
  onChange,
  defaultValue,
  className,
}: {
  onChange: any;
  defaultValue: any;
  className: any;
}) => (
  <input
    onChange={onChange}
    className={className}
    defaultValue={defaultValue}
  />
);

export default Builder;
