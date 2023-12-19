"use client";

import { useState, useEffect } from "react";
import { Chain } from "./types";
import { Methods } from "@/api/rpcspec";

const transformParamsToArray = (params: any) => {
  return params
    ? Object.entries(params).map(([name, type]) => ({ name, type }))
    : [];
};

const Builder = () => {
  const [method, setMethod] = useState(Methods[0]);
  const [paramsArray, setParamsArray] = useState(
    Methods[0].params ? transformParamsToArray(Methods[0].params) : []
  );
  const [curl, setCurl] = useState("");
  const [starknetJs, setStarknetJs] = useState("");
  const [response, setResponse] = useState("");
  const [requestTab, setRequestTab] = useState("curl");

  return (
    <>
      <div className="flex m-5 bg-gray-bg text-sm">
        <div className="w-1/3 p-3">
          <h2 className="my-2 text-lg">Configure Request</h2>
          <div className="my-5">
            <select className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full">
              <option>Mainnet</option>
              <option>Goerli</option>
              <option>Sepolia</option>
            </select>
            <select
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setMethod(Methods[index]);
                setParamsArray(
                  Methods[index].params
                    ? transformParamsToArray(Methods[index].params)
                    : []
                );
              }}
              className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
            >
              {Methods.map((method, index) => (
                <option key={method.name} value={index}>
                  {method.name}
                </option>
              ))}
            </select>
            {paramsArray.map((param, index) => (
              <input
                key={index}
                className="bg-gray-bg border border-[#3e3e43] rounded-sm p-2 w-full mt-2"
                placeholder={param.name}
                onChange={(e) => {}}
              />
            ))}

            <button className="bg-[#3e3e43] text-white rounded-sm p-2 w-full mt-2">
              Send Request
            </button>
          </div>
        </div>
        <div className="w-2/3">
          <h2 className="p-3 text-lg">Request Preview</h2>
          <div className="m-5 bg-[#232326] rounded">
            <ul className="flex">
              <li className="p-3">Raw</li>
              <li className="p-3">cURL</li>
              <li className="p-3">starknet.js</li>
            </ul>
            <pre className="whitespace-pre-wrap bg-[#161618] p-6 h-72 leading-custom">
              hbwk
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default Builder;
