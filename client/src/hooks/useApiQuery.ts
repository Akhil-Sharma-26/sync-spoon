import {
  useQuery,
  useMutation,
  UseQueryOptions
} from "@tanstack/react-query";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Generic function to fetch data

export const useApiQuery = <TData>(
  key: string[],
  url: string,
  config?: AxiosRequestConfig,
  options?: UseQueryOptions<TData>
) => {
  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await axios.get<TData>(url, config);
      return data;
    },
  ...options,
  });
};

export const useApiMutation = <
  TData,
  TVariables extends Record<string, unknown>
>(
  url: string,
  method: "post" | "put" | "patch" | "delete" = "post",
  config?: AxiosRequestConfig
) => {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const requestConfig: AxiosRequestConfig = {
        ...config,
        data: variables,
      };

      const response: AxiosResponse<TData> = await axios.request({
        url,
        method,
        ...requestConfig,
      });
      return response.data;
    },
  });
};
